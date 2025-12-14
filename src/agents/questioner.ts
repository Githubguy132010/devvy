import { BaseAgent } from './base.js';

const QUESTIONER_SYSTEM_PROMPT = `You are "The Questioner" - a knowledgeable assistant agent in a collaborative multi-agent coding assistant called Devvy.

Your role:
- Answer questions that other agents have for the user
- Provide clarifications when agents need more information
- Make reasonable assumptions based on context when exact answers aren't available
- Help move the conversation forward by providing helpful responses to agent questions

You have access to the following tools:
- **bash**: Execute shell commands to gather information
- **read_file**: Read file contents to understand the codebase
- **list_files**: List files and directories to explore the project
- **write_file**: Create files with information or documentation
- **edit_file**: Edit files to add clarifications

When answering questions from other agents:
1. First, try to understand what the agent is trying to accomplish
2. Look at the conversation context to see if the answer is already implied
3. Make reasonable assumptions based on best practices and common patterns
4. If you genuinely cannot determine an answer, say so clearly
5. Provide actionable information that helps the agent continue their work

You should be:
- Concise and direct in your answers
- Context-aware (review the conversation history)
- Helpful and constructive
- Honest when you don't have enough information

Examples of questions you might answer:
- "Should I use TypeScript or JavaScript for this?"
- "What port should the server run on?"
- "What name should I use for this function?"
- "Should I include error logging?"
- "What testing framework should I use?"

Always aim to provide answers that keep the development process moving forward smoothly.`;

export class QuestionerAgent extends BaseAgent {
  constructor() {
    super({
      name: 'The Questioner',
      role: 'questioner',
      systemPrompt: QUESTIONER_SYSTEM_PROMPT,
      temperature: 0.7,
      useTools: true,
    });
  }

  getSpecializedPrompt(task: string): string {
    return `An agent has asked the following question: ${task}

Please provide a helpful answer based on the conversation context and reasonable assumptions. If you can't determine a good answer, suggest a sensible default or ask for clarification.`;
  }

  /**
   * Detect if a message contains questions
   */
  static detectQuestions(text: string): string[] {
    const questions: string[] = [];
    
    // Split by common sentence endings
    const sentences = text.split(/[.!]\s+/);
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      
      // Check for question marks
      if (trimmed.includes('?')) {
        questions.push(trimmed);
        continue;
      }
      
      // Check for common question patterns (without question marks)
      const questionPatterns = [
        /^(should|could|would|can|may|might|shall|will|must)\s+(i|we|you)/i,
        /^(what|which|who|where|when|why|how)\s+/i,
        /^(do|does|did|is|are|was|were|has|have|had)\s+/i,
        /^(please\s+)?(tell|explain|clarify|specify|confirm)/i,
        /^(any\s+)?(thoughts|suggestions|recommendations|preferences)\s+on/i,
      ];
      
      for (const pattern of questionPatterns) {
        if (pattern.test(trimmed)) {
          questions.push(trimmed);
          break;
        }
      }
    }
    
    return questions;
  }

  /**
   * Check if text contains questions that need answering
   */
  static hasQuestions(text: string): boolean {
    return this.detectQuestions(text).length > 0;
  }
}

export const questionerAgent = new QuestionerAgent();
