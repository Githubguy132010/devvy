import chalk from 'chalk';
import ora from 'ora';
import { select, editor, input } from '@inquirer/prompts';
import { orchestrator, llmClient, type AgentType } from '../core/index.js';
import { conversationManager } from '../core/conversation.js';
import { configManager, PROVIDER_CONFIG, type ApiProvider } from '../config/index.js';
import { renderer } from '../formatter/index.js';

const AGENT_COLORS: Record<AgentType | 'user', (text: string) => string> = {
  coder: chalk.green,
  critic: chalk.yellow,
  debugger: chalk.red,
  architect: chalk.blue,
  enduser: chalk.magenta,
  asker: chalk.gray,
  user: chalk.cyan,
};

const AGENT_ICONS: Record<AgentType | 'user', string> = {
  coder: '💻',
  critic: '🔍',
  debugger: '🐛',
  architect: '🏗️',
  enduser: '👤',
  asker: '🤖',
  user: '🧑',
};

// Maximum models to display per page in the scrollable list
const MODELS_PER_PAGE = 15;

export class TerminalUI {
  private currentSpinner: ReturnType<typeof ora> | null = null;

  constructor() {}

  printBanner(): void {
    console.log(
      chalk.bold.cyan(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ ███████╗██╗   ██╗██╗   ██╗██╗   ██╗                 ║
║   ██╔══██╗██╔════╝██║   ██║██║   ██║╚██╗ ██╔╝                 ║
║   ██║  ██║█████╗  ██║   ██║██║   ██║ ╚████╔╝                  ║
║   ██║  ██║██╔══╝  ╚██╗ ██╔╝╚██╗ ██╔╝  ╚██╔╝                   ║
║   ██████╔╝███████╗ ╚████╔╝  ╚████╔╝    ██║                    ║
║   ╚═════╝ ╚══════╝  ╚═══╝    ╚═══╝     ╚═╝                    ║
║                                                               ║
║   Multi-Agent Coding Assistant                                ║
║   Type 'help' for available commands                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`)
    );
  }

  printHelp(): void {
    console.log(
      chalk.bold('\nAvailable Commands:\n') +
      chalk.gray('─'.repeat(50)) +
      '\n' +
      chalk.cyan('@coder <message>') +
      '     - Ask the Coder agent\n' +
      chalk.cyan('@critic <message>') +
      '    - Ask the Critic agent\n' +
      chalk.cyan('@debugger <message>') +
      '  - Ask the Debugger agent\n' +
      chalk.cyan('@architect <message>') +
      ' - Ask the Architect agent\n' +
      chalk.cyan('@enduser <message>') +
      '   - Ask the End User agent\n' +
      chalk.cyan('@review') +
      '              - Start a review cycle\n' +
      chalk.cyan('@brainstorm <topic>') +
      '  - All agents brainstorm together\n' +
      '\n' +
      chalk.cyan('/model') +
      '               - Select AI model (scrollable list)\n' +
      chalk.cyan('/config') +
      '              - Show current configuration\n' +
      chalk.cyan('/clear') +
      '               - Clear conversation history\n' +
      chalk.cyan('/history') +
      '             - Show conversation history\n' +
      chalk.cyan('/help') +
      '                - Show this help message\n' +
      chalk.cyan('/exit') +
      '                - Exit Devvy\n' +
      chalk.gray('─'.repeat(50)) +
      '\n' +
      chalk.dim('Or just type a message to chat with the default agent (Coder)\n')
    );
  }

  formatAgentMessage(agent: AgentType | 'user', content: string): string {
    const color = AGENT_COLORS[agent];
    const icon = AGENT_ICONS[agent];
    const name = agent.charAt(0).toUpperCase() + agent.slice(1);
    const renderedContent = renderer.render(content);
    return `${icon} ${color(chalk.bold(`[${name}]`))}\n${renderedContent}\n`;
  }

  printAgentStart(agent: AgentType): void {
    const color = AGENT_COLORS[agent];
    const icon = AGENT_ICONS[agent];
    const name = agent.charAt(0).toUpperCase() + agent.slice(1);
    process.stdout.write(`\n${icon} ${color(chalk.bold(`[${name}]`))}\n`);
  }

  printChunk(content: string): void {
    const renderedContent = renderer.render(content);
    process.stdout.write(renderedContent);
  }

  printComplete(): void {
    console.log('\n');
  }

  startSpinner(text: string): void {
    this.currentSpinner = ora(text).start();
  }

  stopSpinner(success = true, text?: string): void {
    if (this.currentSpinner) {
      if (success) {
        this.currentSpinner.succeed(text);
      } else {
        this.currentSpinner.fail(text);
      }
      this.currentSpinner = null;
    }
  }

  updateSpinner(text: string): void {
    if (this.currentSpinner) {
      this.currentSpinner.text = text;
    }
  }

  printError(message: string): void {
    console.error(chalk.red(`\n❌ Error: ${message}\n`));
  }

  printSuccess(message: string): void {
    console.log(chalk.green(`\n✅ ${message}\n`));
  }

  printInfo(message: string): void {
    console.log(chalk.blue(`\nℹ️  ${message}\n`));
  }

  printConversationHistory(): void {
    const messages = conversationManager.getMessages();
    if (messages.length === 0) {
      this.printInfo('No conversation history yet.');
      return;
    }

    console.log(chalk.bold('\n📜 Conversation History:\n') + chalk.gray('─'.repeat(50)));

    for (const msg of messages) {
      const role = msg.role as AgentType | 'user';
      const color = AGENT_COLORS[role] || chalk.white;
      const icon = AGENT_ICONS[role] || '💬';
      const name = role.charAt(0).toUpperCase() + role.slice(1);
      const time = msg.timestamp.toLocaleTimeString();

      console.log(`\n${icon} ${color(chalk.bold(`[${name}]`))} ${chalk.dim(time)}`);
      console.log(msg.content);
    }
    console.log(chalk.gray('─'.repeat(50)) + '\n');
  }

  printConfig(): void {
    const config = configManager.getAll();
    console.log(chalk.bold('\n⚙️  Current Configuration:\n') + chalk.gray('─'.repeat(50)));
    console.log(`Provider: ${chalk.cyan(config.apiProvider)}`);
    console.log(`Model: ${chalk.cyan(config.model)}`);
    console.log(`API Key: ${chalk.cyan(config.apiKey || 'Not set')}`);
    if (config.apiBaseUrl) {
      console.log(`Base URL: ${chalk.cyan(config.apiBaseUrl)}`);
    }
    console.log(chalk.gray('─'.repeat(50)) + '\n');
  }

  getCwd(): string {
    const cwd = process.cwd();
    const home = process.env.HOME || '';
    return cwd.replace(home, '~');
  }

  printPromptBox(): void {
    const width = Math.min(process.stdout.columns || 80, 76);
    const cwd = this.getCwd();
    const cwdLine = `  ${chalk.dim('📁')} ${chalk.dim(cwd)}`;

    console.log('');
    console.log(chalk.gray('┌' + '─'.repeat(width - 2) + '┐'));
    console.log(chalk.gray('│') + cwdLine + ' '.repeat(Math.max(0, width - 4 - cwd.length)) + chalk.gray('│'));
    console.log(chalk.gray('├' + '─'.repeat(width - 2) + '┤'));
  }

  printPromptBoxBottom(): void {
    const width = Math.min(process.stdout.columns || 80, 76);
    console.log(chalk.gray('└' + '─'.repeat(width - 2) + '┘'));
  }

  async promptForInput(prompt = 'You'): Promise<string> {
    this.printPromptBox();

    const answer = await editor({
      message: chalk.gray('│ ') + chalk.cyan(`${prompt}`) + chalk.dim(' ❯ '),
      waitForUseInput: false,
    });

    this.printPromptBoxBottom();
    return answer.trim();
  }

  async runSetupWizard(): Promise<boolean> {
    console.log(
      chalk.bold.cyan(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 Welcome to Devvy Setup!                                  ║
║                                                               ║
║   Let's get you configured to start coding with AI agents.    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`)
    );

    try {
      // Step 1: Select provider
      const providerChoice = await select({
        message: '📡 Select your AI provider',
        choices: [
          { name: 'OpenAI (GPT-4, GPT-4o)', value: 'openai' },
          { name: 'Anthropic (Claude)', value: 'anthropic' },
          { name: 'OpenRouter (Access multiple models)', value: 'openrouter' },
          { name: 'Custom (OpenAI-compatible API)', value: 'custom' },
        ],
      });

      const provider = providerChoice as ApiProvider;
      configManager.apiProvider = provider;
      const providerConfig = PROVIDER_CONFIG[provider];

      // For custom provider, ask for base URL
      if (provider === 'custom') {
        const baseUrl = await input({
          message: '🔗 Enter your custom API base URL',
        });
        if (baseUrl) {
          configManager.apiBaseUrl = baseUrl;
        }
      }

      // Step 2: Enter API key
      const apiKey = await input({
        message: `🔑 Enter your ${providerConfig.displayName} API key`,
        validate: (value) => value.length > 0 || 'API key cannot be empty.',
      });

      configManager.apiKey = apiKey;

      // Step 3: Set default model (optional)
      const model = await input({
        message: '🤖 Choose your default model',
        default: providerConfig.defaultModel,
      });
      configManager.model = model;

      // Mark setup as complete
      configManager.setupComplete = true;

      // Print success message
      const providerDisplay = providerConfig.displayName.padEnd(42);
      const modelDisplay = configManager.model.padEnd(45);
      console.log(chalk.bold.green(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ✅ Setup Complete!                                          ║
║                                                               ║
║   Provider: ${providerDisplay}║
║   Model: ${modelDisplay}║
║                                                               ║
║   You're ready to start coding with AI agents!                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`));

      return true;
    } catch (error) {
      this.printError('Setup failed. Please try again.');
      return false;
    }
  }

  async selectModel(): Promise<void> {
    if (!configManager.hasApiKey()) {
      this.printError('API key not configured. Please run "devvy setup" first.');
      return;
    }

    const spinner = ora('Fetching available models...').start();

    try {
      const models = await llmClient.fetchModels();
      spinner.succeed(`Found ${models.length} models`);

      if (models.length === 0) {
        this.printInfo('No models found. You can still set a model manually with: devvy config set-model <model>');
        return;
      }

      console.log(chalk.bold('\n🤖 Select a model (type to filter, ↑↓ to navigate, Enter to select):\n'));
      console.log(chalk.dim(`  Current model: ${configManager.model}\n`));
      console.log(chalk.dim('  💡 Tip: Type part of the model name to filter the list\n'));

      // Build choices for the select prompt
      const choices = models.map((model) => ({
        name: model.owned_by ? `${model.id} ${chalk.dim(`(${model.owned_by})`)}` : model.id,
        value: model.id,
      }));

      // Add option to keep current model at the top
      choices.unshift({
        name: chalk.yellow(`Keep current: ${configManager.model}`),
        value: '__KEEP_CURRENT__',
      });

      const selectedModel = await select({
        message: 'Select model:',
        choices,
        pageSize: MODELS_PER_PAGE,
        loop: true,
      });

      if (selectedModel === '__KEEP_CURRENT__') {
        this.printInfo(`Keeping current model: ${configManager.model}`);
        return;
      }

      configManager.model = selectedModel;
      this.printSuccess(`Model set to: ${selectedModel}`);
    } catch (error) {
      // Handle user cancellation (Ctrl+C) - check for ExitPromptError or common cancellation patterns
      if (error instanceof Error &&
        (error.name === 'ExitPromptError' ||
          error.message.includes('force closed') ||
          error.message.includes('cancelled'))) {
        this.printInfo(`Keeping current model: ${configManager.model}`);
        return;
      }
      spinner.fail('Failed to fetch models');
      this.printError(error instanceof Error ? error.message : 'Unknown error');
      this.printInfo('You can still set a model manually with: devvy config set-model <model>');
    }
  }

  close(): void {
    // No readline interface to close anymore
  }
}

export const terminalUI = new TerminalUI();
