/**
 * Section Validation Helpers
 *
 * Validates section editing and deletion operations
 * Enforces business rules:
 * - Max 150 questions per section
 * - Max 300 questions total across all sections
 * - Must keep at least 1 section per paper
 * - Can only edit sections that are pending or ready
 */

interface Section {
  id: string
  question_count: number
  status: string
}

interface ValidationResult {
  valid: boolean
  error?: string
  newTotal?: number
}

/**
 * Check if section status allows editing
 * Can only edit when section is pending or ready (before generation)
 */
export function isSectionEditable(status: string): boolean {
  return status === 'pending' || status === 'ready'
}

/**
 * Validate section question count update
 *
 * Rules:
 * - New count must be between 1 and 150
 * - Total across all sections must not exceed 300
 */
export function validateSectionQuestionCount(
  sectionId: string,
  newCount: number,
  allSections: Section[]
): ValidationResult {
  // Rule 1: Question count must be positive
  if (newCount < 1) {
    return {
      valid: false,
      error: 'Section must have at least 1 question'
    }
  }

  // Rule 2: Max 150 questions per section
  if (newCount > 150) {
    return {
      valid: false,
      error: 'Section cannot exceed 150 questions'
    }
  }

  // Rule 3: Calculate new total across all sections
  const newTotal = allSections.reduce((sum, section) => {
    // Use new count for the section being edited, old count for others
    const count = section.id === sectionId ? newCount : section.question_count
    return sum + count
  }, 0)

  // Rule 4: Total cannot exceed 300
  if (newTotal > 300) {
    const currentTotal = allSections.reduce((sum, s) => sum + s.question_count, 0)
    const difference = newTotal - currentTotal
    return {
      valid: false,
      error: `Total would be ${newTotal} questions (limit: 300). Reduce by ${newTotal - 300} questions.`,
      newTotal
    }
  }

  return {
    valid: true,
    newTotal
  }
}

/**
 * Validate section deletion
 *
 * Rules:
 * - Must keep at least 1 section per paper
 */
export function validateSectionDeletion(
  totalSections: number
): ValidationResult {
  // Rule: Cannot delete if only 1 section remaining
  if (totalSections <= 1) {
    return {
      valid: false,
      error: 'Cannot delete the last section. Papers must have at least one section.'
    }
  }

  return {
    valid: true
  }
}

/**
 * Calculate new paper total after section deletion
 */
export function calculateTotalAfterDeletion(
  allSections: Section[],
  sectionIdToDelete: string
): number {
  return allSections
    .filter(section => section.id !== sectionIdToDelete)
    .reduce((sum, section) => sum + section.question_count, 0)
}
