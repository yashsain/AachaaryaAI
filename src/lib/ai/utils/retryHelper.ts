/**
 * Retry Helper
 *
 * Provides exponential backoff retry logic for transient failures
 * (rate limits, network errors, API timeouts)
 */

interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  retryableErrors?: string[] // Error messages to retry on
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'rate limit',
    'timeout',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    '429',
    '503',
    '500',
  ],
}

/**
 * Check if an error is retryable based on its message
 */
function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  const errorMessage = error.message.toLowerCase()
  return retryableErrors.some((pattern) => errorMessage.includes(pattern.toLowerCase()))
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt - 1)
  return Math.min(delay, options.maxDelayMs)
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - The async function to retry
 * @param options - Retry configuration
 * @returns The result of the function
 * @throws The last error if all retries fail
 *
 * @example
 * const result = await retryWithBackoff(
 *   () => analyzeScopeFromPDF(url, title, chapter, syllabus, existing),
 *   { maxAttempts: 3 }
 * )
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Check if we should retry
      const isLastAttempt = attempt === opts.maxAttempts
      const shouldRetry = isRetryableError(lastError, opts.retryableErrors)

      if (isLastAttempt || !shouldRetry) {
        // Don't retry on last attempt or if error is not retryable
        console.error(`[RETRY] Attempt ${attempt}/${opts.maxAttempts} failed (no retry):`, lastError.message)
        throw lastError
      }

      // Calculate delay and retry
      const delayMs = calculateDelay(attempt, opts)
      console.warn(
        `[RETRY] Attempt ${attempt}/${opts.maxAttempts} failed. Retrying in ${delayMs}ms...`,
        lastError.message
      )
      await sleep(delayMs)
    }
  }

  // This should never happen, but TypeScript needs it
  throw lastError || new Error('Retry failed with no error')
}

/**
 * Retry specifically for PDF analysis operations
 * Pre-configured for common PDF analysis errors
 */
export async function retryPdfAnalysis<T>(
  fn: () => Promise<T>,
  materialTitle: string
): Promise<T> {
  console.log(`[RETRY_PDF] Starting analysis for: ${materialTitle}`)

  return retryWithBackoff(fn, {
    maxAttempts: 3,
    initialDelayMs: 2000, // 2 seconds
    maxDelayMs: 30000, // 30 seconds
    retryableErrors: [
      'rate limit',
      'quota',
      'timeout',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      '429',
      '503',
      '500',
      'fetch failed',
      'network',
    ],
  })
}
