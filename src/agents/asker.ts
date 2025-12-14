import { BaseAgent } from './base.js';

class AskerAgent extends BaseAgent {
  constructor() {
    super({
      name: 'asker',
      role: 'asker',
      systemPrompt:
        "An expert at answering questions based on the conversation history. When you don't know the answer, say \"I don't know\".",
    });
  }

  getSpecializedPrompt(task: string): string {
    return task;
  }
}

export const askerAgent = new AskerAgent();
