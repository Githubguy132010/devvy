import { terminalUI } from './ui.js';
import { orchestrator, type AgentType } from '../core/index.js';
import { configManager } from '../config/index.js';
import { fuzzyMatchCommand, SLASH_COMMANDS } from './fuzzy.js';
import { logger } from '../core/logger.js';
import { createErrorFromUnknown } from '../core/errors.js';

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
      // Input validation
      if (!message || typeof message !== 'string') {
        terminalUI.printError('Message is required and must be a string');
        return true;
      }

      if (message.length > 50000) {
        terminalUI.printError('Message too long (max 50000 characters)');
        return true;
      }

      // Add user message to conversation
      orchestrator.addUserMessage(message);

      logger.info(`Starting chat with agent: ${agent}`, { messageLength: message.length });

      terminalUI.startSpinner('Thinking...', agent);
      let thinking = true;

      terminalUI.printAgentStart(agent);

      for await (const event of orchestrator.runAgent(agent, message)) {
        if (thinking) {
          terminalUI.stopSpinner();
          thinking = false;
        }
        if (event.type === 'chunk') {
          terminalUI.printChunk(event.content);
        }
      }

      if (thinking) {
        terminalUI.stopSpinner();
      }

      terminalUI.printComplete();
      logger.info(`Chat completed with agent: ${agent}`);
    } catch (error) {
      const appError = createErrorFromUnknown(error);
      logger.error(`Chat failed with agent: ${agent}`, { 
        error: appError.message, 
        agent,
        messageLength: message.length 
      });
      terminalUI.printError(`Failed to chat with ${agent}: ${appError.message}`);
    }

    return true;
  }

  private async runReviewCycle(): Promise<boolean> {
    try {
      terminalUI.printInfo('Starting review cycle...');
      let thinking = false;

      for await (const event of orchestrator.runReviewCycle()) {
        if (event.phase === 'start') {
          terminalUI.startSpinner('Thinking...', event.agent);
          thinking = true;
          terminalUI.printAgentStart(event.agent);
        } else if (event.phase === 'chunk' && event.content) {
          if (thinking) {
            terminalUI.stopSpinner();
            thinking = false;
          }
          terminalUI.printChunk(event.content);
        } else if (event.phase === 'complete') {
          if (thinking) {
            terminalUI.stopSpinner();
            thinking = false;
          }
          terminalUI.printComplete();

          if (event.approved) {
            terminalUI.printSuccess('Code approved! ✅');
          }
        }
      }
    } catch (error) {
      const appError = createErrorFromUnknown(error);
      logger.error(appError);
      terminalUI.printError(appError.message);
    }

    return true;
  }

  private async runBrainstorm(topic: string): Promise<boolean> {
    try {
      terminalUI.printInfo(`Starting brainstorm session on: ${topic}`);
      orchestrator.addUserMessage(`Let's brainstorm about: ${topic}`);
      let thinking = false;

      for await (const event of orchestrator.brainstorm(topic)) {
        if (event.phase === 'start') {
          terminalUI.startSpinner('Thinking...', event.agent);
          thinking = true;
          terminalUI.printAgentStart(event.agent);
        } else if (event.phase === 'chunk' && event.content) {
          if (thinking) {
            terminalUI.stopSpinner();
            thinking = false;
          }
          terminalUI.printChunk(event.content);
        } else if (event.phase === 'complete') {
          if (thinking) {
            terminalUI.stopSpinner();
            thinking = false;
          }
          terminalUI.printComplete();
        }
      }

      terminalUI.printSuccess('Brainstorm session complete!');
    } catch (error) {
      const appError = createErrorFromUnknown(error);
      logger.error(appError);
      terminalUI.printError(appError.message);
    }

    return true;
  }

  async startInteractiveSession(): Promise<void> {
    this.running = true;

    try {
      logger.info('Starting interactive session');

      // Check for first run - run interactive setup
      if (configManager.isFirstRun()) {
        logger.info('First run detected, starting setup wizard');
        const setupSuccess = await terminalUI.runSetupWizard();
        if (!setupSuccess) {
          logger.info('Setup cancelled by user');
          return;
        }
      } else if (!configManager.hasApiKey()) {
        // Has been configured before but no API key
        const message = 
          'No API key configured. Please set your API key:\n' +
          '  - Set OPENAI_API_KEY environment variable, or\n' +
          '  - Run: devvy config set-key <your-key>';
        logger.warn('No API key configured');
        terminalUI.printInfo(message);
      }

      terminalUI.printBanner();
      terminalUI.printHelp();

      while (this.running) {
        try {
          const input = await terminalUI.promptForInput();
          
          // Validate input
          if (!input || typeof input !== 'string') {
            continue;
          }

          if (input.length > 100000) {
            terminalUI.printError('Input too long (max 100000 characters)');
            continue;
          }

          this.running = await this.handleCommand(input);
        } catch (error) {
          const appError = createErrorFromUnknown(error);
          
          // Check for readline close error or intentional exit
          if (
            appError instanceof Error &&
            ('code' in appError && (appError as NodeJS.ErrnoException).code === 'ERR_USE_AFTER_CLOSE' ||
             appError.message.includes('TerminalUI is closed') ||
             appError.message.includes('Readline interface closed'))
          ) {
            logger.info('Terminal interface closed, exiting session');
            break;
          }
          
          logger.error('Error in interactive session', { 
            error: appError.message,
            code: (appError as any).code 
          });
          
          // Don't print error for user interruptions
          if (!appError.message.includes('prompt timeout') && 
              !appError.message.includes('force closed')) {
            terminalUI.printError('An error occurred. Please try again or use /exit to quit.');
          }
        }
      }
    } finally {
      logger.info('Interactive session ended');
      terminalUI.close();
    }
  }
}

export const commandHandler = new CommandHandler();
