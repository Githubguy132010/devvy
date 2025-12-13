#!/usr/bin/env node

import { Command } from 'commander';
import { commandHandler } from './cli/index.js';
import { configManager, type ApiProvider } from './config/index.js';
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

// Setup command
program
  .command('setup')
  .description('Run the interactive setup wizard')
  .action(async () => {
    await terminalUI.runSetupWizard();
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
    configManager.setupComplete = true;
    terminalUI.printSuccess('API key saved successfully!');
  });

configCmd
  .command('set-model [model]')
  .description('Set the model to use (fetches available models if no model specified)')
  .action(async (model?: string) => {
    if (model) {
      configManager.model = model;
      terminalUI.printSuccess(`Model set to: ${model}`);
    } else {
      // Fetch and display available models
      await terminalUI.selectModel();
    }
  });

configCmd
  .command('set-provider <provider>')
  .description('Set the API provider (openai, anthropic, openrouter, custom)')
  .action((provider: string) => {
    const validProviders = ['openai', 'anthropic', 'openrouter', 'custom'];
    if (!validProviders.includes(provider)) {
      terminalUI.printError(`Invalid provider. Choose from: ${validProviders.join(', ')}`);
      return;
    }
    configManager.apiProvider = provider as ApiProvider;
    llmClient.resetClient();
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
