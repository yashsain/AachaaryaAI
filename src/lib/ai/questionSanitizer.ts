/**
 * Question Text Sanitization Utility
 *
 * Removes editorial notes, commentary, and meta-references from question text
 * to ensure clean, professional output in PDFs and student-facing interfaces.
 *
 * CRITICAL: This prevents internal notes like "(नोट: ...)" from appearing in final PDFs
 */

/**
 * Strips editorial notes, commentary, and meta-references from question text
 *
 * Removes patterns like:
 * - Hindi: (नोट: ...), (टिप्पणी: ...), (ध्यान दें: ...), (सूचना: ...)
 * - English: (Note: ...), (Commentary: ...), (Editorial: ...), (Hint: ...)
 * - Meta-references: (According to NCERT...), (As per study material...)
 *
 * @param text - The text to sanitize (question, option, or explanation)
 * @returns Cleaned text with all editorial notes removed
 */
export function sanitizeQuestionText(text: string): string {
  if (!text) return text

  let sanitized = text

  // ===== HINDI EDITORIAL NOTES =====
  // Remove any text inside parentheses starting with Hindi editorial keywords
  sanitized = sanitized.replace(/\(नोट:.*?\)/g, '')          // (नोट: ...)
  sanitized = sanitized.replace(/\(टिप्पणी:.*?\)/g, '')      // (टिप्पणी: ...)
  sanitized = sanitized.replace(/\(ध्यान दें:.*?\)/g, '')    // (ध्यान दें: ...)
  sanitized = sanitized.replace(/\(सूचना:.*?\)/g, '')        // (सूचना: ...)
  sanitized = sanitized.replace(/\(व्याख्या:.*?\)/g, '')     // (व्याख्या: ...)
  sanitized = sanitized.replace(/\(जानकारी:.*?\)/g, '')     // (जानकारी: ...)
  sanitized = sanitized.replace(/\(संकेत:.*?\)/g, '')        // (संकेत: ...)

  // ===== ENGLISH EDITORIAL NOTES (case-insensitive) =====
  sanitized = sanitized.replace(/\(\s*note:\s*.*?\)/gi, '')         // (Note: ...)
  sanitized = sanitized.replace(/\(\s*commentary:\s*.*?\)/gi, '')   // (Commentary: ...)
  sanitized = sanitized.replace(/\(\s*editorial.*?\)/gi, '')        // (Editorial: ...)
  sanitized = sanitized.replace(/\(\s*explanation:\s*.*?\)/gi, '')  // (Explanation: ...)
  sanitized = sanitized.replace(/\(\s*hint:\s*.*?\)/gi, '')         // (Hint: ...)
  sanitized = sanitized.replace(/\(\s*remark:\s*.*?\)/gi, '')       // (Remark: ...)
  sanitized = sanitized.replace(/\(\s*comment:\s*.*?\)/gi, '')      // (Comment: ...)
  sanitized = sanitized.replace(/\(\s*info:\s*.*?\)/gi, '')         // (Info: ...)

  // ===== META-REFERENCES IN PARENTHESES =====
  sanitized = sanitized.replace(/\(\s*according to.*?\)/gi, '')     // (According to...)
  sanitized = sanitized.replace(/\(\s*as per.*?\)/gi, '')           // (As per...)
  sanitized = sanitized.replace(/\(\s*based on.*?\)/gi, '')         // (Based on...)
  sanitized = sanitized.replace(/\(\s*source:.*?\)/gi, '')          // (Source: ...)
  sanitized = sanitized.replace(/\(\s*reference:.*?\)/gi, '')       // (Reference: ...)

  // ===== MIXED LANGUAGE NOTES =====
  // Sometimes notes mix Hindi and English, e.g., "(नोट: This is from NCERT)"
  sanitized = sanitized.replace(/\(\s*नोट\s*:.*?\)/gi, '')
  sanitized = sanitized.replace(/\(\s*note\s*:.*?\)/gi, '')

  // ===== CLEANUP =====
  // Remove multiple spaces left after removal
  sanitized = sanitized.replace(/\s{2,}/g, ' ')

  // Remove leading/trailing whitespace
  sanitized = sanitized.trim()

  // Remove orphaned punctuation (e.g., "Question text  ?" -> "Question text?")
  sanitized = sanitized.replace(/\s+([,.?!;:])/g, '$1')

  return sanitized
}

/**
 * Sanitizes an entire question object
 * Cleans question text, all options, and explanation
 *
 * @param question - Question object with questionText, options, explanation
 * @returns Sanitized question object
 */
export function sanitizeQuestion(question: {
  questionText: string
  options: Record<string, string>
  explanation?: string
  [key: string]: any
}): typeof question {
  return {
    ...question,
    questionText: sanitizeQuestionText(question.questionText),
    options: Object.fromEntries(
      Object.entries(question.options).map(([key, val]) =>
        [key, sanitizeQuestionText(val)]
      )
    ),
    explanation: question.explanation ? sanitizeQuestionText(question.explanation) : question.explanation
  }
}

/**
 * Sanitizes an array of questions
 *
 * @param questions - Array of question objects
 * @returns Array of sanitized question objects
 */
export function sanitizeQuestions(questions: Array<{
  questionText: string
  options: Record<string, string>
  explanation?: string
  [key: string]: any
}>): typeof questions {
  return questions.map(q => sanitizeQuestion(q))
}

/**
 * Detects if text contains editorial notes (for logging/debugging)
 * Returns true if editorial notes are found
 *
 * @param text - Text to check
 * @returns true if editorial notes detected
 */
export function hasEditorialNotes(text: string): boolean {
  if (!text) return false

  const hindiPatterns = [/\(नोट:/, /\(टिप्पणी:/, /\(ध्यान दें:/, /\(सूचना:/]
  const englishPatterns = [/\(\s*note:/i, /\(\s*commentary:/i, /\(\s*editorial/i]

  return [...hindiPatterns, ...englishPatterns].some(pattern => pattern.test(text))
}
