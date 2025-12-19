import { type AgentRole } from './conversation.js';

/**
 * Base custom error class for Devvy
 */
export class DevvyError extends Error {
  constructor(message: string, public code: string, public context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Configuration-related errors
 */
export class ConfigError extends DevvyError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIG_ERROR', context);
  }
}

/**
 * LLM-related errors
 */
export class LLMError extends DevvyError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'LLM_ERROR', context);
  }
}

/**
 * API-related errors
 */
export class APIError extends DevvyError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'API_ERROR', context);
  }
}

/**
 * Agent-related errors
 */
export class AgentError extends DevvyError {
  constructor(message: string, public agentRole: AgentRole, context?: Record<string, unknown>) {
    super(message, 'AGENT_ERROR', context);
    this.name = `${agentRole.charAt(0).toUpperCase() + agentRole.slice(1)}Error`;
  }
}

/**
 * Tool-related errors
 */
export class ToolError extends DevvyError {
  constructor(message: string, public toolName: string, context?: Record<string, unknown>) {
    super(message, 'TOOL_ERROR', context);
  }
}

/**
 * File system-related errors
 */
export class FileSystemError extends DevvyError {
  constructor(message: string, public filePath?: string, context?: Record<string, unknown>) {
    super(message, 'FILE_SYSTEM_ERROR', context);
  }
}

/**
 * Validation errors
 */
export class ValidationError extends DevvyError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context);
  }
}

/**
 * Utility function to create errors from unknown sources
 */
export function createErrorFromUnknown(error: unknown): DevvyError {
  if (error instanceof DevvyError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new DevvyError(error.message, 'UNKNOWN_ERROR', {
      originalError: error.name,
      stack: error.stack
    });
  }
  
  return new DevvyError(String(error), 'UNKNOWN_ERROR', {
    originalError: error
  });
}
