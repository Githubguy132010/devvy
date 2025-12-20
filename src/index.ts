#!/usr/bin/env node

import { Command } from 'commander';
import { commandHandler } from './cli/index.js';
import { configManager, type ApiProvider } from './config/index.js';
import { llmClient } from './core/index.js';
import { terminalUI } from './cli/ui.js';
import { logger } from './core/logger.js';
import { processManager } from './core/process.js';
import { createErrorFromUnknown } from './core/errors.js';
import './tools/init.js'; // Initialize tools on startup

// Register main process handlers
processManager.registerShutdownHandler({
  name: 'main-cleanup',
  priority: 100,
  handler: async () => {
    logger.info('Main application cleanup completed');
  }
});

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
    try {
      await terminalUI.runSetupWizard();
    } catch (error) {
      const appError = createErrorFromUnknown(error);
      logger.error('Setup failed', { error: appError.message });
      process.exit(1);
    }
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
    try {
      if (model) {
        configManager.model = model;
        terminalUI.printSuccess(`Model set to: ${model}`);
      } else {
        // Fetch and display available models
        await terminalUI.selectModel();
      }
    } catch (error) {
      const appError = createErrorFromUnknown(error);
      logger.error('Failed to set model', { error: appError.message });
      terminalUI.printError(`Failed to set model: ${appError.message}`);
    }
  });

configCmd
  .command('set-provider <provider>')
  .description('Set the API provider (openai, anthropic, openrouter, custom)')
  .action((provider: string) => {
    try {
      const validProviders = ['openai', 'anthropic', 'openrouter', 'custom'];
      if (!validProviders.includes(provider)) {
        terminalUI.printError(`Invalid provider. Choose from: ${validProviders.join(', ')}`);
        return;
      }
      configManager.apiProvider = provider as ApiProvider;
      llmClient.resetClient();
      terminalUI.printSuccess(`Provider set to: ${provider}`);
    } catch (error) {
      const appError = createErrorFromUnknown(error);
      logger.error('Failed to set provider', { error: appError.message });
      terminalUI.printError(`Failed to set provider: ${appError.message}`);
    }
  });

configCmd
  .command('set-base-url <url>')
  .description('Set a custom API base URL (for custom providers)')
  .action((url: string) => {
    try {
      configManager.apiBaseUrl = url;
      llmClient.resetClient();
      terminalUI.printSuccess(`Base URL set to: ${url}`);
    } catch (error) {
      const appError = createErrorFromUnknown(error);
      logger.error('Failed to set base URL', { error: appError.message });
      terminalUI.printError(`Failed to set base URL: ${appError.message}`);
    }
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
