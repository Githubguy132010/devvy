import { BaseAgent, type AgentConfig } from './base.js';

const askerConfig: AgentConfig = {
  name: 'Asker',
  role: 'asker',
  systemPrompt: 'You are an AI assistant that answers questions on behalf of the user. Your goal is to provide clear, concise, and accurate answers to the questions asked by other agents.',
};

class Asker extends BaseAgent {
  constructor() {
    super(askerConfig);
  }

  getSpecializedPrompt(task: string): string {
    return `The user has been asked the following question: "${task}". Please provide an answer.`;
  }
}

export const asker = new Asker();
