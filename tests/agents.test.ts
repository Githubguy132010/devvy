import { describe, it, expect, mock } from 'bun:test';
import { BaseAgent, type AgentConfig } from '../src/agents/base.js';
import { conversationManager } from '../src/core/conversation.js';
import { llmClient } from '../src/core/llm.js';
import { CoderAgent } from '../src/agents/coder.js';
import { CriticAgent } from '../src/agents/critic.js';
import { DebuggerAgent } from '../src/agents/debugger.js';
import { ArchitectAgent } from '../src/agents/architect.js';

// Mock the conversation manager
mock.module('../src/core/conversation.js', () => ({
  conversationManager: {
    getMessages: () => [],
    addMessage: (role: string, content: string) => ({
      id: '1',
      role,
      content,
      timestamp: new Date(),
    }),
  },
}));

// Mock the LLM client
mock.module('../src/core/llm.js', () => ({
  llmClient: {
    chat: mock(async () => ({ content: 'Test response' })),
    streamChat: mock(async function* () {
      yield 'Test ';
      yield 'response';
    }),
    executeToolCalls: mock(async () => []),
  },
}));

class TestAgent extends BaseAgent {
  getSpecializedPrompt(task: string): string {
    return `Test task: ${task}`;
  }
}

describe('BaseAgent', () => {
  const config: AgentConfig = {
    name: 'TestAgent',
    role: 'assistant',
    systemPrompt: 'You are a test agent.',
  };

  it('should construct correctly', () => {
    const agent = new TestAgent(config);
    expect(agent.name).toBe('TestAgent');
    expect(agent.role).toBe('assistant');
  });

  it('should build messages without user message', () => {
    const agent = new TestAgent(config);
    const messages = (agent as any).buildMessages();
    expect(messages).toEqual([
      { role: 'system', content: 'You are a test agent.' },
    ]);
  });

  it('should build messages with user message', () => {
    const agent = new TestAgent(config);
    const messages = (agent as any).buildMessages('User message');
    expect(messages).toEqual([
      { role: 'system', content: 'You are a test agent.' },
      { role: 'user', content: 'User message' },
    ]);
  });

  it('should respond', async () => {
    const agent = new TestAgent(config);
    const response = await agent.respond('Test context');
    expect(response.content).toBe('Test response');
    expect(llmClient.chat).toHaveBeenCalled();
  });

  it('should respond stream', async () => {
    const agent = new TestAgent(config);
    const stream = agent.respondStream('Test context');
    let content = '';
    for await (const chunk of stream) {
      content += chunk;
    }
    expect(content).toBe('Test response');
    expect(llmClient.streamChat).toHaveBeenCalled();
  });
});

describe('CoderAgent', () => {
  it('should have the correct name and role', () => {
    const agent = new CoderAgent();
    expect(agent.name).toBe('The Coder');
    expect(agent.role).toBe('coder');
  });

  it('should generate a specialized prompt', () => {
    const agent = new CoderAgent();
    const prompt = agent.getSpecializedPrompt('test task');
    expect(prompt).toContain('test task');
  });
});

describe('CriticAgent', () => {
  it('should have the correct name and role', () => {
    const agent = new CriticAgent();
    expect(agent.name).toBe('The Critic');
    expect(agent.role).toBe('critic');
  });

  it('should generate a specialized prompt', () => {
    const agent = new CriticAgent();
    const prompt = agent.getSpecializedPrompt('test task');
    expect(prompt).toContain('test task');
  });
});

describe('DebuggerAgent', () => {
  it('should have the correct name and role', () => {
    const agent = new DebuggerAgent();
    expect(agent.name).toBe('The Debugger');
    expect(agent.role).toBe('debugger');
  });

  it('should generate a specialized prompt', () => {
    const agent = new DebuggerAgent();
    const prompt = agent.getSpecializedPrompt('test task');
    expect(prompt).toContain('test task');
  });
});

describe('ArchitectAgent', () => {
  it('should have the correct name and role', () => {
    const agent = new ArchitectAgent();
    expect(agent.name).toBe('The Architect');
    expect(agent.role).toBe('architect');
  });

  it('should generate a specialized prompt', () => {
    const agent = new ArchitectAgent();
    const prompt = agent.getSpecializedPrompt('test task');
    expect(prompt).toContain('test task');
  });
});
