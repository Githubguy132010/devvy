import {
  coderAgent,
  criticAgent,
  debuggerAgent,
  architectAgent,
  endUserAgent,
  askerAgent,
  type BaseAgent,
} from '../agents/index.js';
import { conversationManager, type AgentRole, type Message } from '../core/index.js';
import { WordTokenizer } from 'natural';

export type AgentType = 'coder' | 'critic' | 'debugger' | 'architect' | 'enduser' | 'asker';

export interface OrchestratorConfig {
  maxReviewCycles: number;
  enabledAgents: AgentType[];
  maxDepth: number;
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  maxReviewCycles: 3,
  enabledAgents: ['coder', 'critic', 'debugger', 'architect', 'enduser'],
  maxDepth: 10,
};

export class Orchestrator {
  private config: OrchestratorConfig;
  private agents: Map<AgentType, BaseAgent>;

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.agents = new Map([
      ['coder', coderAgent],
      ['critic', criticAgent],
      ['debugger', debuggerAgent],
      ['architect', architectAgent],
      ['enduser', endUserAgent],
      ['asker', askerAgent],
    ]);
  }

  getAgent(type: AgentType): BaseAgent {
    const agent = this.agents.get(type);
    if (!agent) {
      throw new Error(`Unknown agent type: ${type}`);
    }
    return agent;
  }

  isAgentEnabled(type: AgentType): boolean {
    return this.config.enabledAgents.includes(type);
  }

  addUserMessage(content: string): Message {
    return conversationManager.addMessage('user', content);
  }

  async *runAgent(
    type: AgentType,
    context?: string,
    depth = 0
  ): AsyncGenerator<{ type: 'chunk' | 'complete'; content: string; message?: Message }> {
    if (depth > this.config.maxDepth) {
      throw new Error(`Maximum agent recursion depth (${this.config.maxDepth}) reached.`);
    }

    if (!this.isAgentEnabled(type)) {
      throw new Error(`Agent ${type} is not enabled`);
    }

    const agent = this.getAgent(type);
    let fullContent = '';

    for await (const chunk of agent.respondStream(context)) {
      fullContent += chunk;
      yield { type: 'chunk', content: chunk };
    }

    const { isQuestion, mentionedAgent } = this.detectQuestion(fullContent);

    if (isQuestion) {
      yield* this.handleQuestion(type, fullContent, mentionedAgent, depth + 1);
    }

    const messages = conversationManager.getMessages();
    const message = messages[messages.length - 1];
    if (message) {
      yield { type: 'complete', content: fullContent, message };
    }
  }

  async *runReviewCycle(): AsyncGenerator<{
    agent: AgentType;
    phase: 'start' | 'chunk' | 'complete';
    content?: string;
    approved?: boolean;
  }> {
    conversationManager.incrementReviewCycle();
    const cycle = conversationManager.getReviewCycle();

    if (cycle > this.config.maxReviewCycles) {
      yield {
        agent: 'critic',
        phase: 'complete',
        content: `Maximum review cycles (${this.config.maxReviewCycles}) reached. Please review the results.`,
        approved: true,
      };
      return;
    }

    // Critic reviews the code
    yield { agent: 'critic', phase: 'start' };
    let criticResponse = '';

    for await (const event of this.runAgent('critic', 'Please review the latest code.')) {
      if (event.type === 'chunk') {
        criticResponse += event.content;
        yield { agent: 'critic', phase: 'chunk', content: event.content };
      }
    }

    const approved =
      criticResponse.toLowerCase().includes('approved') &&
      !criticResponse.toLowerCase().includes('needs changes');

    yield { agent: 'critic', phase: 'complete', content: criticResponse, approved };

    if (!approved && cycle < this.config.maxReviewCycles) {
      // Let other agents respond to the review
      if (this.isAgentEnabled('enduser')) {
        yield { agent: 'enduser', phase: 'start' };
        for await (const event of this.runAgent('enduser')) {
          if (event.type === 'chunk') {
            yield { agent: 'enduser', phase: 'chunk', content: event.content };
          } else {
            yield { agent: 'enduser', phase: 'complete', content: event.content };
          }
        }
      }

      // Coder responds to fix issues
      if (this.isAgentEnabled('coder')) {
        yield { agent: 'coder', phase: 'start' };
        for await (const event of this.runAgent(
          'coder',
          'Please address the feedback from the Critic and update the code.',
          1
        )) {
          if (event.type === 'chunk') {
            yield { agent: 'coder', phase: 'chunk', content: event.content };
          } else {
            yield { agent: 'coder', phase: 'complete', content: event.content };
          }
        }
      }
    }
  }

  async *brainstorm(topic: string): AsyncGenerator<{
    agent: AgentType;
    phase: 'start' | 'chunk' | 'complete' | 'implementation';
    content?: string;
  }> {
    const order: AgentType[] = ['architect', 'coder', 'critic', 'enduser'];
    const readOnlyTools = ['read_file', 'list_files'];

    for (const agentType of order) {
      if (!this.isAgentEnabled(agentType)) continue;

      const agent = this.getAgent(agentType);
      agent.setEnabledTools(readOnlyTools);

      yield { agent: agentType, phase: 'start' };

      const prompt =
        agentType === 'architect'
          ? `Let's brainstorm about: ${topic}\n\nProvide your architectural perspective.`
          : `Continue the brainstorm about: ${topic}\n\nAdd your perspective considering what others have said.`;

      let fullContent = '';
      for await (const event of this.runAgent(agentType, prompt, 1)) {
        if (event.type === 'chunk') {
          fullContent += event.content;
          yield { agent: agentType, phase: 'chunk', content: event.content };
        } else {
          yield { agent: agentType, phase: 'complete', content: event.content };
        }
      }

      if (this.getAgent(agentType).implementationMode) {
        yield { agent: 'coder', phase: 'implementation' };
        yield* this.implementation();
        return;
      }
    }
  }

  async *implementation(): AsyncGenerator<{
    agent: AgentType;
    phase: 'start' | 'chunk' | 'complete';
    content?: string;
  }> {
    // For now, just a simple implementation cycle with the coder agent
    const coder = this.getAgent('coder');
    coder.setEnabledTools(undefined);

    yield { agent: 'coder', phase: 'start' };
    for await (const event of this.runAgent('coder', 'Please implement the plan.', 1)) {
      if (event.type === 'chunk') {
        yield { agent: 'coder', phase: 'chunk', content: event.content };
      } else {
        yield { agent: 'coder', phase: 'complete', content: event.content };
      }
    }
  }

  getConversationSummary(): string {
    return conversationManager.getContextSummary();
  }

  clearConversation(): void {
    conversationManager.clear();
  }

  private detectQuestion(message: string): { isQuestion: boolean; mentionedAgent: AgentType | null } {
    const tokenizer = new WordTokenizer();
    const tokens = tokenizer.tokenize(message.toLowerCase());

    const isQuestion = message.includes('?');

    if (!isQuestion) {
      return { isQuestion: false, mentionedAgent: null };
    }

    const mentionedAgent = tokens.find(token => this.agents.has(token as AgentType)) as AgentType | null;

    return { isQuestion, mentionedAgent };
  }

  private async *handleQuestion(
    originalAgent: AgentType,
    question: string,
    mentionedAgent: AgentType | null,
    depth: number
  ): AsyncGenerator<{ type: 'chunk' | 'complete'; content: string; message?: Message }> {
    const targetAgent = mentionedAgent || 'asker';
    yield* this.runAgent(targetAgent, question, depth);
  }
}

export const orchestrator = new Orchestrator();
