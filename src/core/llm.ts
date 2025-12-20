import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { GoogleGenAI } from '@google/genai';
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
  private openaiClient: OpenAI | null = null;
  private geminiClient: GoogleGenAI | null = null;
  private circuitBreaker = new CircuitBreaker({
    failureThreshold: 3,
    recoveryTimeout: 30000,
    monitoringPeriod: 10000,
  });

  private getOpenAIClient(): OpenAI {
    if (!this.openaiClient) {
      const apiKey = configManager.apiKey;
      if (!apiKey) {
        const error = new ConfigError('API key not configured. Run "devvy config set-key" to configure your API key.', {
          missingConfig: 'apiKey'
        });
        logger.error(error);
        throw error;
      }

      this.openaiClient = new OpenAI({
        apiKey,
        baseURL: configManager.apiBaseUrl,
      });
    }
    return this.openaiClient;
  }

  private getGeminiClient(): GoogleGenAI {
    if (!this.geminiClient) {
      const apiKey = configManager.apiKey;
      if (!apiKey) {
        const error = new ConfigError('API key not configured. Run "devvy config set-key" to configure your API key.', {
          missingConfig: 'apiKey'
        });
        logger.error(error);
        throw error;
      }

      this.geminiClient = new GoogleGenAI({ apiKey });
    }
    return this.geminiClient;
  }

  private formatMessagesForGemini(messages: LLMMessage[]): any[] {
    const contents: any[] = [];

    for (const message of messages) {
      const parts: any[] = [];

      if (message.content) {
        parts.push({ text: message.content });
      }

      if (message.tool_calls) {
        for (const tc of message.tool_calls) {
          parts.push({
            functionCall: {
              name: tc.function.name,
              args: JSON.parse(tc.function.arguments),
            },
          });
        }
      }

      if (message.tool_call_id && message.role === 'tool') {
        parts.push({
          functionResponse: {
            name: message.tool_call_id, // Assuming tool_call_id is the function name
            response: { content: message.content },
          },
        });
      }

      contents.push({
        role: message.role === 'assistant' ? 'model' : message.role === 'system' ? 'user' : message.role,
        parts,
      });
    }

    return contents;
  }

  private formatToolsForGemini(): any {
    const tools = toolRegistry.toOpenAITools();
    return {
      functionDeclarations: tools.map((tool: any) => ({
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters,
      })),
    };
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
    const provider = configManager.apiProvider;

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
        if (provider === 'gemini') {
          const client = this.getGeminiClient();
          const response = await client.models.list();
          const models: ModelInfo[] = (response as any).models.map((model: any) => ({
            id: model.name?.replace('models/', '') || model.name, // Remove 'models/' prefix
            owned_by: 'google',
          }));
          return models;
        } else {
          const client = this.getOpenAIClient();
          const response = await client.models.list();
          const models: ModelInfo[] = [];

          for await (const model of response) {
            models.push({
              id: model.id,
              owned_by: model.owned_by,
            });
          }
          return models.sort((a, b) => a.id.localeCompare(b.id));
        }
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
    const provider = configManager.apiProvider;
    const model = configManager.model;

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
        if (provider === 'gemini') {
          const client = this.getGeminiClient();
          const geminiContents = this.formatMessagesForGemini(messages);
          const geminiTools = options?.tools ? this.formatToolsForGemini() : undefined;

          const response = await (client.models.generateContent as any)({
            model,
            contents: geminiContents,
            tools: geminiTools ? [geminiTools] : undefined,
            generationConfig: {
              temperature: options?.temperature ?? 0.7,
              maxOutputTokens: 4000,
            },
          });

          if (!response.candidates || response.candidates.length === 0) {
            throw new LLMError('No candidates returned from Gemini', {
              model: model,
              prompt: messages
            });
          }

          const candidate = response.candidates[0];
          const parts = candidate.content?.parts || [];

          let content = '';
          const toolCalls: ToolCall[] = [];

          for (const part of parts) {
            if (part.text) {
              content += part.text;
            }
            if (part.functionCall) {
              toolCalls.push({
                id: part.functionCall.name, // Gemini doesn't have IDs, use name as ID
                type: 'function',
                function: {
                  name: part.functionCall.name,
                  arguments: JSON.stringify(part.functionCall.args),
                },
              });
            }
          }

          const usage = response.usageMetadata && response.usageMetadata.promptTokenCount !== undefined &&
                        response.usageMetadata.candidatesTokenCount !== undefined &&
                        response.usageMetadata.totalTokenCount !== undefined ? {
            promptTokens: response.usageMetadata.promptTokenCount,
            completionTokens: response.usageMetadata.candidatesTokenCount,
            totalTokens: response.usageMetadata.totalTokenCount,
          } : undefined;

          return {
            content,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            usage,
          };
        } else {
          const client = this.getOpenAIClient();
          const tools: ChatCompletionTool[] | undefined = options?.tools
            ? toolRegistry.toOpenAITools() as ChatCompletionTool[]
            : undefined;

          const response = await client.chat.completions.create({
            model,
            messages: this.formatMessages(messages),
            temperature: options?.temperature ?? 0.7,
            tools,
            max_tokens: 4000,
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
        }
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
    const provider = configManager.apiProvider;
    const model = configManager.model;

    if (provider === 'gemini') {
      const client = this.getGeminiClient();
      const geminiContents = this.formatMessagesForGemini(messages);
      const geminiTools = options?.tools ? [this.formatToolsForGemini()] : undefined;

      const stream = await (client.models.generateContent as any)({
        model,
        contents: geminiContents,
        tools: geminiTools,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: 4000,
        },
        stream: true,
      });

      const toolCalls: ToolCall[] = [];

      for await (const chunk of stream) {
        if (chunk.candidates && chunk.candidates.length > 0) {
          const candidate = chunk.candidates[0];
          const parts = candidate.content?.parts || [];

          for (const part of parts) {
            if (part.text) {
              yield part.text;
            }
            if (part.functionCall) {
              toolCalls.push({
                id: part.functionCall.name,
                type: 'function',
                function: {
                  name: part.functionCall.name,
                  arguments: JSON.stringify(part.functionCall.args),
                },
              });
            }
          }
        }
      }

      if (toolCalls.length > 0) {
        yield { toolCalls };
      }
    } else {
      const client = this.getOpenAIClient();
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
  }

  resetClient(): void {
    this.openaiClient = null;
    this.geminiClient = null;
  }
}

export const llmClient = new LLMClient();
