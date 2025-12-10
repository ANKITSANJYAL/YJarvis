import { logger } from './logger';
import { ERROR_MESSAGES } from '../constants/prompts';

export class JarvisError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'JarvisError';
  }
}

export class APIError extends JarvisError {
  constructor(message: string, cause?: Error) {
    super(
      message,
      'API_ERROR',
      ERROR_MESSAGES.GENERIC_ERROR,
      cause
    );
    this.name = 'APIError';
  }
}

export class RateLimitError extends JarvisError {
  constructor() {
    super(
      'Rate limit exceeded',
      'RATE_LIMIT',
      ERROR_MESSAGES.RATE_LIMIT
    );
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends JarvisError {
  constructor(cause?: Error) {
    super(
      'Network error occurred',
      'NETWORK_ERROR',
      ERROR_MESSAGES.NETWORK_ERROR,
      cause
    );
    this.name = 'NetworkError';
  }
}

export class TranscriptError extends JarvisError {
  constructor() {
    super(
      'No transcript available',
      'NO_TRANSCRIPT',
      ERROR_MESSAGES.NO_TRANSCRIPT
    );
    this.name = 'TranscriptError';
  }
}

/**
 * Centralized error handler
 */
export const errorHandler = {
  /**
   * Handle and log an error
   */
  handle(error: unknown, context?: string): JarvisError {
    const jarvisError = this.normalize(error);
    
    logger.error(`Error in ${context || 'unknown context'}`, {
      code: jarvisError.code,
      message: jarvisError.message,
      cause: jarvisError.cause,
    });
    
    return jarvisError;
  },
  
  /**
   * Normalize any error to JarvisError
   */
  normalize(error: unknown): JarvisError {
    if (error instanceof JarvisError) {
      return error;
    }
    
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('rate limit')) {
        return new RateLimitError();
      }
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return new NetworkError(error);
      }
      
      if (error.message.includes('API key')) {
        return new JarvisError(
          error.message,
          'API_KEY_ERROR',
          ERROR_MESSAGES.API_KEY_MISSING,
          error
        );
      }
      
      return new JarvisError(
        error.message,
        'UNKNOWN_ERROR',
        ERROR_MESSAGES.GENERIC_ERROR,
        error
      );
    }
    
    // Unknown error type
    return new JarvisError(
      String(error),
      'UNKNOWN_ERROR',
      ERROR_MESSAGES.GENERIC_ERROR
    );
  },
  
  /**
   * Get user-friendly error message
   */
  getUserMessage(error: unknown): string {
    const jarvisError = this.normalize(error);
    return jarvisError.userMessage;
  },
  
  /**
   * Create retry handler
   */
  createRetryHandler<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    backoffMs = 500
  ): () => Promise<T> {
    return async () => {
      let lastError: Error | undefined;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          if (i < maxRetries - 1) {
            logger.debug(`Retry attempt ${i + 1}/${maxRetries}`, { error: lastError.message });
            await new Promise(resolve => setTimeout(resolve, backoffMs * Math.pow(2, i)));
          }
        }
      }
      
      throw this.handle(lastError, 'Retry handler');
    };
  },
  
  /**
   * Wrap async function with error handling
   */
  wrap<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    context: string
  ): (...args: TArgs) => Promise<TReturn> {
    return async (...args: TArgs) => {
      try {
        return await fn(...args);
      } catch (error) {
        throw this.handle(error, context);
      }
    };
  },
};

/**
 * Decorator for error handling (for class methods)
 */
export function HandleErrors(context?: string) {
  return function (
    _target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const methodContext = context || propertyKey;
    
    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        throw errorHandler.handle(error, methodContext);
      }
    };
    
    return descriptor;
  };
}
