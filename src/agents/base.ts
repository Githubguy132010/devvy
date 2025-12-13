import { llmClient, type LLMMessage, type ToolCall } from '../core/llm.js';
import { conversationManager, type AgentRole, type Message } from '../core/conversation.js';

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

    // Add conversation context
    const contextMessages = conversationManager.getMessages();
    for (const msg of contextMessages) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: `[${msg.role.toUpperCase()}]: ${msg.content}`,
      });
    }

    // Add current user message if provided
    if (userMessage) {
      messages.push({
        role: 'user',
        content: userMessage,
      });
    }

    return messages;
  }

  async respond(context?: string): Promise<Message> {
    const messages = this.buildMessages(context);
    const response = await llmClient.chat(messages, {
      temperature: this.config.temperature,
      tools: this.config.useTools,
    });

    const message = conversationManager.addMessage(this.role, response.content);
    return message;
  }

  async *respondStream(context?: string): AsyncGenerator<string, void, unknown> {
    const messages: LLMMessage[] = this.buildMessages(context);
    let fullResponse = '';
    const useTools = this.config.useTools ?? true;

    // Tool call loop - keep calling until we get a text response
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

      // If no tool calls, we're done
      if (pendingToolCalls.length === 0) {
        break;
      }

      // Execute tool calls
      const toolResults = await llmClient.executeToolCalls(pendingToolCalls);

      // Add assistant message with tool calls to conversation
      messages.push({
        role: 'assistant',
        content: null,
        tool_calls: pendingToolCalls,
      });

      // Add tool results to messages
      for (const { toolCallId, result } of toolResults) {
        messages.push({
          role: 'tool',
          content: result.success
            ? result.output || 'Success'
            : `Error: ${result.error}`,
          tool_call_id: toolCallId,
        });

        // Yield tool output as part of the stream
        yield `\n\n📎 **Tool output:**\n\`\`\`\n${result.success ? result.output : result.error}\n\`\`\`\n\n`;
      }
    }

    if (fullResponse) {
      conversationManager.addMessage(this.role, fullResponse);
    }
  }

  abstract getSpecializedPrompt(task: string): string;
}

