import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

interface UseRetryResult<T> {
  execute: (...args: any[]) => Promise<T | null>;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  reset: () => void;
}

export function useRetry<T>(
  fn: (...args: any[]) => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryResult<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);

    let lastError: any;
    let currentDelay = retryDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        const result = await fn(...args);
        setIsLoading(false);
        return result;
      } catch (err: any) {
        lastError = err;
        
        // Don't retry on certain errors
        if (err.message?.includes('insufficient funds')) {
          setError('Insufficient SOL balance');
          setIsLoading(false);
          return null;
        }
        if (err.code === 4001) { // User rejected
          setError('Transaction rejected by user');
          setIsLoading(false);
          return null;
        }
        
        if (attempt < maxRetries) {
          await sleep(currentDelay);
          currentDelay *= backoffMultiplier;
        }
      }
    }

    setError(lastError?.message || 'Failed after multiple attempts');
    setIsLoading(false);
    return null;
  }, [fn, maxRetries, retryDelay, backoffMultiplier]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setRetryCount(0);
  }, []);

  return { execute, isLoading, error, retryCount, reset };
}
