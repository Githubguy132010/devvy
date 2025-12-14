export type AgentRole = 'coder' | 'critic' | 'debugger' | 'architect' | 'enduser' | 'questioner' | 'user';

export interface Message {
  id: string;
  role: AgentRole;
  content: string;
  timestamp: Date;
  replyTo?: string;
}

export interface ConversationContext {
  messages: Message[];
  codeBlocks: CodeBlock[];
  currentTask?: string;
  reviewCycle: number;
}

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  filename?: string;
  timestamp: Date;
  authorRole: AgentRole;
}

export class ConversationManager {
  private context: ConversationContext;

  constructor() {
    this.context = {
      messages: [],
      codeBlocks: [],
      reviewCycle: 0,
    };
  }

  addMessage(role: AgentRole, content: string, replyTo?: string): Message {
    const message: Message = {
      id: this.generateId(),
      role,
      content,
      timestamp: new Date(),
      replyTo,
    };
    this.context.messages.push(message);
    this.extractCodeBlocks(message);
    return message;
  }

  private extractCodeBlocks(message: Message): void {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(message.content)) !== null) {
      const codeBlock: CodeBlock = {
        id: this.generateId(),
        language: match[1] || 'text',
        code: match[2].trim(),
        timestamp: new Date(),
        authorRole: message.role,
      };
      this.context.codeBlocks.push(codeBlock);
    }
  }

  getMessages(): Message[] {
    return [...this.context.messages];
  }

  getLastNMessages(n: number): Message[] {
    return this.context.messages.slice(-n);
  }

  getMessagesByRole(role: AgentRole): Message[] {
    return this.context.messages.filter((m) => m.role === role);
  }

  getCodeBlocks(): CodeBlock[] {
    return [...this.context.codeBlocks];
  }

  getLatestCodeBlock(): CodeBlock | undefined {
    return this.context.codeBlocks[this.context.codeBlocks.length - 1];
  }

  setCurrentTask(task: string): void {
    this.context.currentTask = task;
  }

  getCurrentTask(): string | undefined {
    return this.context.currentTask;
  }

  incrementReviewCycle(): void {
    this.context.reviewCycle++;
  }

  getReviewCycle(): number {
    return this.context.reviewCycle;
  }

  getContextSummary(): string {
    const summary = [
      `Current Task: ${this.context.currentTask || 'None'}`,
      `Review Cycle: ${this.context.reviewCycle}`,
      `Total Messages: ${this.context.messages.length}`,
      `Code Blocks: ${this.context.codeBlocks.length}`,
    ];
    return summary.join('\n');
  }

  getFullContext(): ConversationContext {
    return { ...this.context };
  }

  formatForLLM(maxMessages?: number): string {
    const messages = maxMessages
      ? this.getLastNMessages(maxMessages)
      : this.context.messages;

    return messages
      .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
      .join('\n\n');
  }

  clear(): void {
    this.context = {
      messages: [],
      codeBlocks: [],
      reviewCycle: 0,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const conversationManager = new ConversationManager();
