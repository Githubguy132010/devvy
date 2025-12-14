import { orchestrator, questionDetector } from '../core/index.js';

class AskerHandler {
  async handle(agent: string, content: string): Promise<void> {
    if (questionDetector.isQuestion(content)) {
      await orchestrator.runAgent('asker', content);
    }
  }
}

export const askerHandler = new AskerHandler();
