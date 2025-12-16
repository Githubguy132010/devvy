import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { GoogleGenerativeAI, SchemaType, type Content, type Part, type FunctionDeclaration, type Tool as GeminiTool } from '@google/generative-ai';
import { configManager } from '../config/index.js';
import { toolRegistry, type ToolResult } from '../tools/index.js';
import { toolSpinner } from '../cli/spinner.js';

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
  private geminiClient: GoogleGenerativeAI | null = null;

  private getOpenAIClient(): OpenAI {
    if (!this.openaiClient) {
      const apiKey = configManager.apiKey;
      if (!apiKey) {
        throw new Error('API key not configured. Run "devvy config set-key" to configure your API key.');
      }

      this.openaiClient = new OpenAI({
        apiKey,
        baseURL: configManager.apiBaseUrl,
      });
    }
    return this.openaiClient;
  }

  private getGeminiClient(): GoogleGenerativeAI {
    if (!this.geminiClient) {
      const apiKey = configManager.apiKey;
      if (!apiKey) {
        throw new Error('API key not configured. Run "devvy config set-key" to configure your API key.');
      }

      this.geminiClient = new GoogleGenerativeAI(apiKey);
    }
    return this.geminiClient;
  }

  private formatMessagesToGemini(messages: LLMMessage[]): { systemInstruction?: string; contents: Content[] } {
    // Extract system message if present
    const systemMessage = messages.find(m => m.role === 'system');
    const systemInstruction = systemMessage?.content || undefined;

    // Convert other messages to Gemini format
    const contents: Content[] = [];
    
    for (const msg of messages) {
      if (msg.role === 'system') continue; // Skip system messages as they're handled separately
      
      if (msg.role === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: msg.content || '' }],
        });
      } else if (msg.role === 'assistant') {
        const parts: Part[] = [];
        
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        
        if (msg.tool_calls) {
          for (const tc of msg.tool_calls) {
            parts.push({
              functionCall: {
                name: tc.function.name,
                args: JSON.parse(tc.function.arguments),
              },
            });
          }
        }
        
        if (parts.length > 0) {
          contents.push({
            role: 'model',
            parts,
          });
        }
      } else if (msg.role === 'tool') {
        // Tool responses in Gemini
        contents.push({
          role: 'function',
          parts: [{
            functionResponse: {
              name: msg.tool_call_id || 'unknown',
              response: {
                result: msg.content || '',
              },
            },
          }],
        });
      }
    }

    return { systemInstruction, contents };
  }

  private convertToolsToGemini(tools: ChatCompletionTool[]): GeminiTool[] {
    const functionDeclarations = tools
      .filter((tool): tool is Extract<ChatCompletionTool, { type: 'function' }> => tool.type === 'function')
      .map(tool => ({
        name: tool.function.name,
        description: tool.function.description || '',
        parameters: {
          type: SchemaType.OBJECT,
          properties: (tool.function.parameters as { properties?: Record<string, unknown> })?.properties || {},
          required: (tool.function.parameters as { required?: string[] })?.required,
        },
      })) as FunctionDeclaration[];

    return [{ functionDeclarations }];
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

    try {
      if (provider === 'gemini') {
        const client = this.getGeminiClient();
        const models: ModelInfo[] = [
          { id: 'gemini-2.0-flash-exp', owned_by: 'google' },
          { id: 'gemini-1.5-pro', owned_by: 'google' },
          { id: 'gemini-1.5-flash', owned_by: 'google' },
        ];
        
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

        // Sort models alphabetically
        return models.sort((a, b) => a.id.localeCompare(b.id));
      }
    } catch (error) {
      throw new Error(`Failed to fetch models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async chat(messages: LLMMessage[], options?: ChatOptions): Promise<LLMResponse> {
    const provider = configManager.apiProvider;
    const model = configManager.model;

    if (provider === 'gemini') {
      const client = this.getGeminiClient();
      const { systemInstruction, contents } = this.formatMessagesToGemini(messages);
      
      const tools: ChatCompletionTool[] | undefined = options?.tools
        ? toolRegistry.toOpenAITools() as ChatCompletionTool[]
        : undefined;
      
      const geminiTools = tools ? this.convertToolsToGemini(tools) : undefined;
      
      const generativeModel = client.getGenerativeModel({
        model,
        systemInstruction,
        tools: geminiTools,
      });

      const result = await generativeModel.generateContent({
        contents,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
        },
      });

      const response = result.response;
      const candidate = response.candidates?.[0];
      
      if (!candidate) {
        throw new Error('No response from Gemini');
      }

      // Check for function calls
      const functionCalls = candidate.content.parts.filter(part => 'functionCall' in part);
      if (functionCalls.length > 0) {
        const toolCalls: ToolCall[] = functionCalls.map((part, index) => {
          const fc = (part as { functionCall: { name: string; args: Record<string, unknown> } }).functionCall;
          return {
            id: `call_${index}_${Date.now()}`,
            type: 'function' as const,
            function: {
              name: fc.name,
              arguments: JSON.stringify(fc.args),
            },
          };
        });

        return {
          content: candidate.content.parts
            .filter(part => 'text' in part)
            .map(part => (part as { text: string }).text)
            .join('') || '',
          toolCalls,
          usage: response.usageMetadata ? {
            promptTokens: response.usageMetadata.promptTokenCount || 0,
            completionTokens: response.usageMetadata.candidatesTokenCount || 0,
            totalTokens: response.usageMetadata.totalTokenCount || 0,
          } : undefined,
        };
      }

      const textParts = candidate.content.parts.filter(part => 'text' in part);
      const content = textParts.map(part => (part as { text: string }).text).join('');

      if (!content) {
        throw new Error('No content in Gemini response');
      }

      return {
        content,
        usage: response.usageMetadata ? {
          promptTokens: response.usageMetadata.promptTokenCount || 0,
          completionTokens: response.usageMetadata.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata.totalTokenCount || 0,
        } : undefined,
      };
    } else {
      // OpenAI-compatible API (OpenAI, Anthropic, OpenRouter, custom)
      const client = this.getOpenAIClient();
      
      const tools: ChatCompletionTool[] | undefined = options?.tools
        ? toolRegistry.toOpenAITools() as ChatCompletionTool[]
        : undefined;

      const response = await client.chat.completions.create({
        model,
        messages: this.formatMessages(messages),
        temperature: options?.temperature ?? 0.7,
        tools,
      });

      const choice = response.choices[0];

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
        throw new Error('No response from LLM');
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toolSpinner.fail(errorMessage);
        results.push({
          toolCallId: call.id,
          result: { success: false, error: errorMessage },
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
      const { systemInstruction, contents } = this.formatMessagesToGemini(messages);
      
      const tools: ChatCompletionTool[] | undefined = options?.tools
        ? toolRegistry.toOpenAITools() as ChatCompletionTool[]
        : undefined;
      
      const geminiTools = tools ? this.convertToolsToGemini(tools) : undefined;
      
      const generativeModel = client.getGenerativeModel({
        model,
        systemInstruction,
        tools: geminiTools,
      });

      const result = await generativeModel.generateContentStream({
        contents,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
        },
      });

      const functionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

      for await (const chunk of result.stream) {
        const candidate = chunk.candidates?.[0];
        if (!candidate) continue;

        for (const part of candidate.content.parts) {
          if ('text' in part && part.text) {
            yield part.text;
          } else if ('functionCall' in part && part.functionCall) {
            functionCalls.push({
              name: part.functionCall.name,
              args: (part.functionCall.args as Record<string, unknown>) || {},
            });
          }
        }
      }

      // If we collected function calls, yield them at the end
      if (functionCalls.length > 0) {
        const toolCalls: ToolCall[] = functionCalls.map((fc, index) => ({
          id: `call_${index}_${Date.now()}`,
          type: 'function' as const,
          function: {
            name: fc.name,
            arguments: JSON.stringify(fc.args),
          },
        }));
        yield { toolCalls };
      }
    } else {
      // OpenAI-compatible API (OpenAI, Anthropic, OpenRouter, custom)
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
