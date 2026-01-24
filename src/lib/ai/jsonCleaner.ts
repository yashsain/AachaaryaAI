/**
 * Fix invalid JSON escape sequences (CRITICAL FOR LATEX)
 *
 * JSON only allows these escape sequences: \" \\ \/ \b \f \n \r \t \uXXXX
 * LaTeX uses backslashes for commands: \in \mathbb \cup \implies etc.
 * These are INVALID in JSON and must be escaped as: \\in \\mathbb \\cup \\implies
 *
 * Strategy: Process character by character and double backslashes EXCEPT:
 * 1. Already escaped backslashes (\\)
 * 2. Valid JSON escape sequences (\n, \r, \t, \b, \f, \/, \", \uXXXX)
 * 3. Everything else (LaTeX commands) gets doubled
 *
 * @param jsonString - Raw JSON string with potential invalid escape sequences
 * @returns Fixed JSON string with all backslashes properly escaped
 */
function fixInvalidEscapeSequences(jsonString: string): string {
  // Valid single-character JSON escapes (after backslash)
  const validEscapes = new Set(['\\', '"', '/', 'b', 'f', 'n', 'r', 't'])

  let result = ''
  let i = 0

  while (i < jsonString.length) {
    const char = jsonString[i]

    if (char === '\\') {
      // Found a backslash
      if (i + 1 < jsonString.length) {
        const nextChar = jsonString[i + 1]

        // Check if this is a valid JSON escape sequence
        if (validEscapes.has(nextChar)) {
          // Valid JSON escape (\n, \r, \t, \b, \f, \/, \", \\) - keep as is
          result += '\\' + nextChar
          i += 2
        } else if (nextChar === 'u' && i + 5 < jsonString.length) {
          // Unicode escape \uXXXX - check if followed by 4 hex digits
          const hexPart = jsonString.substring(i + 2, i + 6)
          if (/^[0-9a-fA-F]{4}$/.test(hexPart)) {
            // Valid unicode escape - keep as is
            result += '\\u' + hexPart
            i += 6
          } else {
            // Invalid unicode - double the backslash (treat as LaTeX)
            result += '\\\\' + nextChar
            i += 2
          }
        } else {
          // Invalid escape (LaTeX command like \in, \mathbb, etc.)
          // Double the backslash: \X -> \\X
          result += '\\\\' + nextChar
          i += 2
        }
      } else {
        // Backslash at end of string (edge case)
        result += '\\\\'
        i++
      }
    } else {
      // Not a backslash, just copy
      result += char
      i++
    }
  }

  return result
}

/**
 * Aggressive JSON Cleaner for Gemini Responses
 *
 * Handles all edge cases: markdown wrappers, comments, trailing commas,
 * garbage text before/after, partial responses, encoding issues, LaTeX escape sequences
 */

export function cleanGeminiJSON(rawResponse: string): string {
  let cleaned = rawResponse.trim()

  // Strategy 1: Remove markdown code blocks (all variants)
  // Handle: ```json\n{...}\n```, ```{...}```, ````json...````
  cleaned = cleaned.replace(/^`+json\s*/i, '')
  cleaned = cleaned.replace(/^`+\s*/, '')
  cleaned = cleaned.replace(/\s*`+$/g, '')

  // Strategy 2: Extract JSON by finding matching delimiters
  // Handle both arrays [...] and objects {...}
  const firstBracket = cleaned.indexOf('[')
  const lastBracket = cleaned.lastIndexOf(']')
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')

  // Determine if response is array or object based on which comes first
  const isArray = firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)

  if (isArray && firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    // Extract array [...] including all content
    cleaned = cleaned.substring(firstBracket, lastBracket + 1)
  } else if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    // Extract object {...}
    cleaned = cleaned.substring(firstBrace, lastBrace + 1)
  }

  // Strategy 3: Remove explanatory text that might be inside
  // Pattern: {...} some text {...} or [...] some text [...] -> take the largest one
  const arrayMatches = cleaned.match(/\[[\s\S]*\]/g)
  const objectMatches = cleaned.match(/\{[\s\S]*\}/g)

  if (arrayMatches && arrayMatches.length > 0) {
    // Take the longest array match (most likely to be complete)
    cleaned = arrayMatches.reduce((a, b) => a.length > b.length ? a : b)
  } else if (objectMatches && objectMatches.length > 0) {
    // Take the longest object match (most likely to be complete)
    cleaned = objectMatches.reduce((a, b) => a.length > b.length ? a : b)
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

  // Strategy 4.5: Fix invalid JSON escape sequences (CRITICAL FOR LATEX)
  // In JSON, only these escapes are valid: \" \\ \/ \b \f \n \r \t \uXXXX
  // LaTeX often has invalid sequences like: \in \implies \cup \mathbb etc.
  // We need to double-escape any backslash not followed by valid escape char
  cleaned = fixInvalidEscapeSequences(cleaned)

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
    // If parse fails, try one more aggressive fix: remove everything after last delimiter
    const lastBracket = cleaned.lastIndexOf(']')
    const lastBrace = cleaned.lastIndexOf('}')

    // Try array truncation first if array delimiter is later
    if (lastBracket > lastBrace && lastBracket !== -1) {
      const truncated = cleaned.substring(0, lastBracket + 1)
      try {
        return JSON.parse(truncated)
      } catch {
        // Try object truncation as fallback
      }
    }

    // Try object truncation
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

  const result: {
    errorMessage: string
    responseLength: number
    firstChars: string
    lastChars: string
    errorContext?: string
    cleanedPreview?: string
  } = {
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
