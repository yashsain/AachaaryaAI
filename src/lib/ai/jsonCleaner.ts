/**
 * Aggressive JSON Cleaner for Gemini Responses
 *
 * Handles all edge cases: markdown wrappers, comments, trailing commas,
 * garbage text before/after, partial responses, encoding issues
 */

export function cleanGeminiJSON(rawResponse: string): string {
  let cleaned = rawResponse.trim()

  // Strategy 1: Remove markdown code blocks (all variants)
  // Handle: ```json\n{...}\n```, ```{...}```, ````json...````
  cleaned = cleaned.replace(/^`+json\s*/i, '')
  cleaned = cleaned.replace(/^`+\s*/, '')
  cleaned = cleaned.replace(/\s*`+$/g, '')

  // Strategy 2: Extract JSON by finding matching braces
  // Find first { and last } to handle text before/after
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1)
  }

  // Strategy 3: Remove explanatory text that might be inside
  // Pattern: {...} some text {...} -> take the largest {...}
  const matches = cleaned.match(/\{[\s\S]*\}/g)
  if (matches && matches.length > 0) {
    // Take the longest match (most likely to be complete)
    cleaned = matches.reduce((a, b) => a.length > b.length ? a : b)
  }

  // Strategy 4: Fix common JSON syntax issues

  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1')

  // Remove single-line comments (// ...)
  cleaned = cleaned.replace(/\/\/.*/g, '')

  // Remove multi-line comments (/* ... */)
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '')

  // Fix unescaped newlines in strings (common Gemini issue)
  // This is risky but helps with some edge cases
  cleaned = cleaned.replace(/("(?:[^"\\]|\\.)*")/g, (match) => {
    return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
  })

  // Strategy 5: Handle Unicode and encoding issues
  // Remove zero-width characters and other invisibles
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '')

  // Normalize quotes (smart quotes to straight quotes)
  cleaned = cleaned.replace(/[\u201C\u201D]/g, '"')
  cleaned = cleaned.replace(/[\u2018\u2019]/g, "'")

  // Strategy 6: Fix duplicate keys (take last occurrence)
  // This is complex, so we'll let JSON.parse fail if this is the issue

  return cleaned
}

/**
 * Parse Gemini JSON with extensive error handling
 */
export function parseGeminiJSON<T = any>(rawResponse: string): T {
  const cleaned = cleanGeminiJSON(rawResponse)

  try {
    return JSON.parse(cleaned)
  } catch (error) {
    // If parse fails, try one more aggressive fix: remove everything after last }
    const lastBrace = cleaned.lastIndexOf('}')
    if (lastBrace !== -1) {
      const truncated = cleaned.substring(0, lastBrace + 1)
      try {
        return JSON.parse(truncated)
      } catch {
        // Still failed, throw original error
        throw error
      }
    }
    throw error
  }
}

/**
 * Get diagnostic info for failed JSON parse
 */
export function getDiagnosticInfo(rawResponse: string, error: Error): {
  errorMessage: string
  responseLength: number
  firstChars: string
  lastChars: string
  errorContext?: string
  cleanedPreview?: string
} {
  const cleaned = cleanGeminiJSON(rawResponse)

  const result = {
    errorMessage: error instanceof Error ? error.message : 'Unknown error',
    responseLength: rawResponse.length,
    firstChars: rawResponse.substring(0, 1000),
    lastChars: rawResponse.substring(Math.max(0, rawResponse.length - 1000)),
    cleanedPreview: cleaned.substring(0, 500)
  }

  // Try to find error position
  if (error instanceof SyntaxError && error.message.includes('position')) {
    const posMatch = error.message.match(/position (\d+)/)
    if (posMatch) {
      const pos = parseInt(posMatch[1])
      result.errorContext = cleaned.substring(
        Math.max(0, pos - 100),
        Math.min(cleaned.length, pos + 100)
      )
    }
  }

  return result
}
