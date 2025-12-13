import OpenAI from 'openai';
import { configManager } from '../config/index.js';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LLMClient {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = configManager.apiKey;
      if (!apiKey) {
        throw new Error('API key not configured. Run "devvy config set-key" to configure your API key.');
      }

      this.client = new OpenAI({
        apiKey,
        baseURL: configManager.apiBaseUrl,
      });
    }
    return this.client;
  }

  async chat(messages: LLMMessage[], options?: { temperature?: number }): Promise<LLMResponse> {
    const client = this.getClient();
    const model = configManager.model;

    const response = await client.chat.completions.create({
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
    });

    const choice = response.choices[0];
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

  async *streamChat(
    messages: LLMMessage[],
    options?: { temperature?: number }
  ): AsyncGenerator<string, void, unknown> {
    const client = this.getClient();
    const model = configManager.model;

    const stream = await client.chat.completions.create({
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  resetClient(): void {
    this.client = null;
  }
}

export const llmClient = new LLMClient();
