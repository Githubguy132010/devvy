#!/usr/bin/env node

import { Command } from 'commander';
import { commandHandler } from './cli/index.js';
import { configManager } from './config/index.js';
import { llmClient } from './core/index.js';
import { terminalUI } from './cli/ui.js';

const program = new Command();

program
  .name('devvy')
  .description('Multi-Agent Coding Assistant - Let AI agents collaborate on your code')
  .version('1.0.0');

// Main interactive command
program
  .command('chat', { isDefault: true })
  .description('Start an interactive chat session with the agents')
  .action(async () => {
    await commandHandler.startInteractiveSession();
  });

// Configuration commands
const configCmd = program
  .command('config')
  .description('Manage Devvy configuration');

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    terminalUI.printConfig();
  });

configCmd
  .command('set-key <key>')
  .description('Set your API key (BYOK - Bring Your Own Key)')
  .action((key: string) => {
    configManager.apiKey = key;
    terminalUI.printSuccess('API key saved successfully!');
  });

configCmd
  .command('set-model <model>')
  .description('Set the model to use (e.g., gpt-4o, gpt-4-turbo)')
  .action((model: string) => {
    configManager.model = model;
    terminalUI.printSuccess(`Model set to: ${model}`);
  });

configCmd
  .command('set-provider <provider>')
  .description('Set the API provider (openai, anthropic, custom)')
  .action((provider: string) => {
    if (!['openai', 'anthropic', 'custom'].includes(provider)) {
      terminalUI.printError('Invalid provider. Choose from: openai, anthropic, custom');
      return;
    }
    configManager.apiProvider = provider as 'openai' | 'anthropic' | 'custom';
    terminalUI.printSuccess(`Provider set to: ${provider}`);
  });

configCmd
  .command('set-base-url <url>')
  .description('Set a custom API base URL (for custom providers)')
  .action((url: string) => {
    configManager.apiBaseUrl = url;
    llmClient.resetClient();
    terminalUI.printSuccess(`Base URL set to: ${url}`);
  });

configCmd
  .command('clear')
  .description('Clear all configuration')
  .action(() => {
    configManager.clearConfig();
    llmClient.resetClient();
    terminalUI.printSuccess('Configuration cleared.');
  });

// Parse and execute
program.parse();
