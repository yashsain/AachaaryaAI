/**
 * Meta-Reference Detector
 *
 * Detects and flags questions that inappropriately reference source materials
 * NEET questions should be direct and authoritative, not reference textbooks
 */

export function detectMetaReferences(questionText: string): string[] {
  const errors: string[] = []
  const lowerText = questionText.toLowerCase()

  const metaPatterns = [
    { pattern: /according to (ncert|the study material|the provided material|the material|the notes|who)/i, message: 'Contains meta-reference "according to..."' },
    { pattern: /as per (ncert|the study material|the provided material|the material|the notes)/i, message: 'Contains meta-reference "as per..."' },
    { pattern: /as mentioned in (ncert|the study material|the provided material|the material|the notes)/i, message: 'Contains meta-reference "as mentioned in..."' },
    { pattern: /the study material (says|states|mentions|defines)/i, message: 'References "the study material" directly' },
    { pattern: /the provided material/i, message: 'References "the provided material"' },
    { pattern: /what does (ncert|the material|the study material) say/i, message: 'Asks "what does the material say"' },
    { pattern: /in the (given|provided) (material|notes)/i, message: 'References "in the given/provided material"' },
    { pattern: /from the (study material|provided notes)/i, message: 'References "from the study material"' }
  ]

  for (const { pattern, message } of metaPatterns) {
    if (pattern.test(questionText)) {
      errors.push(message)
    }
  }

  return errors
}
