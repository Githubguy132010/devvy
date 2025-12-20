import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { configManager } from '../config/index.js';
import { toolRegistry, type ToolResult } from '../tools/index.js';
import { toolSpinner } from '../cli/spinner.js';
import { ConfigError, LLMError, APIError, ToolError } from './errors.js';
import { logger } from './logger.js';
import { retry, CircuitBreaker, type RetryOptions } from './retry.js';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface LLMResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ModelInfo {
  id: string;
  owned_by?: string;
}

export interface ChatOptions {
  temperature?: number;
  tools?: boolean;
}

export class LLMClient {
  private client: OpenAI | null = null;
  private circuitBreaker = new CircuitBreaker({
    failureThreshold: 3,
    recoveryTimeout: 30000,
    monitoringPeriod: 10000,
  });

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = configManager.apiKey;
      if (!apiKey) {
        const error = new ConfigError('API key not configured. Run "devvy config set-key" to configure your API key.', {
          missingConfig: 'apiKey'
        });
        logger.error(error);
        throw error;
      }

      this.client = new OpenAI({
        apiKey,
        baseURL: configManager.apiBaseUrl,
      });
    }
    return this.client;
  }

  private formatMessages(messages: LLMMessage[]): ChatCompletionMessageParam[] {
    return messages.map((m): ChatCompletionMessageParam => {
      if (m.role === 'tool') {
        return {
          role: 'tool',
          content: m.content || '',
          tool_call_id: m.tool_call_id || '',
        };
      }
      if (m.role === 'assistant' && m.tool_calls) {
        return {
          role: 'assistant',
          content: m.content,
          tool_calls: m.tool_calls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments,
            },
          })),
        };
      }
      if (m.role === 'assistant') {
        return {
          role: 'assistant',
          content: m.content,
        };
      }
      if (m.role === 'system') {
        return {
          role: 'system',
          content: m.content || '',
        };
      }
      // user
      return {
        role: 'user',
        content: m.content || '',
      };
    });
  }

  async fetchModels(): Promise<ModelInfo[]> {
    const client = this.getClient();

    const retryOptions: RetryOptions = {
      maxAttempts: 3,
      baseDelay: 2000,
      maxDelay: 10000,
      retryableErrors: (error: unknown) => {
        const errorMsg = error instanceof Error ? error.message : String(error);
        return errorMsg.includes('timeout') || 
               errorMsg.includes('rate limit') || 
               errorMsg.includes('connection');
      },
    };

    const result = await retry(async () => {
      return this.circuitBreaker.execute(async () => {
        const response = await client.models.list();
        const models: ModelInfo[] = [];

        for await (const model of response) {
          models.push({
            id: model.id,
            owned_by: model.owned_by,
          });
        }

        // Sort models alphabetically
        return models.sort((a, b) => a.id.localeCompare(b.id));
      });
    }, retryOptions);

    if (!result.success) {
      const apiError = result.error ? new APIError(`Failed to fetch models: ${result.error.message}`, {
        originalError: result.error.name,
        endpoint: 'models.list()',
        attempts: result.attempts
      }) : new APIError('Failed to fetch models: Unknown error', {
        endpoint: 'models.list()'
      });
      logger.error(apiError);
      throw apiError;
    }

    return result.result!;
  }

  async chat(messages: LLMMessage[], options?: ChatOptions): Promise<LLMResponse> {
    const client = this.getClient();
    const model = configManager.model;

    const tools: ChatCompletionTool[] | undefined = options?.tools
      ? toolRegistry.toOpenAITools() as ChatCompletionTool[]
      : undefined;

    const retryOptions: RetryOptions = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 15000,
      retryableErrors: (error: unknown) => {
        const errorMsg = error instanceof Error ? error.message : String(error);
        return errorMsg.includes('timeout') || 
               errorMsg.includes('rate limit') || 
               errorMsg.includes('connection') ||
               errorMsg.includes('overloaded');
      },
    };

    const result = await retry(async () => {
      return this.circuitBreaker.execute(async () => {
        const response = await client.chat.completions.create({
          model,
          messages: this.formatMessages(messages),
          temperature: options?.temperature ?? 0.7,
          tools,
          max_tokens: 4000, // Add token limit for safety
        });

        const choice = response.choices[0];

        if (!choice) {
          throw new LLMError('No choice returned from LLM', {
            model: model,
            prompt: messages
          });
        }

        // Check for tool calls
        if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
          return {
            content: choice.message.content || '',
            toolCalls: choice.message.tool_calls
              .filter((tc): tc is typeof tc & { function: { name: string; arguments: string } } =>
                'function' in tc && tc.function !== undefined
              )
              .map((tc) => ({
                id: tc.id,
                type: 'function' as const,
                function: {
                  name: tc.function.name,
                  arguments: tc.function.arguments,
                },
              })),
            usage: response.usage
              ? {
                promptTokens: response.usage.prompt_tokens,
                completionTokens: response.usage.completion_tokens,
                totalTokens: response.usage.total_tokens,
              }
              : undefined,
          };
        }

        if (!choice?.message?.content) {
          throw new LLMError('No response from LLM', {
            model: model,
            prompt: messages
          });
        }

        return {
          content: choice.message.content,
          usage: response.usage
            ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
            : undefined,
        };
      });
    }, retryOptions);

    if (!result.success) {
      const llmError = result.error ? new LLMError(result.error.message, {
        model: model,
        prompt: messages,
        attempts: result.attempts
      }) : new LLMError('Unknown LLM error', {
        model: model,
        prompt: messages
      });
      logger.error(llmError);
      throw llmError;
    }

    return result.result!;
  }

  async executeToolCalls(toolCalls: ToolCall[]): Promise<{ toolCallId: string; result: ToolResult }[]> {
    const results: { toolCallId: string; result: ToolResult }[] = [];

    for (const call of toolCalls) {
      toolSpinner.start(call.function.name);

      try {
        const args = JSON.parse(call.function.arguments);
        const result = await toolRegistry.execute(call.function.name, args);

        if (result.success) {
          toolSpinner.succeed(`${call.function.name} completed`);
        } else {
          toolSpinner.fail(result.error);
        }

        results.push({ toolCallId: call.id, result });
      } catch (error) {
        const toolError = error instanceof Error ? new ToolError(error.message, call.function.name, {
          originalError: error.name,
          arguments: call.function.arguments
        }) : new ToolError('Unknown error executing tool', call.function.name);
        logger.error(toolError);
        toolSpinner.fail(toolError.message);
        results.push({
          toolCallId: call.id,
          result: { success: false, error: toolError.message },
        });
      }
    }

    return results;
  }

  async *streamChat(
    messages: LLMMessage[],
    options?: ChatOptions
  ): AsyncGenerator<string | { toolCalls: ToolCall[] }, void, unknown> {
    const client = this.getClient();
    const model = configManager.model;

    const tools: ChatCompletionTool[] | undefined = options?.tools
      ? toolRegistry.toOpenAITools() as ChatCompletionTool[]
      : undefined;

    const stream = await client.chat.completions.create({
      model,
      messages: this.formatMessages(messages),
      temperature: options?.temperature ?? 0.7,
      stream: true,
      tools,
    });

    const toolCalls: Map<number, ToolCall> = new Map();

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      // Handle tool calls in streaming
      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          const existing = toolCalls.get(tc.index);
          if (existing) {
            if (tc.function?.arguments) {
              existing.function.arguments += tc.function.arguments;
            }
          } else if (tc.id && tc.function?.name) {
            toolCalls.set(tc.index, {
              id: tc.id,
              type: 'function',
              function: {
                name: tc.function.name,
                arguments: tc.function.arguments || '',
              },
            });
          }
        }
      }

      // Handle content
      const content = delta?.content;
      if (content) {
        yield content;
      }
    }

    // If we collected tool calls, yield them at the end
    if (toolCalls.size > 0) {
      yield { toolCalls: Array.from(toolCalls.values()) };
    }
  }

  resetClient(): void {
    this.client = null;
  }
}

export const llmClient = new LLMClient();
