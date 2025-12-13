import { llmClient, type LLMMessage } from '../core/llm.js';
import { conversationManager, type AgentRole, type Message } from '../core/conversation.js';

export interface AgentConfig {
  name: string;
  role: AgentRole;
  systemPrompt: string;
  temperature?: number;
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
    });

    const message = conversationManager.addMessage(this.role, response.content);
    return message;
  }

  async *respondStream(context?: string): AsyncGenerator<string, void, unknown> {
    const messages = this.buildMessages(context);
    let fullResponse = '';

    for await (const chunk of llmClient.streamChat(messages, {
      temperature: this.config.temperature,
    })) {
      fullResponse += chunk;
      yield chunk;
    }

    conversationManager.addMessage(this.role, fullResponse);
  }

  abstract getSpecializedPrompt(task: string): string;
}
