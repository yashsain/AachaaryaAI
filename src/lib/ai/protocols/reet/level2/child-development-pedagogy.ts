/**
 * REET Level 2 - Child Development & Pedagogy Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Level 2 is for teachers of Classes 6-8 (Upper Primary Level):
 * - Child Development & Pedagogy for adolescent learners (ages 11-14)
 * - Focus on adolescent psychology, learning theories, and classroom management
 * - More advanced than Level 1 (different age group focus)
 * - Rajasthan-specific educational context
 * - Bilingual (Hindi/English) questions common
 * - Negative marking: -1/3 mark per wrong answer
 * - Only MCQ format (4 options)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET LEVEL 2 PAPERS (2019-2024 recommended)
 *    - Focus on Child Development & Pedagogy section
 *    - Compare with Level 1 to identify differences (age 11-14 vs 6-11)
 *    - Document adolescent psychology questions
 *    - Track pedagogy for upper primary level
 *    - Identify learning theory frameworks used
 *    - Track classroom scenario-based questions
 *
 * 2. DEFINE REET CDP-SPECIFIC ARCHETYPES (examples):
 *    - Adolescent Psychology (physical, cognitive, emotional development)
 *    - Learning Theories (Piaget, Vygotsky, Bruner - advanced concepts)
 *    - Classroom Scenario Application (teaching methods for Classes 6-8)
 *    - Pedagogy Principles (constructivism, behaviorism)
 *    - Assessment & Evaluation (CCE, formative, summative)
 *    - Inclusive Education (learning disabilities, gifted children)
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 4-Option MCQ (most common)
 *    - Scenario-based MCQ (classroom situations)
 *    - Assertion-Reason (if used in REET)
 *    - Negative phrasing (if used)
 *    (Verify against actual REET papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - REET-specific pedagogy standards (NCF 2005, RTE Act, NEP 2020)
 *    - Rajasthan educational context requirements
 *    - Bilingual support (if applicable)
 *    - Adolescent development stage accuracy (ages 11-14)
 *    - Learning theory citation standards
 *    - Classroom scenario realism for upper primary
 *
 * 5. CREATE REET CDP-SPECIFIC VALIDATORS:
 *    - Age-appropriate content for upper primary level (Classes 6-8)
 *    - Adolescent psychology accuracy
 *    - Pedagogical accuracy (learning theories correctly applied)
 *    - Scenario realism (practical classroom situations)
 *    - Answer key balance
 *    - Negative marking awareness in question design
 *
 * IMPORTANT NOTES:
 * - REET Level 2 CDP differs from Level 1 in age group focus (adolescents vs young children)
 * - Questions must reflect challenges of teaching Classes 6-8 (not primary)
 * - Adolescent psychology is more complex than child psychology
 * - Classroom management strategies differ for upper primary
 * - May include questions on subject-specific pedagogy
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../types'

export const reetLevel2CDPProtocol: Protocol = {
  id: 'reet-level2-child-development-pedagogy',
  name: 'REET Level 2 - Child Development & Pedagogy',
  streamName: 'REET Level 2',
  subjectName: 'Child Development & Pedagogy',

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
    'TODO: Add REET Level 2 CDP-specific prohibitions after paper analysis',
    'TODO: Adolescent psychology accuracy rules',
    'TODO: Upper primary pedagogy standards',
    'TODO: Bilingual formatting (if applicable)'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET papers
    warmupPercentage: 0.10      // TODO: Verify with REET papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Level 2 - Child Development & Pedagogy protocol not implemented yet. ' +
      'Please analyze REET Level 2 papers and implement this protocol. ' +
      'Focus on adolescent psychology, learning theories, and pedagogy for upper primary level (Classes 6-8). ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Level 2 Child Development & Pedagogy protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Level 2 papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
