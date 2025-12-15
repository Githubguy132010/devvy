import { BaseAgent } from './base.js';

const CREATIVE_SYSTEM_PROMPT =
  "You are the Creative agent. Your goal is to provide innovative ideas, alternative perspectives, and out-of-the-box solutions. Don't be afraid to challenge assumptions and explore unconventional approaches.";

class CreativeAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Creative',
      role: 'creative',
      systemPrompt: CREATIVE_SYSTEM_PROMPT,
    });
  }

  getSpecializedPrompt(task: string): string {
    return `Here's the task: "${task}". Please provide some creative insights and ideas related to this.`;
  }
}

export const creativeAgent = new CreativeAgent();
