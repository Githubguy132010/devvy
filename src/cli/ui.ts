import chalk from 'chalk';
import ora from 'ora';
import * as readline from 'readline';
import { select } from '@inquirer/prompts';
import { orchestrator, llmClient, type AgentType } from '../core/index.js';
import { conversationManager } from '../core/conversation.js';
import { configManager, PROVIDER_CONFIG, type ApiProvider } from '../config/index.js';
import { terminalRenderer } from './renderer.js';

const AGENT_COLORS: Record<AgentType | 'user', (text: string) => string> = {
  coder: chalk.green,
  critic: chalk.yellow,
  debugger: chalk.red,
  architect: chalk.blue,
  enduser: chalk.magenta,
  questioner: chalk.cyan,
  user: chalk.cyan,
};

const AGENT_ICONS: Record<AgentType | 'user', string> = {
  coder: '💻',
  critic: '🔍',
  debugger: '🐛',
  architect: '🏗️',
  enduser: '👤',
  questioner: '❓',
  user: '🧑',
};

// Maximum models to display per page in the scrollable list
const MODELS_PER_PAGE = 15;

export class TerminalUI {
  private rl: readline.Interface | null = null;
  private currentSpinner: ReturnType<typeof ora> | null = null;
  private streamBuffer: string = '';
  private enableRendering: boolean = true;

