/**
 * Auth Retry Service
 *
 * Provides smart retry logic with exponential backoff for transient failures.
 * Prevents overwhelming the server and provides better UX during network issues.
 */

import { RetryOptions, DEFAULT_RETRY_OPTIONS, AuthErrorCode } from './types'
import { AuthErrorService } from './errorService'

/**
 * Service for retrying failed operations with exponential backoff
 */
export class AuthRetryService {
  /**
   * Execute an operation with retry logic
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
    let lastError: Error | null = null
    let attempt = 0

    while (attempt < opts.maxAttempts) {
      try {
        // Execute the operation
        const result = await operation()
        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        attempt++

        // Check if we should retry this error
        const shouldRetry = opts.shouldRetry(lastError, attempt)
        if (!shouldRetry || attempt >= opts.maxAttempts) {
          break
        }

        // Calculate backoff delay
        const delay = this.calculateBackoff(attempt, opts)

        // Notify about retry
        if (opts.onRetry) {
          opts.onRetry(attempt, lastError)
        }

        console.log(
          `[AuthRetryService] Retrying operation (attempt ${attempt}/${opts.maxAttempts}) after ${delay}ms`,
          { error: lastError.message }
        )

        // Wait before retrying
        await this.delay(delay)
      }
    }

    // Max attempts reached
    if (opts.onMaxAttemptsReached && lastError) {
      opts.onMaxAttemptsReached(lastError)
    }

    console.error(
      `[AuthRetryService] Operation failed after ${opts.maxAttempts} attempts`,
      { error: lastError?.message }
    )

    // Throw the last error
    throw lastError || new Error('Operation failed after maximum retry attempts')
  }

  /**
   * Calculate backoff delay using exponential backoff
   */
  static calculateBackoff(attempt: number, options: RetryOptions): number {
    const exponentialDelay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1)

    // Add jitter (random variation) to prevent thundering herd
    const jitter = Math.random() * 0.3 * exponentialDelay // ±30% jitter

    // Ensure delay doesn't exceed max
    const delay = Math.min(exponentialDelay + jitter, options.maxDelay)

    return Math.floor(delay)
  }

  /**
   * Delay execution for specified milliseconds
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Determine if an error is transient and should be retried
   */
  static isTransientError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false
    }

    // Network errors are transient
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return true
    }

    // Timeout errors are transient
    if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      return true
    }

    // Server errors (5xx) are transient
    if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
      return true
    }

    // Rate limiting errors are transient
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return true
    }

    return false
  }

  /**
   * Determine if an error should NOT be retried
   */
  static isNonRetriableError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false
    }

    // Client errors (4xx except 429) should not be retried
    if (
      error.message.includes('400') ||
      error.message.includes('401') ||
      error.message.includes('403') ||
      error.message.includes('404')
    ) {
      return true
    }

    // Permission errors should not be retried
    if (error.message.includes('permission') || error.message.includes('forbidden')) {
      return true
    }

    // Not found errors should not be retried
    if (error.message.includes('not found')) {
      return true
    }

    return false
  }

  /**
   * Create a retry options object for auth-specific operations
   */
  static createAuthRetryOptions(overrides?: Partial<RetryOptions>): RetryOptions {
    return {
      ...DEFAULT_RETRY_OPTIONS,
      shouldRetry: (error: Error, attempt: number) => {
        // Don't retry if it's a non-retriable error
        if (this.isNonRetriableError(error)) {
          console.log('[AuthRetryService] Non-retriable error, stopping retries:', error.message)
          return false
        }

        // Retry if it's a transient error
        if (this.isTransientError(error)) {
          console.log(`[AuthRetryService] Transient error detected, will retry (attempt ${attempt})`)
          return true
        }

        // For unknown errors, retry up to 2 times only
        if (attempt < 2) {
          console.log(`[AuthRetryService] Unknown error, will retry (attempt ${attempt})`)
          return true
        }

        console.log('[AuthRetryService] Max retries for unknown error, stopping')
        return false
      },
      ...overrides,
    }
  }

  /**
   * Retry with progress callback for UI updates
   */
  static async withRetryProgress<T>(
    operation: () => Promise<T>,
    onProgress: (attempt: number, maxAttempts: number, nextRetryIn: number) => void,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const opts = this.createAuthRetryOptions(options)

    return this.withRetry(operation, {
      ...opts,
      onRetry: (attempt, error) => {
        const nextDelay = this.calculateBackoff(attempt + 1, opts)
        onProgress(attempt, opts.maxAttempts, nextDelay)

        if (opts.onRetry) {
          opts.onRetry(attempt, error)
        }
      },
    })
  }

  /**
   * Check if network is available
   */
  static isOnline(): boolean {
    return typeof window !== 'undefined' ? window.navigator.onLine : true
  }

  /**
   * Wait for network to come online
   */
  static async waitForOnline(timeoutMs: number = 30000): Promise<boolean> {
    if (typeof window === 'undefined') {
      return true
    }

    return new Promise((resolve) => {
      if (window.navigator.onLine) {
        resolve(true)
        return
      }

      const timeout = setTimeout(() => {
        window.removeEventListener('online', onlineHandler)
        resolve(false)
      }, timeoutMs)

      const onlineHandler = () => {
        clearTimeout(timeout)
        window.removeEventListener('online', onlineHandler)
        resolve(true)
      }

      window.addEventListener('online', onlineHandler)
    })
  }

  /**
   * Retry operation with network awareness
   */
  static async withNetworkAwareRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const opts = this.createAuthRetryOptions({
      ...options,
      shouldRetry: (error, attempt) => {
        // If offline, wait for network before retrying
        if (!this.isOnline()) {
          console.log('[AuthRetryService] Device offline, will wait for network')
          return false // Will be handled by waiting for online event
        }

        // Use default retry logic
        return this.createAuthRetryOptions().shouldRetry(error, attempt)
      },
    })

    try {
      return await this.withRetry(operation, opts)
    } catch (error) {
      // If failed due to network, wait for online and retry once more
      if (this.isTransientError(error) && !this.isOnline()) {
        console.log('[AuthRetryService] Waiting for network to come online...')
        const online = await this.waitForOnline()

        if (online) {
          console.log('[AuthRetryService] Network online, retrying operation')
          return await operation()
        }
      }

      throw error
    }
  }
}
