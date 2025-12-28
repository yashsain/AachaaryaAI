/**
 * REET Level 2 - Hindi Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Level 2 Hindi is for teaching Classes 6-8 (Upper Primary Level):
 * - Advanced Hindi language proficiency (more than Level 1)
 * - Hindi pedagogy for upper primary level
 * - Grammar, comprehension, literature, and language skills
 * - Rajasthan board Hindi curriculum alignment
 * - Negative marking: -1/3 mark per wrong answer
 * - Only MCQ format (4 options)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET LEVEL 2 HINDI PAPERS (2019-2024)
 *    - Document grammar vs comprehension vs literature vs pedagogy split
 *    - Track language proficiency level (upper primary appropriate)
 *    - Compare with Level 1 to identify advancement
 *    - Identify pedagogy questions (teaching Hindi to adolescents)
 *    - Track comprehension passage complexity
 *    - Document literature component (if applicable)
 *
 * 2. DEFINE REET HINDI-SPECIFIC ARCHETYPES (examples):
 *    - Grammar (advanced संज्ञा, सर्वनाम, क्रिया, विशेषण, काल, वाच्य, etc.)
 *    - Comprehension (अपठित गद्यांश/पद्यांश - more complex)
 *    - Vocabulary (पर्यायवाची, विलोम, मुहावरे, लोकोक्तियाँ)
 *    - Hindi Pedagogy (teaching methods for upper primary)
 *    - Literature (कवि, रचनाएँ, साहित्यकार - if applicable)
 *    - रचना/निबंध related concepts (if applicable)
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 4-Option MCQ
 *    - Comprehension passage-based MCQ (more complex than Level 1)
 *    - Grammar rule application MCQ
 *    - Pedagogy scenario MCQ
 *    - Literature-based MCQ (if applicable)
 *    (Verify against actual REET papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - Upper primary Hindi proficiency requirements (Classes 6-8)
 *    - Devanagari script standards
 *    - Advanced grammar rule accuracy
 *    - Comprehension passage difficulty level (higher than Level 1)
 *    - Hindi pedagogy principles for upper primary
 *    - Age-appropriate vocabulary (for 11-14 year olds)
 *    - Rajasthan board curriculum alignment
 *    - Literature component (if applicable)
 *
 * 5. CREATE REET HINDI-SPECIFIC VALIDATORS:
 *    - Devanagari script correctness
 *    - Advanced grammar accuracy
 *    - Age-appropriate language (Classes 6-8 level)
 *    - Comprehension passage complexity
 *    - Pedagogical correctness
 *    - Literature accuracy (if applicable)
 *    - Answer key balance
 *
 * IMPORTANT NOTES:
 * - REET Level 2 Hindi is more advanced than Level 1 (Classes 6-8 vs 1-5)
 * - Tests both language proficiency AND teaching pedagogy
 * - Must use correct Devanagari script
 * - Grammar questions more complex (advanced tenses, वाच्य, समास, etc.)
 * - Comprehension passages longer and more complex
 * - May include Hindi literature (poets, authors, works)
 * - Pedagogy questions focus on teaching Hindi to adolescents
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../types'

export const reetLevel2HindiProtocol: Protocol = {
  id: 'reet-level2-hindi',
  name: 'REET Level 2 - Hindi',
  streamName: 'REET Level 2',
  subjectName: 'Hindi',

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
    'TODO: Add REET Level 2 Hindi-specific prohibitions after paper analysis',
    'TODO: Devanagari script standards',
    'TODO: Advanced grammar accuracy rules',
    'TODO: Age-appropriate language requirements'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET papers
    warmupPercentage: 0.10      // TODO: Verify with REET papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Level 2 - Hindi protocol not implemented yet. ' +
      'Please analyze REET Level 2 Hindi papers and implement this protocol. ' +
      'Focus on upper primary Hindi (Classes 6-8), advanced grammar, comprehension, and language pedagogy. ' +
      'Ensure correct Devanagari script usage. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Level 2 Hindi protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Level 2 Hindi papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
