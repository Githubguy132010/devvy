import { terminalUI } from './ui.js';
import { orchestrator, type AgentType } from '../core/index.js';
import { configManager } from '../config/index.js';

export class CommandHandler {
  private running = false;

  async handleCommand(input: string): Promise<boolean> {
    const trimmed = input.trim();

    if (!trimmed) return true;

    // Exit commands
    if (trimmed === '/exit' || trimmed === '/quit' || trimmed === 'exit' || trimmed === 'quit') {
      terminalUI.printInfo('Goodbye! 👋');
      return false;
    }

    // Help command
    if (trimmed === '/help' || trimmed === 'help') {
      terminalUI.printHelp();
      return true;
    }

    // Config command
    if (trimmed === '/config') {
      terminalUI.printConfig();
      return true;
    }

    // Clear command
    if (trimmed === '/clear') {
      orchestrator.clearConversation();
      terminalUI.printSuccess('Conversation cleared.');
      return true;
    }

    // History command
    if (trimmed === '/history') {
      terminalUI.printConversationHistory();
      return true;
    }

    // Agent-specific commands
    if (trimmed.startsWith('@')) {
      return this.handleAgentCommand(trimmed);
    }

    // Default: send to coder agent
    return this.chatWithAgent('coder', trimmed);
  }

  private async handleAgentCommand(input: string): Promise<boolean> {
    const match = input.match(/^@(\w+)\s*(.*)/);
    if (!match) {
      terminalUI.printError('Invalid command format. Use @agent <message>');
      return true;
    }

    const [, agentName, message] = match;

    // Special commands
    if (agentName === 'review') {
      return this.runReviewCycle();
    }

    if (agentName === 'brainstorm') {
      if (!message) {
        terminalUI.printError('Please provide a topic for brainstorming.');
        return true;
      }
      return this.runBrainstorm(message);
    }

    // Regular agent chat
    const validAgents: AgentType[] = ['coder', 'critic', 'debugger', 'architect', 'enduser'];
    if (!validAgents.includes(agentName as AgentType)) {
      terminalUI.printError(
        `Unknown agent: ${agentName}. Valid agents: ${validAgents.join(', ')}`
      );
      return true;
    }

    return this.chatWithAgent(agentName as AgentType, message || 'Hello!');
  }

  private async chatWithAgent(agent: AgentType, message: string): Promise<boolean> {
    try {
      // Add user message to conversation
      orchestrator.addUserMessage(message);

      terminalUI.printAgentStart(agent);

      for await (const event of orchestrator.runAgent(agent, message)) {
        if (event.type === 'chunk') {
          terminalUI.printChunk(event.content);
        }
      }

      terminalUI.printComplete();
    } catch (error) {
      terminalUI.printError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }

    return true;
  }

  private async runReviewCycle(): Promise<boolean> {
    try {
      terminalUI.printInfo('Starting review cycle...');

      for await (const event of orchestrator.runReviewCycle()) {
        if (event.phase === 'start') {
          terminalUI.printAgentStart(event.agent);
        } else if (event.phase === 'chunk' && event.content) {
          terminalUI.printChunk(event.content);
        } else if (event.phase === 'complete') {
          terminalUI.printComplete();

          if (event.approved) {
            terminalUI.printSuccess('Code approved! ✅');
          }
        }
      }
    } catch (error) {
      terminalUI.printError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }

    return true;
  }

  private async runBrainstorm(topic: string): Promise<boolean> {
    try {
      terminalUI.printInfo(`Starting brainstorm session on: ${topic}`);
      orchestrator.addUserMessage(`Let's brainstorm about: ${topic}`);

      for await (const event of orchestrator.brainstorm(topic)) {
        if (event.phase === 'start') {
          terminalUI.printAgentStart(event.agent);
        } else if (event.phase === 'chunk' && event.content) {
          terminalUI.printChunk(event.content);
        } else if (event.phase === 'complete') {
          terminalUI.printComplete();
        }
      }

      terminalUI.printSuccess('Brainstorm session complete!');
    } catch (error) {
      terminalUI.printError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }

    return true;
  }

  async startInteractiveSession(): Promise<void> {
    this.running = true;

    // Check for API key
    if (!configManager.hasApiKey()) {
      terminalUI.printInfo(
        'No API key configured. Please set your API key:\n' +
          '  - Set OPENAI_API_KEY environment variable, or\n' +
          '  - Run: devvy config set-key <your-key>'
      );
    }

    terminalUI.printBanner();
    terminalUI.printHelp();

    while (this.running) {
      try {
        const input = await terminalUI.promptForInput();
        this.running = await this.handleCommand(input);
      } catch (error) {
        // Check for readline close error
        if (
          error instanceof Error &&
          'code' in error &&
          error.code === 'ERR_USE_AFTER_CLOSE'
        ) {
          break;
        }
        terminalUI.printError(
          error instanceof Error ? error.message : 'An unknown error occurred'
        );
      }
    }

    terminalUI.close();
  }
}

export const commandHandler = new CommandHandler();
