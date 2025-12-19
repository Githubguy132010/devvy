import chalk from 'chalk';
import { DevvyError, createErrorFromUnknown } from './errors.js';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string | Error, context?: Record<string, unknown>): void;
}

/**
 * Re-export for convenience
 */
export { createErrorFromUnknown } from './errors.js';

/**
 * Console logger implementation with colored output
 */
export class ConsoleLogger implements Logger {
  private static instance: ConsoleLogger;
  
  private constructor() {}
  
  public static getInstance(): ConsoleLogger {
    if (!ConsoleLogger.instance) {
      ConsoleLogger.instance = new ConsoleLogger();
    }
    return ConsoleLogger.instance;
  }
  
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }
  
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }
  
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }
  
  error(message: string | Error, context?: Record<string, unknown>): void {
    if (message instanceof Error) {
      const error = message instanceof DevvyError ? message : createErrorFromUnknown(message);
      this.log(LogLevel.ERROR, error.message, {
        errorCode: error.code,
        ...error.context,
        ...context
      });
    } else {
      this.log(LogLevel.ERROR, message, context);
    }
  }
  
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    let levelColor: (msg: string) => string;
    let levelPrefix: string;
    
    switch (level) {
      case LogLevel.DEBUG:
        levelColor = chalk.blue;
        levelPrefix = 'DEBUG';
        break;
      case LogLevel.INFO:
        levelColor = chalk.green;
        levelPrefix = 'INFO';
        break;
      case LogLevel.WARN:
        levelColor = chalk.yellow;
        levelPrefix = 'WARN';
        break;
      case LogLevel.ERROR:
        levelColor = chalk.red;
        levelPrefix = 'ERROR';
        break;
    }
    
    const formattedMessage = levelColor(`[${timestamp}] [${levelPrefix}] ${message}`);
    console.error(formattedMessage);
    
    if (context && Object.keys(context).length > 0) {
      console.error(chalk.gray(JSON.stringify(context, null, 2)));
    }
  }
}

/**
 * Global logger instance
 */
export const logger = ConsoleLogger.getInstance();
