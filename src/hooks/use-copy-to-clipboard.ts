/**
 * Copy to Clipboard Hook
 *
 * React hook for copying text to clipboard with feedback state
 *
 * Provides a simple interface for copying text to clipboard with automatic
 * "copied" state management and configurable timeout.
 *
 * @example
 * ```tsx
 * const { copied, copy, error } = useCopyToClipboard({ timeout: 2000 });
 *
 * <Button onClick={() => copy('https://example.com')}>
 *   {copied ? 'Copied!' : 'Copy Link'}
 * </Button>
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseCopyToClipboardOptions {
  /** Duration in ms before "copied" state resets. Default: 2000ms */
  timeout?: number;
  /** Callback fired on successful copy */
  onSuccess?: () => void;
  /** Callback fired on error */
  onError?: (error: Error) => void;
}

interface UseCopyToClipboardReturn {
  /** Whether text was recently copied (true for timeout duration) */
  copied: boolean;
  /** Function to copy text to clipboard */
  copy: (text: string) => Promise<void>;
  /** Error if copy operation failed */
  error: Error | null;
  /** Manually reset the copied state */
  reset: () => void;
}

/**
 * Hook for copying text to clipboard with feedback
 *
 * @param options - Configuration options
 * @returns Copy interface with state and methods
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {}
): UseCopyToClipboardReturn {
  const { timeout = 2000, onSuccess, onError } = options;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setError(null);
        setCopied(true);
        onSuccess?.();

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Set new timeout to reset copied state
        timeoutRef.current = setTimeout(() => {
          setCopied(false);
          timeoutRef.current = null;
        }, timeout);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to copy to clipboard');
        setError(error);
        setCopied(false);
        onError?.(error);
        console.error('Failed to copy to clipboard:', error);
      }
    },
    [timeout, onSuccess, onError]
  );

  return { copied, copy, error, reset };
}
