import chalk from 'chalk';
import ora from 'ora';
import * as readline from 'readline';
import { orchestrator, type AgentType } from '../core/index.js';
import { conversationManager } from '../core/conversation.js';
import { configManager } from '../config/index.js';

const AGENT_COLORS: Record<AgentType | 'user', (text: string) => string> = {
  coder: chalk.green,
  critic: chalk.yellow,
  debugger: chalk.red,
  architect: chalk.blue,
  enduser: chalk.magenta,
  user: chalk.cyan,
};

const AGENT_ICONS: Record<AgentType | 'user', string> = {
  coder: '💻',
  critic: '🔍',
  debugger: '🐛',
  architect: '🏗️',
  enduser: '👤',
  user: '🧑',
};

export class TerminalUI {
  private rl: readline.Interface | null = null;
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
    return `${icon} ${color(chalk.bold(`[${name}]`))}\n${content}\n`;
  }

  printAgentStart(agent: AgentType): void {
    const color = AGENT_COLORS[agent];
    const icon = AGENT_ICONS[agent];
    const name = agent.charAt(0).toUpperCase() + agent.slice(1);
    process.stdout.write(`\n${icon} ${color(chalk.bold(`[${name}]`))}\n`);
  }

  printChunk(content: string): void {
    process.stdout.write(content);
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

  async promptForInput(prompt = 'You'): Promise<string> {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
    }

    return new Promise((resolve) => {
      this.rl!.question(chalk.cyan(`${prompt}> `), (answer) => {
        resolve(answer.trim());
      });
    });
  }

  close(): void {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }
}

export const terminalUI = new TerminalUI();
