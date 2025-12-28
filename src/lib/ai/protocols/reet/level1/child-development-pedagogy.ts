/**
 * REET Level 1 - Child Development & Pedagogy Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Level 1 is for teachers of Classes 1-5 (Primary Level):
 * - Child Development & Pedagogy is a core paper testing teaching methodology
 * - Focus on child psychology, learning theories, and classroom management
 * - Rajasthan-specific educational context
 * - Bilingual (Hindi/English) questions common
 * - Negative marking: -1/3 mark per wrong answer
 * - Only MCQ format (4 options)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET LEVEL 1 PAPERS (2019-2024 recommended)
 *    - Focus on Child Development & Pedagogy section
 *    - Document theory vs application-based split
 *    - Track pedagogy-specific question patterns
 *    - Identify learning theory frameworks used (Piaget, Vygotsky, etc.)
 *    - Track classroom scenario-based questions
 *
 * 2. DEFINE REET CDP-SPECIFIC ARCHETYPES (examples):
 *    - Direct Theory Recall (learning theories, psychologists)
 *    - Classroom Scenario Application (teaching methods)
 *    - Child Psychology Concepts (developmental stages)
 *    - Pedagogy Principles (constructivism, behaviorism)
 *    - Assessment & Evaluation (formative, summative)
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
 *    - REET-specific pedagogy standards (NCF 2005, RTE Act)
 *    - Rajasthan educational context requirements
 *    - Bilingual support (if applicable)
 *    - Child development stage accuracy (0-6, 6-11 years)
 *    - Learning theory citation standards
 *    - Classroom scenario realism
 *
 * 5. CREATE REET CDP-SPECIFIC VALIDATORS:
 *    - Age-appropriate content for primary level (Classes 1-5)
 *    - Pedagogical accuracy (learning theories correctly applied)
 *    - Scenario realism (practical classroom situations)
 *    - Answer key balance
 *    - Negative marking awareness in question design
 *
 * IMPORTANT NOTES:
 * - REET emphasizes practical teaching knowledge, not just theory
 * - Rajasthan-specific context may be required (local schools, policies)
 * - Questions must be suitable for primary level teaching
 * - Child Development & Pedagogy is common to both Level 1 and Level 2
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../types'

export const reetLevel1CDPProtocol: Protocol = {
  id: 'reet-level1-child-development-pedagogy',
  name: 'REET Level 1 - Child Development & Pedagogy',
  streamName: 'REET Level 1',
  subjectName: 'Child Development & Pedagogy',

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
    'TODO: Add REET CDP-specific prohibitions after paper analysis',
    'TODO: Pedagogy terminology standards',
    'TODO: Child development stage accuracy rules',
    'TODO: Bilingual formatting (if applicable)'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET papers
    warmupPercentage: 0.10      // TODO: Verify with REET papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Level 1 - Child Development & Pedagogy protocol not implemented yet. ' +
      'Please analyze REET Level 1 papers and implement this protocol. ' +
      'Focus on pedagogy principles, child psychology, and classroom management for primary level (Classes 1-5). ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Level 1 Child Development & Pedagogy protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Level 1 papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
