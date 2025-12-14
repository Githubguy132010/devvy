import { questionDetector } from './question-detector.js';
import { conversationManager } from './conversation.js';
import { orchestrator, type AgentType } from './orchestrator.js';

class RoleSwitcher {
  shouldSwitch(message: string): boolean {
    return questionDetector.isQuestion(message);
  }

  getBestAgent(question: string): AgentType {
    const lastMessage = conversationManager.getLastNMessages(1)[0];
    if (lastMessage && lastMessage.role !== 'user') {
      return lastMessage.role as AgentType;
    }

    if (question.toLowerCase().includes('code')) {
      return 'coder';
    } else if (question.toLowerCase().includes('review')) {
      return 'critic';
    } else if (question.toLowerCase().includes('bug')) {
      return 'debugger';
    } else if (question.toLowerCase().includes('design')) {
      return 'architect';
    } else {
      return 'enduser';
    }
  }

  async switch(question: string): Promise<void> {
    const agent = this.getBestAgent(question);
    await orchestrator.runAgent(agent, question);
  }
}

export const roleSwitcher = new RoleSwitcher();