  constructor() { }

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
      chalk.cyan('@questioner <message>') +
      ' - Ask the Questioner agent\n' +
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
      chalk.dim('Or just type a message to chat with the default agent (Coder)\n') +
      chalk.dim('\n💡 Tip: Agents automatically detect and answer questions from other agents!\n')
    );
  }

  formatAgentMessage(agent: AgentType | 'user', content: string): string {
    const color = AGENT_COLORS[agent];
    const icon = AGENT_ICONS[agent];
    const name = agent.charAt(0).toUpperCase() + agent.slice(1);
    return `${icon} ${color(chalk.bold(`[${name}]`))}\n${content}\n`;
  }

  printAgentStart(agent: AgentType): void {
    const color = AGENT_COLORS[agent];
    const icon = AGENT_ICONS[agent];
    const name = agent.charAt(0).toUpperCase() + agent.slice(1);
    process.stdout.write(`\n${icon} ${color(chalk.bold(`[${name}]`))}\n`);
  }

  printChunk(content: string): void {
    this.streamBuffer += content;
    // During streaming, show raw content for real-time feedback
    process.stdout.write(content);
  }

  printComplete(): void {
    // Render the complete buffered content with markdown
    if (this.enableRendering && this.streamBuffer) {
      // Clear the current line and move up to overwrite raw output
      process.stdout.write('\r');
      
      // Render with syntax highlighting
      const rendered = terminalRenderer.highlightCodeBlocks(this.streamBuffer);
      console.log('\n' + rendered);
    } else {
      console.log('\n');
    }
    
    // Reset buffer
    this.streamBuffer = '';
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

  printQuestionDetected(questions: string[]): void {
    console.log(chalk.yellow('\n❓ Questions detected:'));
    questions.forEach((q, i) => {
      console.log(chalk.yellow(`   ${i + 1}. ${q}`));
    });
    console.log(chalk.blue('   → Automatically asking the Questioner agent...\n'));
  }

  async showThinkingAnimation(durationMs: number = 1000): Promise<void> {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        process.stdout.write(`\r${chalk.cyan(frames[i])} ${chalk.dim('Thinking...')}`);
        i = (i + 1) % frames.length;
        
        if (Date.now() - startTime >= durationMs) {
          clearInterval(interval);
          process.stdout.write('\r' + ' '.repeat(20) + '\r'); // Clear the line
          resolve();
        }
      }, 80);
    });
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
    const width = Math.min(process.stdout.columns || 80, 80);
    const cwd = this.getCwd();
    const cwdDisplay = `  ${chalk.dim('📁')} ${chalk.dim(cwd)}`;
    // Remove ANSI escape codes for length calculation
    const cwdLength = cwd.length + 5; // 5 for "  📁 "
    const padding = Math.max(0, width - cwdLength - 2);

    console.log('');
    console.log(chalk.gray('┌' + '─'.repeat(width - 2) + '┐'));
    console.log(chalk.gray('│') + cwdDisplay + ' '.repeat(padding) + chalk.gray('│'));
    console.log(chalk.gray('├' + '─'.repeat(width - 2) + '┤'));
  }

  printPromptBoxBottom(): void {
    const width = Math.min(process.stdout.columns || 80, 80);
    console.log(chalk.gray('└' + '─'.repeat(width - 2) + '┘'));
  }

  async promptForInput(prompt = 'You'): Promise<string> {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
    }

    // Show styled prompt box with CWD
    this.printPromptBox();

    return new Promise((resolve) => {
      this.rl!.question(chalk.gray('│ ') + chalk.cyan(`${prompt}`) + chalk.dim(' ❯ '), (answer) => {
        this.printPromptBoxBottom();
        resolve(answer.trim());
      });
    });
  }

  private createReadlineInterface(): readline.Interface {
    return readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
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

    const rl = this.createReadlineInterface();

    try {
      // Step 1: Select provider
      console.log(chalk.bold('\n📡 Step 1: Select your AI provider\n'));
      console.log('  ' + chalk.cyan('1)') + ' OpenAI (GPT-4, GPT-4o)');
      console.log('  ' + chalk.cyan('2)') + ' Anthropic (Claude)');
      console.log('  ' + chalk.cyan('3)') + ' OpenRouter (Access multiple models)');
      console.log('  ' + chalk.cyan('4)') + ' Custom (OpenAI-compatible API)\n');

      const providerChoice = await this.askQuestion(rl, 'Enter your choice (1-4): ');

      const providerMap: Record<string, ApiProvider> = {
        '1': 'openai',
        '2': 'anthropic',
        '3': 'openrouter',
        '4': 'custom',
      };

      const provider = providerMap[providerChoice];
      if (!provider) {
        this.printError('Invalid choice. Please run setup again.');
        rl.close();
        return false;
      }

      configManager.apiProvider = provider;
      const providerConfig = PROVIDER_CONFIG[provider];

      // For custom provider, ask for base URL
      if (provider === 'custom') {
        console.log(chalk.bold('\n🔗 Enter your custom API base URL'));
        const baseUrl = await this.askQuestion(rl, 'Base URL: ');
        if (baseUrl) {
          configManager.apiBaseUrl = baseUrl;
        }
      }

      // Step 2: Enter API key
      console.log(chalk.bold(`\n🔑 Step 2: Enter your ${providerConfig.displayName} API key\n`));

      if (provider === 'openrouter') {
        console.log(chalk.dim('  Get your API key at: https://openrouter.ai/keys\n'));
      } else if (provider === 'openai') {
        console.log(chalk.dim('  Get your API key at: https://platform.openai.com/api-keys\n'));
      } else if (provider === 'anthropic') {
        console.log(chalk.dim('  Get your API key at: https://console.anthropic.com/\n'));
      }

      const apiKey = await this.askQuestion(rl, 'API Key: ');
      if (!apiKey) {
        this.printError('API key is required. Please run setup again.');
        rl.close();
        return false;
      }

      configManager.apiKey = apiKey;

      // Step 3: Set default model (optional)
      console.log(chalk.bold('\n🤖 Step 3: Choose your default model\n'));
      console.log(chalk.dim(`  Default for ${providerConfig.displayName}: ${providerConfig.defaultModel}`));
      console.log(chalk.dim('  Press Enter to use the default, or type a model name.\n'));

      const model = await this.askQuestion(rl, `Model [${providerConfig.defaultModel}]: `);
      configManager.model = model || providerConfig.defaultModel;

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

      rl.close();
      return true;
    } catch (error) {
      rl.close();
      this.printError('Setup failed. Please try again.');
      return false;
    }
  }

  private askQuestion(rl: readline.Interface, question: string): Promise<string> {
    return new Promise((resolve) => {
      rl.question(chalk.cyan(question), (answer) => {
        resolve(answer.trim());
      });
    });
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
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }
}

export const terminalUI = new TerminalUI();
