/**
 * Question Validator
 *
 * Validates generated questions against protocol rules
 * Works with any exam protocol (NEET, JEE, Banking, etc.)
 * Returns errors (hard failures) and warnings (soft issues)
 */

import { detectMetaReferences } from './metaReferenceDetector'
import { Protocol } from './protocols/types'

export interface Question {
  questionNumber: number
  questionText: string
  archetype: string
  structuralForm: string
  cognitiveLoad: 'low' | 'medium' | 'high'
  correctAnswer: string
  options: {
    '(1)': string
    '(2)': string
    '(3)': string
    '(4)': string
  }
  explanation: string
  difficulty?: string
  ncertFidelity?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate prohibited patterns (HARD FAIL)
 */
export function validateProhibitedPatterns(question: Question): string[] {
  const errors: string[] = []

  const fullText = question.questionText.toLowerCase()
  const optionValues = Object.values(question.options).map(o => o.toLowerCase())

  // Check for "Always" or "Never" in stem
  if (fullText.includes(' always ') || fullText.includes(' never ')) {
    errors.push(`Q${question.questionNumber}: Contains prohibited "Always" or "Never"`)
  }

  // Check for meta-references (CRITICAL for NEET authenticity)
  const metaReferenceErrors = detectMetaReferences(question.questionText)
  for (const error of metaReferenceErrors) {
    errors.push(`Q${question.questionNumber}: ${error}`)
  }

  // Check for double negatives
  const doubleNegativePatterns = ['not in', 'not un', 'not im', 'not dis', 'not non']
  for (const pattern of doubleNegativePatterns) {
    if (fullText.includes(pattern)) {
      errors.push(`Q${question.questionNumber}: Possible double negative detected: "${pattern}"`)
    }
  }

  // Check for "None of the above" or "All of the above"
  for (const option of optionValues) {
    if (option.includes('none of the above') || option.includes('all of the above')) {
      errors.push(`Q${question.questionNumber}: Contains prohibited "None/All of the above"`)
      break
    }
  }

  // Check for "Both A and B" (unless it's a multi-statement or assertion-reason question)
  if (question.structuralForm !== 'multiStatement' && question.structuralForm !== 'assertionReason') {
    for (const option of optionValues) {
      if (option.includes('both') && (option.includes('and') || option.includes('&'))) {
        errors.push(`Q${question.questionNumber}: Contains "Both...and" outside multi-statement/assertion-reason format`)
        break
      }
    }
  }

  // Check for lopsided visual weight (one option significantly longer)
  const optionLengths = Object.values(question.options).map(o => o.length)
  const maxLength = Math.max(...optionLengths)
  const minLength = Math.min(...optionLengths)
  if (maxLength > minLength * 3) {
    errors.push(`Q${question.questionNumber}: Lopsided option lengths (max: ${maxLength}, min: ${minLength})`)
  }

  // Check mutual exclusivity (basic check - look for identical options)
  const optionSet = new Set(optionValues)
  if (optionSet.size < 4) {
    errors.push(`Q${question.questionNumber}: Non-mutually exclusive options (duplicates found)`)
  }

  return errors
}

/**
 * Validate answer key balance (WARN)
 */
export function validateAnswerKeyBalance(questions: Question[]): string[] {
  const warnings: string[] = []

  // Count distribution of correct answers
  const answerCounts: Record<string, number> = {
    '(1)': 0,
    '(2)': 0,
    '(3)': 0,
    '(4)': 0
  }

  for (const q of questions) {
    if (answerCounts[q.correctAnswer] !== undefined) {
      answerCounts[q.correctAnswer]++
    }
  }

  const total = questions.length
  const expectedMin = Math.floor(total * 0.20) // 20%
  const expectedMax = Math.ceil(total * 0.30)  // 30%

  for (const [option, count] of Object.entries(answerCounts)) {
    const percentage = ((count / total) * 100).toFixed(1)
    if (count < expectedMin || count > expectedMax) {
      warnings.push(`Answer key imbalance: Option ${option} appears ${count}/${total} times (${percentage}%)`)
    }
  }

  // Check for consecutive same answers
  let consecutiveCount = 1
  let previousAnswer = questions[0]?.correctAnswer

  for (let i = 1; i < questions.length; i++) {
    if (questions[i].correctAnswer === previousAnswer) {
      consecutiveCount++
      if (consecutiveCount > 3) {
        warnings.push(`Consecutive same answer violation: ${consecutiveCount} consecutive ${previousAnswer} at Q${i - consecutiveCount + 2}-Q${i + 1}`)
        consecutiveCount = 1 // Reset to avoid duplicate warnings
      }
    } else {
      consecutiveCount = 1
      previousAnswer = questions[i].correctAnswer
    }
  }

  return warnings
}

/**
 * Validate cognitive load sequencing (WARN)
 */
export function validateCognitiveLoad(questions: Question[]): string[] {
  const warnings: string[] = []

  // Check first 2-3 questions are low-density
  const warmupCount = Math.min(3, questions.length)
  for (let i = 0; i < warmupCount; i++) {
    if (questions[i].cognitiveLoad !== 'low') {
      warnings.push(`Q${i + 1}: Should be low-density warm-up, but is ${questions[i].cognitiveLoad}-density`)
    }
  }

  // Check max 2 consecutive high-density
  let consecutiveHigh = 0
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].cognitiveLoad === 'high') {
      consecutiveHigh++
      if (consecutiveHigh > 2) {
        warnings.push(`Q${i + 1}: More than 2 consecutive high-density questions (violation at position ${i + 1})`)
        consecutiveHigh = 0 // Reset to avoid duplicate warnings
      }
    } else {
      consecutiveHigh = 0
    }
  }

  return warnings
}

