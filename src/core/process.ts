import { logger } from './logger.js';
import { createErrorFromUnknown } from './errors.js';
import { terminalUI } from '../cli/ui.js';
import { orchestrator } from './orchestrator.js';

export interface ShutdownHandler {
  name: string;
  priority: number;
  handler: () => Promise<void> | void;
}

class ProcessManager {
  private isShuttingDown = false;
  private handlers: ShutdownHandler[] = [];
  private signalReceived: NodeJS.Signals | null = null;

  constructor() {
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      const appError = createErrorFromUnknown(error);
      logger.error('Uncaught Exception', {
        error: appError.message,
        code: appError.code,
        stack: appError.stack
      });
      
      this.gracefulShutdown(1, 'uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      const error = createErrorFromUnknown(reason);
      logger.error('Unhandled Promise Rejection', {
        error: error.message,
        code: error.code,
        stack: error.stack
      });
      
      this.gracefulShutdown(1, 'unhandledRejection');
    });

    // Handle termination signals
    process.on('SIGINT', () => {
      this.handleSignal('SIGINT');
    });

    process.on('SIGTERM', () => {
      this.handleSignal('SIGTERM');
    });

    // Handle Windows-specific termination
    if (process.platform === 'win32') {
      process.on('SIGBREAK', () => {
        this.handleSignal('SIGBREAK');
      });
    }
  }

  private handleSignal(signal: NodeJS.Signals): void {
    if (this.isShuttingDown) {
      logger.warn(`Received ${signal} during shutdown, forcing exit`);
      process.exit(2);
    }

    logger.info(`Received ${signal}, starting graceful shutdown`);
    this.signalReceived = signal;
    this.gracefulShutdown(0, signal);
  }

  registerShutdownHandler(handler: ShutdownHandler): void {
    this.handlers.push(handler);
    // Sort by priority (higher numbers = later execution)
    this.handlers.sort((a, b) => a.priority - b.priority);
  }

  unregisterShutdownHandler(name: string): void {
    this.handlers = this.handlers.filter(h => h.name !== name);
  }

  private async gracefulShutdown(exitCode: number, reason: string): Promise<void> {
    if (this.isShuttingDown) return;

    this.isShuttingDown = true;

    try {
      logger.info(`Starting graceful shutdown (${reason})`);

      // Execute shutdown handlers in priority order
      for (const handler of this.handlers) {
        try {
          logger.debug(`Executing shutdown handler: ${handler.name}`);
          await Promise.race([
            handler.handler(),
            new Promise<void>((_, reject) => 
              setTimeout(() => reject(new Error('Handler timeout')), 5000)
            )
          ]);
        } catch (error) {
          logger.error(`Shutdown handler ${handler.name} failed`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      logger.info('Graceful shutdown completed');
    } catch (error) {
      logger.error('Error during graceful shutdown', {
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      process.exit(exitCode);
    }
  }

  getSignalReceived(): NodeJS.Signals | null {
    return this.signalReceived;
  }

  isGracefullyShuttingDown(): boolean {
    return this.isShuttingDown;
  }
}

// Global process manager instance
export const processManager = new ProcessManager();

// Register essential shutdown handlers
processManager.registerShutdownHandler({
  name: 'cleanup-cli',
  priority: 10,
  handler: async () => {
    try {
      terminalUI.close();
    } catch (error) {
      logger.error('Failed to close terminal UI', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
});

processManager.registerShutdownHandler({
  name: 'cleanup-state',
  priority: 20,
  handler: async () => {
    try {
      // Clear any ongoing operations
      if (orchestrator) {
        // Note: orchestrator cleanup would be implemented here if needed
      }
    } catch (error) {
      logger.error('Failed to cleanup state', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
});
