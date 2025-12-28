/**
 * REET Level 1 - Hindi Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Level 1 Hindi is for teaching Classes 1-5 (Primary Level):
 * - Basic Hindi language proficiency
 * - Hindi pedagogy (teaching methods for young learners)
 * - Grammar, comprehension, and language skills
 * - Rajasthan board Hindi curriculum alignment
 * - Negative marking: -1/3 mark per wrong answer
 * - Only MCQ format (4 options)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET LEVEL 1 HINDI PAPERS (2019-2024)
 *    - Document grammar vs comprehension vs pedagogy split
 * - Track language proficiency level (primary appropriate)
 *    - Identify pedagogy questions (teaching Hindi to young children)
 *    - Track comprehension passage patterns
 *    - Document Devanagari script requirements
 *
 * 2. DEFINE REET HINDI-SPECIFIC ARCHETYPES (examples):
 *    - Grammar (संज्ञा, सर्वनाम, क्रिया, विशेषण, etc.)
 *    - Comprehension (अपठित गद्यांश)
 *    - Vocabulary (पर्यायवाची, विलोम, मुहावरे)
 *    - Hindi Pedagogy (teaching methods)
 *    - Literature (कवि, रचनाएँ - if applicable)
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 4-Option MCQ
 *    - Comprehension passage-based MCQ
 *    - Grammar rule application MCQ
 *    - Pedagogy scenario MCQ
 *    (Verify against actual REET papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - Primary level Hindi proficiency requirements (Classes 1-5)
 *    - Devanagari script standards
 *    - Grammar rule accuracy
 *    - Comprehension passage difficulty level
 *    - Hindi pedagogy principles
 *    - Age-appropriate vocabulary
 *    - Rajasthan board curriculum alignment
 *
 * 5. CREATE REET HINDI-SPECIFIC VALIDATORS:
 *    - Devanagari script correctness
 *    - Grammar accuracy
 *    - Age-appropriate language (Classes 1-5 level)
 *    - Comprehension passage difficulty
 *    - Pedagogical correctness
 *    - Answer key balance
 *
 * IMPORTANT NOTES:
 * - REET Hindi tests both language proficiency AND teaching pedagogy
 * - Must use correct Devanagari script
 * - Grammar questions must follow standard Hindi grammar rules
 * - Comprehension passages must be age-appropriate
 * - Pedagogy questions focus on teaching Hindi to young children
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../types'

export const reetLevel1HindiProtocol: Protocol = {
  id: 'reet-level1-hindi',
  name: 'REET Level 1 - Hindi',
  streamName: 'REET Level 1',
  subjectName: 'Hindi',

  difficultyMappings: {
    easy: {
      archetypes: {} as any,      // MUST analyze REET Level 1 papers first
      structuralForms: {} as any,
      cognitiveLoad: {} as any
    },
    balanced: {
      archetypes: {} as any,
      structuralForms: {} as any,
      cognitiveLoad: {} as any
    },
    hard: {
      archetypes: {} as any,
      structuralForms: {} as any,
      cognitiveLoad: {} as any
    }
  },

  prohibitions: [
    'TODO: Add REET Hindi-specific prohibitions after paper analysis',
    'TODO: Devanagari script standards',
    'TODO: Grammar accuracy rules',
    'TODO: Age-appropriate language requirements'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET papers
    warmupPercentage: 0.10      // TODO: Verify with REET papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Level 1 - Hindi protocol not implemented yet. ' +
      'Please analyze REET Level 1 Hindi papers and implement this protocol. ' +
      'Focus on primary level Hindi (Classes 1-5), grammar, comprehension, and language pedagogy. ' +
      'Ensure correct Devanagari script usage. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Level 1 Hindi protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Level 1 Hindi papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