/**
 * Validate Match-the-Following questions (HARD FAIL)
 */
export function validateMatchQuestions(questions: Question[]): string[] {
  const errors: string[] = []

  for (const q of questions) {
    if (q.structuralForm === 'matchFollowing') {
      const text = q.questionText

      // Check for "Column I" and "Column II"
      if (!text.includes('Column I') || !text.includes('Column II')) {
        errors.push(`Q${q.questionNumber}: Match question missing Column I/II headers`)
      }

      // Check for required ending phrase
      if (!text.includes('Choose the correct answer from the options given below')) {
        errors.push(`Q${q.questionNumber}: Match question missing required ending phrase`)
      }

      // Check for coded options (A-I, A-II, etc.)
      const hasCodedOptions = /[A-D]-[I-V]+/.test(text)
      if (!hasCodedOptions) {
        errors.push(`Q${q.questionNumber}: Match question missing coded options (e.g., A-III, B-I)`)
      }

      // Check for 4 items in each column (A, B, C, D and I, II, III, IV)
      const hasABCD = text.includes('A.') && text.includes('B.') && text.includes('C.') && text.includes('D.')
      const hasRomanNumerals = text.includes('I.') && text.includes('II.') && text.includes('III.') && text.includes('IV.')
      if (!hasABCD || !hasRomanNumerals) {
        errors.push(`Q${q.questionNumber}: Match question not using 4×4 matrix format`)
      }
    }
  }

  return errors
}

/**
 * Validate Assertion-Reason questions (HARD FAIL)
 */
export function validateAssertionReason(questions: Question[]): string[] {
  const errors: string[] = []

  for (const q of questions) {
    if (q.structuralForm === 'assertionReason') {
      const text = q.questionText

      // Check for "Assertion (A):" and "Reason (R):"
      if (!text.includes('Assertion (A):') && !text.includes('Assertion(A):')) {
        errors.push(`Q${q.questionNumber}: Assertion-Reason missing "Assertion (A):" label`)
      }
      if (!text.includes('Reason (R):') && !text.includes('Reason(R):')) {
        errors.push(`Q${q.questionNumber}: Assertion-Reason missing "Reason (R):" label`)
      }

      // Check for required ending phrase
      if (!text.includes('In the light of the above statements')) {
        errors.push(`Q${q.questionNumber}: Assertion-Reason missing required ending phrase`)
      }

      // Check for correct 4-option structure (at least mention of explanation/linkage)
      const hasExplanation = text.toLowerCase().includes('explanation')
      if (!hasExplanation) {
        errors.push(`Q${q.questionNumber}: Assertion-Reason should mention "explanation" in options`)
      }
    }
  }

  return errors
}

/**
 * Validate basic quality (WARN)
 */
export function validateBasicQuality(question: Question): string[] {
  const warnings: string[] = []

  // Check 4 options present
  const optionKeys = Object.keys(question.options)
  if (optionKeys.length !== 4) {
    warnings.push(`Q${question.questionNumber}: Should have exactly 4 options, found ${optionKeys.length}`)
  }

  // Check all options are non-empty
  for (const [key, value] of Object.entries(question.options)) {
    if (!value || value.trim().length === 0) {
      warnings.push(`Q${question.questionNumber}: Option ${key} is empty`)
    }
  }

  // Check correct answer is valid
  const validAnswers = ['(1)', '(2)', '(3)', '(4)']
  if (!validAnswers.includes(question.correctAnswer)) {
    warnings.push(`Q${question.questionNumber}: Invalid correct answer format: ${question.correctAnswer}`)
  }

  // Check question text is not empty
  if (!question.questionText || question.questionText.trim().length === 0) {
    warnings.push(`Q${question.questionNumber}: Question text is empty`)
  }

  // Check explanation is present
  if (!question.explanation || question.explanation.trim().length < 10) {
    warnings.push(`Q${question.questionNumber}: Explanation is missing or too short`)
  }

  return warnings
}

/**
 * Validate questions using a protocol (protocol-aware version)
 * This is the new, protocol-aware validator
 */
export function validateQuestionsWithProtocol(
  questions: Question[],
  protocol: Protocol
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Run protocol-specific validators
  for (const validator of protocol.validators) {
    const validatorResults = validator(questions)

    // Protocol validators return errors (hard failures)
    // We could enhance this in the future to support warnings too
    errors.push(...validatorResults)
  }

  // Always run basic quality checks (warnings)
  for (const question of questions) {
    warnings.push(...validateBasicQuality(question))
  }

  return {
    valid: errors.length === 0,
    errors: [...new Set(errors)], // Remove duplicates
    warnings: [...new Set(warnings)] // Remove duplicates
  }
}

/**
 * Validate all questions (orchestrator) - Legacy NEET-specific version
 * @deprecated Use validateQuestionsWithProtocol(questions, protocol) instead
 */
export function validateQuestions(questions: Question[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Individual question validations (hard fail)
  for (const question of questions) {
    errors.push(...validateProhibitedPatterns(question))
    warnings.push(...validateBasicQuality(question))
  }

  // Collection-level validations (hard fail)
  errors.push(...validateMatchQuestions(questions))
  errors.push(...validateAssertionReason(questions))

  // Collection-level validations (warnings)
  warnings.push(...validateAnswerKeyBalance(questions))
  warnings.push(...validateCognitiveLoad(questions))

  return {
    valid: errors.length === 0,
    errors: [...new Set(errors)], // Remove duplicates
    warnings: [...new Set(warnings)] // Remove duplicates
  }
}
