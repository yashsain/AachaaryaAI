/**
 * REET Level 2 - English Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Level 2 English is for teaching Classes 6-8 (Upper Primary Level):
 * - Advanced English language proficiency (more than Level 1)
 * - English pedagogy for upper primary level
 * - Grammar, comprehension, literature, and language skills
 * - Focus on more complex language structures
 * - Negative marking: -1/3 mark per wrong answer
 * - Only MCQ format (4 options)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET LEVEL 2 ENGLISH PAPERS (2019-2024)
 *    - Document grammar vs comprehension vs literature vs pedagogy split
 *    - Track language proficiency level (upper primary appropriate)
 *    - Compare with Level 1 to identify advancement
 *    - Identify pedagogy questions (teaching English to adolescents)
 *    - Track comprehension passage complexity
 *    - Document literature component (if applicable)
 *
 * 2. DEFINE REET ENGLISH-SPECIFIC ARCHETYPES (examples):
 *    - Grammar (advanced tenses, conditionals, modals, clauses, etc.)
 *    - Comprehension (unseen passages - more complex)
 *    - Vocabulary (synonyms, antonyms, idioms, phrasal verbs)
 *    - English Pedagogy (teaching methods for upper primary)
 *    - Language Skills (voice, narration, sentence transformation)
 *    - Literature (poems, prose, authors - if applicable)
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 4-Option MCQ
 *    - Comprehension passage-based MCQ (more complex than Level 1)
 *    - Grammar rule application MCQ
 *    - Pedagogy scenario MCQ
 *    - Literature-based MCQ (if applicable)
 *    - Fill-in-the-blank MCQ (if applicable)
 *    (Verify against actual REET papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - Upper primary English proficiency requirements (Classes 6-8)
 *    - Advanced grammar rule accuracy
 *    - Comprehension passage difficulty level (higher than Level 1)
 *    - English pedagogy principles for upper primary
 *    - Age-appropriate vocabulary (for 11-14 year olds)
 *    - Teaching methodology for complex grammar concepts
 *    - Literature component (if applicable)
 *    - British/American English standard consistency
 *
 * 5. CREATE REET ENGLISH-SPECIFIC VALIDATORS:
 *    - Advanced grammar accuracy
 *    - Age-appropriate language (Classes 6-8 level)
 *    - Comprehension passage complexity
 *    - Vocabulary level appropriateness
 *    - Pedagogical correctness
 *    - Literature accuracy (if applicable)
 *    - Answer key balance
 *
 * IMPORTANT NOTES:
 * - REET Level 2 English is more advanced than Level 1 (Classes 6-8 vs 1-5)
 * - Tests both language proficiency AND teaching pedagogy
 * - Grammar questions more complex (conditionals, perfect tenses, clauses)
 * - Comprehension passages longer and more sophisticated
 * - May include English literature (poems, prose, authors)
 * - Pedagogy questions focus on teaching English to adolescents
 * - May include questions on second language acquisition principles
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../types'

export const reetLevel2EnglishProtocol: Protocol = {
  id: 'reet-level2-english',
  name: 'REET Level 2 - English',
  streamName: 'REET Level 2',
  subjectName: 'English',

  difficultyMappings: {
    easy: {
      archetypes: {} as any,      // MUST analyze REET Level 2 papers first
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
    'TODO: Add REET Level 2 English-specific prohibitions after paper analysis',
    'TODO: Advanced grammar accuracy standards',
    'TODO: Age-appropriate vocabulary rules',
    'TODO: Comprehension passage complexity guidelines'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET papers
    warmupPercentage: 0.10      // TODO: Verify with REET papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Level 2 - English protocol not implemented yet. ' +
      'Please analyze REET Level 2 English papers and implement this protocol. ' +
      'Focus on upper primary English (Classes 6-8), advanced grammar, comprehension, and language pedagogy. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Level 2 English protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Level 2 English papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
