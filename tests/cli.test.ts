import { describe, it, expect, mock } from 'bun:test';
import { CommandHandler } from '../src/cli/commands.js';
import { terminalUI } from '../src/cli/ui.js';
import { orchestrator } from '../src/core/orchestrator.js';
import { configManager } from '../src/config/index.js';

// Mock dependencies
mock.module('../src/cli/ui.js', () => ({
  terminalUI: {
    printInfo: mock(() => {}),
    printError: mock(() => {}),
    printSuccess: mock(() => {}),
    printHelp: mock(() => {}),
    printConfig: mock(() => {}),
    printConversationHistory: mock(() => {}),
    selectModel: mock(async () => {}),
    printAgentStart: mock(() => {}),
    printChunk: mock(() => {}),
    printComplete: mock(() => {}),
    startSpinner: mock(() => {}),
    stopSpinner: mock(() => {}),
  },
}));

mock.module('../src/core/orchestrator.js', () => ({
  orchestrator: {
    clearConversation: mock(() => {}),
    addUserMessage: mock(() => {}),
    runAgent: mock(async function* () {}),
    runReviewCycle: mock(async function* () {}),
    brainstorm: mock(async function* () {}),
  },
}));

mock.module('../src/config/index.js', () => ({
  configManager: {
    isFirstRun: () => false,
    hasApiKey: () => true,
  },
}));

describe('CommandHandler', () => {
  const commandHandler = new CommandHandler();

  it('should handle /exit command', async () => {
    const result = await commandHandler.handleCommand('/exit');
    expect(result).toBe(false);
  });

  it('should handle /help command', async () => {
    const result = await commandHandler.handleCommand('/help');
    expect(result).toBe(true);
    expect(terminalUI.printHelp).toHaveBeenCalled();
  });

  it('should handle /config command', async () => {
    const result = await commandHandler.handleCommand('/config');
    expect(result).toBe(true);
    expect(terminalUI.printConfig).toHaveBeenCalled();
  });

  it('should handle /clear command', async () => {
    const result = await commandHandler.handleCommand('/clear');
    expect(result).toBe(true);
    expect(orchestrator.clearConversation).toHaveBeenCalled();
  });

  it('should handle /history command', async () => {
    const result = await commandHandler.handleCommand('/history');
    expect(result).toBe(true);
    expect(terminalUI.printConversationHistory).toHaveBeenCalled();
  });

  it('should handle /model command', async () => {
    const result = await commandHandler.handleCommand('/model');
    expect(result).toBe(true);
    expect(terminalUI.selectModel).toHaveBeenCalled();
  });

  it('should handle agent command', async () => {
    const result = await commandHandler.handleCommand('@coder Test message');
    expect(result).toBe(true);
    expect(orchestrator.runAgent).toHaveBeenCalledWith('coder', 'Test message');
  });

  it('should handle unknown command', async () => {
    const result = await commandHandler.handleCommand('/unknown');
    expect(result).toBe(true);
    expect(terminalUI.printError).toHaveBeenCalledWith('Unknown command: /unknown');
  });
});
