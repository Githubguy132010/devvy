import { terminalUI } from './ui.js';
import { orchestrator, type AgentType } from '../core/index.js';
import { configManager } from '../config/index.js';
import { fuzzyMatchCommand, SLASH_COMMANDS } from './fuzzy.js';

export class CommandHandler {
  private running = false;

  async handleCommand(input: string): Promise<boolean> {
    const trimmed = input.trim();

    if (!trimmed) return true;

    // Fuzzy match slash commands
    if (trimmed.startsWith('/')) {
      const matched = fuzzyMatchCommand(trimmed.split(' ')[0], SLASH_COMMANDS);
      if (matched && matched !== trimmed.split(' ')[0]) {
        terminalUI.printInfo(`Using: ${matched}`);
        return this.executeSlashCommand(matched);
      }
      return this.executeSlashCommand(trimmed);
    }

    // Agent-specific commands with fuzzy matching
    if (trimmed.startsWith('@')) {
      return this.handleAgentCommand(trimmed);
    }

    // Default: send to coder agent
    return this.chatWithAgent('coder', trimmed);
  }

  private async executeSlashCommand(command: string): Promise<boolean> {
    // Exit commands
    if (command === '/exit' || command === '/quit') {
      terminalUI.printInfo('Goodbye! 👋');
      return false;
    }

    // Help command
    if (command === '/help') {
      terminalUI.printHelp();
      return true;
    }

    // Config command
    if (command === '/config') {
      terminalUI.printConfig();
      return true;
    }

    // Clear command
    if (command === '/clear') {
      orchestrator.clearConversation();
      terminalUI.printSuccess('Conversation cleared.');
      return true;
    }

    // History command
    if (command === '/history') {
      terminalUI.printConversationHistory();
      return true;
    }

    // Model command
    if (command === '/model') {
      await terminalUI.selectModel();
      return true;
    }

    terminalUI.printError(`Unknown command: ${command}`);
    return true;
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
    const validAgents: AgentType[] = ['coder', 'critic', 'debugger', 'architect', 'enduser', 'questioner'];
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

      let detectedQuestions: string[] = [];

      for await (const event of orchestrator.runAgent(agent, message)) {
        if (event.type === 'chunk') {
          terminalUI.printChunk(event.content);
        } else if (event.type === 'question_detected') {
          detectedQuestions = event.questions || [];
        } else if (event.type === 'complete') {
          terminalUI.printComplete();
          
          // If questions were detected, automatically call the questioner agent
          if (detectedQuestions.length > 0) {
            await this.handleDetectedQuestions(detectedQuestions);
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

  private async handleDetectedQuestions(questions: string[]): Promise<void> {
    terminalUI.printQuestionDetected(questions);
    
    // Show a brief thinking animation
    await terminalUI.showThinkingAnimation(500);
    
    // Prepare context for the questioner
    const questionContext = `The following questions were asked:\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nPlease provide helpful answers to these questions based on the conversation context.`;
    
    // Call the questioner agent
    terminalUI.printAgentStart('questioner');
    
    for await (const event of orchestrator.runAgent('questioner', questionContext)) {
      if (event.type === 'chunk') {
        terminalUI.printChunk(event.content);
      } else if (event.type === 'complete') {
        terminalUI.printComplete();
      }
    }
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

    // Check for first run - run interactive setup
    if (configManager.isFirstRun()) {
      const setupSuccess = await terminalUI.runSetupWizard();
      if (!setupSuccess) {
        return;
      }
    } else if (!configManager.hasApiKey()) {
      // Has been configured before but no API key
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
          (error as NodeJS.ErrnoException).code === 'ERR_USE_AFTER_CLOSE'
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
