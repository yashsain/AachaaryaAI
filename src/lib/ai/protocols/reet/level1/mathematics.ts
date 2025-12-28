/**
 * REET Level 1 - Mathematics Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Level 1 Mathematics is for teaching Classes 1-5 (Primary Level):
 * - Basic arithmetic, geometry, measurement concepts
 * - Pedagogy of mathematics teaching (how to teach math to young children)
 * - NCF 2005 mathematics curriculum alignment
 * - Focus on conceptual understanding over rote calculation
 * - Negative marking: -1/3 mark per wrong answer
 * - Only MCQ format (4 options)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET LEVEL 1 MATHEMATICS PAPERS (2019-2024)
 *    - Document content vs pedagogy split
 *    - Track difficulty level (primary level appropriate)
 *    - Identify calculation vs conceptual questions
 *    - Track mathematics pedagogy questions (teaching methods)
 *    - Identify Rajasthan-specific context (if any)
 *
 * 2. DEFINE REET MATHEMATICS-SPECIFIC ARCHETYPES (examples):
 *    - Direct Calculation (basic arithmetic)
 *    - Conceptual Understanding (number sense, patterns)
 *    - Pedagogy Questions (how to teach specific concepts)
 *    - Problem Solving (word problems)
 *    - Geometry & Measurement (shapes, units)
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 4-Option MCQ
 *    - Calculation-based MCQ
 *    - Pedagogy scenario MCQ
 *    - Negative phrasing (if used)
 *    (Verify against actual REET papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - Primary level mathematics scope (Classes 1-5)
 *    - NCF 2005 mathematics pedagogy alignment
 *    - Conceptual clarity over mechanical calculation
 *    - Age-appropriate problem contexts
 *    - Teaching methodology questions (if applicable)
 *    - Numerical accuracy standards
 *
 * 5. CREATE REET MATHEMATICS-SPECIFIC VALIDATORS:
 *    - Age-appropriate content (Classes 1-5 level)
 *    - Calculation accuracy verification
 *    - Pedagogical correctness (teaching methods)
 *    - Answer key balance
 *    - Problem complexity suitable for primary level
 *
 * IMPORTANT NOTES:
 * - REET Level 1 Math tests both content knowledge AND pedagogy
 * - Must be appropriate for teaching young children (Classes 1-5)
 * - Focus on foundational concepts, not advanced mathematics
 * - May include questions on how to teach specific math concepts
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../types'

export const reetLevel1MathematicsProtocol: Protocol = {
  id: 'reet-level1-mathematics',
  name: 'REET Level 1 - Mathematics',
  streamName: 'REET Level 1',
  subjectName: 'Mathematics',

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
    'TODO: Add REET Mathematics-specific prohibitions after paper analysis',
    'TODO: Primary level appropriateness rules',
    'TODO: Calculation accuracy standards',
    'TODO: Pedagogy question formatting'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET papers
    warmupPercentage: 0.10      // TODO: Verify with REET papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Level 1 - Mathematics protocol not implemented yet. ' +
      'Please analyze REET Level 1 Mathematics papers and implement this protocol. ' +
      'Focus on primary level mathematics (Classes 1-5) and mathematics pedagogy. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Level 1 Mathematics protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Level 1 Mathematics papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
