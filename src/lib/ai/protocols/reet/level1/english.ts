/**
 * REET Level 1 - English Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Level 1 English is for teaching Classes 1-5 (Primary Level):
 * - Basic English language proficiency
 * - English pedagogy (teaching methods for young learners)
 * - Grammar, comprehension, and language skills
 * - Focus on foundational English for young children
 * - Negative marking: -1/3 mark per wrong answer
 * - Only MCQ format (4 options)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET LEVEL 1 ENGLISH PAPERS (2019-2024)
 *    - Document grammar vs comprehension vs pedagogy split
 *    - Track language proficiency level (primary appropriate)
 *    - Identify pedagogy questions (teaching English to young children)
 *    - Track comprehension passage patterns
 *    - Document vocabulary level expectations
 *
 * 2. DEFINE REET ENGLISH-SPECIFIC ARCHETYPES (examples):
 *    - Grammar (parts of speech, tenses, sentence structure)
 *    - Comprehension (unseen passages)
 *    - Vocabulary (synonyms, antonyms, one-word substitutions)
 *    - English Pedagogy (teaching methods, phonics, reading skills)
 *    - Language Skills (active/passive voice, direct/indirect speech)
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 4-Option MCQ
 *    - Comprehension passage-based MCQ
 *    - Grammar rule application MCQ
 *    - Pedagogy scenario MCQ
 *    - Fill-in-the-blank MCQ (if applicable)
 *    (Verify against actual REET papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - Primary level English proficiency requirements (Classes 1-5)
 *    - Grammar rule accuracy (British/American English standard)
 *    - Comprehension passage difficulty level
 *    - English pedagogy principles (phonics, whole language approach)
 *    - Age-appropriate vocabulary
 *    - Teaching methodology for primary level
 *
 * 5. CREATE REET ENGLISH-SPECIFIC VALIDATORS:
 *    - Grammar accuracy
 *    - Age-appropriate language (Classes 1-5 level)
 *    - Comprehension passage difficulty
 *    - Vocabulary level appropriateness
 *    - Pedagogical correctness
 *    - Answer key balance
 *
 * IMPORTANT NOTES:
 * - REET English tests both language proficiency AND teaching pedagogy
 * - Must be appropriate for teaching young children (Classes 1-5)
 * - Grammar questions must follow standard English grammar rules
 * - Comprehension passages must be simple and age-appropriate
 * - Pedagogy questions focus on teaching English to young learners
 * - May include phonics and reading skill development questions
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../types'

export const reetLevel1EnglishProtocol: Protocol = {
  id: 'reet-level1-english',
  name: 'REET Level 1 - English',
  streamName: 'REET Level 1',
  subjectName: 'English',

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
    'TODO: Add REET English-specific prohibitions after paper analysis',
    'TODO: Grammar accuracy standards',
    'TODO: Age-appropriate vocabulary rules',
    'TODO: Comprehension passage difficulty guidelines'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET papers
    warmupPercentage: 0.10      // TODO: Verify with REET papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Level 1 - English protocol not implemented yet. ' +
      'Please analyze REET Level 1 English papers and implement this protocol. ' +
      'Focus on primary level English (Classes 1-5), grammar, comprehension, and language pedagogy. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Level 1 English protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Level 1 English papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
