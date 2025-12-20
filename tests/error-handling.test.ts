import { describe, expect, test, beforeEach, afterEach, jest } from 'bun:test';
import { DevvyError, ConfigError, LLMError, APIError, AgentError, ToolError, FileSystemError, ValidationError, createErrorFromUnknown } from '../src/core/errors.js';
import { ConsoleLogger, LogLevel } from '../src/core/logger.js';

// Mock console.error for testing
global.console.error = jest.fn();

describe('Error Classes', () => {
  beforeEach(() => {
    console.error.mockClear();
  });

  test('DevvyError should create proper error instances', () => {
    const error = new DevvyError('Test error', 'TEST_ERROR', { context: 'test' });
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DevvyError);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.context).toEqual({ context: 'test' });
    expect(error.name).toBe('DevvyError');
  });

  test('ConfigError should extend DevvyError', () => {
    const error = new ConfigError('Config missing', { missing: 'apiKey' });
    expect(error).toBeInstanceOf(DevvyError);
    expect(error.code).toBe('CONFIG_ERROR');
    expect(error.name).toBe('ConfigError');
  });

  test('LLMError should extend DevvyError', () => {
    const error = new LLMError('LLM failed', { model: 'gpt-4' });
    expect(error).toBeInstanceOf(DevvyError);
    expect(error.code).toBe('LLM_ERROR');
  });

  test('APIError should extend DevvyError', () => {
    const error = new APIError('API failed', { endpoint: 'models.list()' });
    expect(error).toBeInstanceOf(DevvyError);
    expect(error.code).toBe('API_ERROR');
  });

  test('AgentError should extend DevvyError', () => {
    const error = new AgentError('Agent failed', 'coder', { task: 'coding' });
    expect(error).toBeInstanceOf(DevvyError);
    expect(error.code).toBe('AGENT_ERROR');
    expect(error.agentRole).toBe('coder');
    expect(error.name).toBe('CoderError');
  });

  test('ToolError should extend DevvyError', () => {
    const error = new ToolError('Tool failed', 'read_file', { path: '/test' });
    expect(error).toBeInstanceOf(DevvyError);
    expect(error.code).toBe('TOOL_ERROR');
    expect(error.toolName).toBe('read_file');
  });

  test('FileSystemError should extend DevvyError', () => {
    const error = new FileSystemError('File not found', '/test/path', { operation: 'read' });
    expect(error).toBeInstanceOf(DevvyError);
    expect(error.code).toBe('FILE_SYSTEM_ERROR');
    expect(error.filePath).toBe('/test/path');
  });

  test('ValidationError should extend DevvyError', () => {
    const error = new ValidationError('Invalid input', { field: 'email' });
    expect(error).toBeInstanceOf(DevvyError);
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});

describe('createErrorFromUnknown', () => {
  test('should handle DevvyError instances', () => {
    const originalError = new ConfigError('Original error', { test: 'value' });
    const result = createErrorFromUnknown(originalError);
    expect(result).toBe(originalError);
  });

  test('should handle regular Error instances', () => {
    const originalError = new Error('Regular error');
    const result = createErrorFromUnknown(originalError);
    expect(result).toBeInstanceOf(DevvyError);
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.context).toEqual({
      originalError: 'Error',
      stack: originalError.stack
    });
  });

  test('should handle non-Error unknown values', () => {
    const result = createErrorFromUnknown('String error');
    expect(result).toBeInstanceOf(DevvyError);
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe('String error');
    expect(result.context).toEqual({ originalError: 'String error' });
  });

  test('should handle null/undefined', () => {
    const result = createErrorFromUnknown(null);
    expect(result).toBeInstanceOf(DevvyError);
    expect(result.message).toBe('null');
  });
});

describe('ConsoleLogger', () => {
  let logger: ConsoleLogger;

  beforeEach(() => {
    logger = ConsoleLogger.getInstance();
    console.error.mockClear();
  });

  test('should be singleton', () => {
    const logger2 = ConsoleLogger.getInstance();
    expect(logger).toBe(logger2);
  });

  test('debug should log with DEBUG level', () => {
    logger.debug('Debug message', { test: 'value' });
    expect(console.error).toHaveBeenCalled();
    const call = console.error.mock.calls[0][0];
    expect(call).toContain('[DEBUG]');
    expect(call).toContain('Debug message');
  });

  test('info should log with INFO level', () => {
    logger.info('Info message');
    expect(console.error).toHaveBeenCalled();
    const call = console.error.mock.calls[0][0];
    expect(call).toContain('[INFO]');
    expect(call).toContain('Info message');
  });

  test('warn should log with WARN level', () => {
    logger.warn('Warning message');
    expect(console.error).toHaveBeenCalled();
    const call = console.error.mock.calls[0][0];
    expect(call).toContain('[WARN]');
    expect(call).toContain('Warning message');
  });

  test('error should log with ERROR level for string messages', () => {
    logger.error('Error message', { context: 'test' });
    expect(console.error).toHaveBeenCalled();
    const call = console.error.mock.calls[0][0];
    expect(call).toContain('[ERROR]');
    expect(call).toContain('Error message');
  });

  test('error should handle DevvyError instances', () => {
    const error = new ConfigError('Config error', { missing: 'apiKey' });
    logger.error(error);
    expect(console.error).toHaveBeenCalled();
    const call = console.error.mock.calls[0][0];
    expect(call).toContain('[ERROR]');
    expect(call).toContain('Config error');
  });

  test('error should handle regular Error instances', () => {
    const error = new Error('Regular error');
    logger.error(error);
    expect(console.error).toHaveBeenCalled();
    const call = console.error.mock.calls[0][0];
    expect(call).toContain('[ERROR]');
    expect(call).toContain('Regular error');
  });

  test('error should include context in separate log call', () => {
    logger.error('Error with context', { test: 'value', nested: { data: 'info' } });
    expect(console.error).toHaveBeenCalledTimes(2);
    const contextCall = console.error.mock.calls[1][0];
    expect(contextCall).toContain('test');
    expect(contextCall).toContain('value');
  });
});

describe('Error Integration Tests', () => {
  test('error handling workflow', () => {
    const logger = ConsoleLogger.getInstance();
    
    // Simulate an error being thrown and caught
    try {
      throw new APIError('API failed', { endpoint: 'test', status: 500 });
    } catch (error) {
      const appError = createErrorFromUnknown(error);
      logger.error(appError);
      
      expect(appError).toBeInstanceOf(APIError);
      expect(appError.code).toBe('API_ERROR');
      expect(console.error).toHaveBeenCalled();
    }
  });

  test('file system error handling', () => {
    const logger = ConsoleLogger.getInstance();
    
    try {
      throw new FileSystemError('File not found', '/test/path', { operation: 'read' });
    } catch (error) {
      const appError = createErrorFromUnknown(error);
      logger.error(appError);
      
      expect(appError).toBeInstanceOf(FileSystemError);
      expect(appError.filePath).toBe('/test/path');
      expect(console.error).toHaveBeenCalled();
    }
  });
});
