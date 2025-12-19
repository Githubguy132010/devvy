import { logger } from './logger.js';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: (error: unknown) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  retryableErrors: (error: unknown) => {
    if (error instanceof Error) {
      // Common retryable error patterns
      return (
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('rate limit') ||
        error.message.includes('too many requests') ||
        error.message.includes('timeout') ||
        error.message.includes('network') ||
        error.message.includes('connection')
      );
    }
    return false;
  },
};

/**
 * Exponential backoff retry utility
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const result = await operation();
      return {
        success: true,
        result,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      logger.debug(`Operation failed (attempt ${attempt}/${opts.maxAttempts})`, {
        error: lastError.message,
      });

      // Don't retry on the last attempt
      if (attempt === opts.maxAttempts) {
        logger.error(`Operation failed after ${opts.maxAttempts} attempts`, {
          error: lastError.message,
        });
        break;
      }

      // Check if error is retryable
      if (!opts.retryableErrors(lastError)) {
        logger.info('Error is not retryable', { error: lastError.message });
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitter = delay * 0.1 * Math.random();
      const finalDelay = delay + jitter;

      logger.info(`Retrying operation in ${Math.round(finalDelay)}ms (attempt ${attempt + 1}/${opts.maxAttempts})`);
      
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: opts.maxAttempts,
  };
}

/**
 * Circuit breaker pattern implementation
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private options: {
      failureThreshold?: number;
      recoveryTimeout?: number;
      monitoringPeriod?: number;
    } = {}
  ) {}

  private get failureThreshold(): number {
    return this.options.failureThreshold ?? 5;
  }

  private get recoveryTimeout(): number {
    return this.options.recoveryTimeout ?? 60000; // 1 minute
  }

  private get monitoringPeriod(): number {
    return this.options.monitoringPeriod ?? 10000; // 10 seconds
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
        logger.info('Circuit breaker entering half-open state');
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state !== 'closed') {
      this.state = 'closed';
      logger.info('Circuit breaker reset to closed state');
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
      logger.warn(`Circuit breaker opened after ${this.failures} failures`);
    }
  }

  getState(): string {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }

  reset(): void {
    this.failures = 0;
    this.state = 'closed';
    logger.info('Circuit breaker manually reset');
  }
}
