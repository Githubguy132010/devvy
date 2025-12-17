import { llmClient, type LLMMessage, type ToolCall } from '../core/llm.js';
import { conversationManager, type AgentRole } from '../core/conversation.js';

export interface AgentConfig {
  name: string;
  role: AgentRole;
  systemPrompt: string;
  temperature?: number;
  useTools?: boolean;
}

export abstract class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  get name(): string {
    return this.config.name;
  }

  get role(): AgentRole {
    return this.config.role;
  }

  protected buildMessages(userMessage?: string): LLMMessage[] {
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: this.config.systemPrompt,
      },
    ];

    const contextMessages = conversationManager.getMessages();
    for (const msg of contextMessages) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: `[${msg.role.toUpperCase()}]: ${msg.content}`,
      });
    }

    if (userMessage) {
      messages.push({
        role: 'user',
        content: userMessage,
      });
    }

    return messages;
  }

  async *respondStream(context?: string): AsyncGenerator<string, void, unknown> {
    const messages: LLMMessage[] = this.buildMessages(context);
    let fullResponse = '';
    const useTools = this.config.useTools ?? true;

    let iteration = 0;
    const maxIterations = 10;

    while (iteration < maxIterations) {
      iteration++;
      let pendingToolCalls: ToolCall[] = [];

      for await (const chunk of llmClient.streamChat(messages, {
        temperature: this.config.temperature,
        tools: useTools,
      })) {
        if (typeof chunk === 'string') {
          fullResponse += chunk;
          yield chunk;
        } else if ('toolCalls' in chunk) {
          pendingToolCalls = chunk.toolCalls;
        }
      }

      if (pendingToolCalls.length === 0) {
        break;
      }

      const toolResults = await llmClient.executeToolCalls(pendingToolCalls);

      messages.push({
        role: 'assistant',
        content: null,
        tool_calls: pendingToolCalls,
      });

      for (const { toolCallId, result } of toolResults) {
        messages.push({
          role: 'tool',
          content: result.success ? result.output || 'Success' : `Error: ${result.error}`,
          tool_call_id: toolCallId,
        });

        yield `\n\n📎 **Tool output:**\n\`\`\`\n${result.success ? result.output : result.error}\n\`\`\`\n\n`;
      }
    }

    if (fullResponse) {
      conversationManager.addMessage(this.role, fullResponse);
    }
  }

  abstract getSpecializedPrompt(task: string): string;
}
