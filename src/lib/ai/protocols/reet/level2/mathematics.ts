/**
 * REET Level 2 - Mathematics Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Level 2 Mathematics is for teaching Classes 6-8 (Upper Primary Level):
 * - Advanced arithmetic, algebra, geometry, mensuration
 * - Pedagogy of mathematics teaching for upper primary
 * - NCF 2005 mathematics curriculum alignment
 * - More advanced than Level 1 mathematics
 * - Focus on conceptual understanding and problem-solving
 * - Negative marking: -1/3 mark per wrong answer
 * - Only MCQ format (4 options)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET LEVEL 2 MATHEMATICS PAPERS (2019-2024)
 *    - Document content vs pedagogy split
 *    - Track difficulty level (Classes 6-8 appropriate)
 *    - Identify calculation vs conceptual questions
 *    - Track mathematics pedagogy questions (teaching methods)
 *    - Compare with Level 1 to identify advancement
 *    - Track topic distribution (algebra, geometry, mensuration, etc.)
 *
 * 2. DEFINE REET MATHEMATICS-SPECIFIC ARCHETYPES (examples):
 *    - Direct Calculation (arithmetic, algebra)
 *    - Conceptual Understanding (number theory, patterns)
 *    - Pedagogy Questions (how to teach specific concepts)
 *    - Problem Solving (word problems, multi-step)
 *    - Geometry & Mensuration (area, volume, properties)
 *    - Algebraic Thinking (equations, expressions)
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 4-Option MCQ
 *    - Calculation-based MCQ
 *    - Pedagogy scenario MCQ
 *    - Proof/reasoning MCQ (if applicable)
 *    - Negative phrasing (if used)
 *    (Verify against actual REET papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - Upper primary mathematics scope (Classes 6-8)
 *    - NCF 2005 mathematics pedagogy alignment
 *    - Conceptual clarity over mechanical calculation
 *    - Age-appropriate problem contexts (for 11-14 year olds)
 *    - Teaching methodology questions (pedagogy of math)
 *    - Numerical accuracy standards
 *    - NCERT alignment for Classes 6-8
 *
 * 5. CREATE REET MATHEMATICS-SPECIFIC VALIDATORS:
 *    - Age-appropriate content (Classes 6-8 level)
 *    - Calculation accuracy verification
 *    - Pedagogical correctness (teaching methods)
 *    - Answer key balance
 *    - Problem complexity suitable for upper primary
 *    - Conceptual accuracy (mathematical concepts)
 *
 * IMPORTANT NOTES:
 * - REET Level 2 Math is more advanced than Level 1 (Classes 6-8 vs 1-5)
 * - Includes algebra, mensuration, rational numbers (not in Level 1)
 * - Tests both content knowledge AND pedagogy
 * - Must be appropriate for teaching adolescents (Classes 6-8)
 * - Focus on conceptual understanding, not just calculation
 * - May include questions on teaching strategies for abstract concepts
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../types'

export const reetLevel2MathematicsProtocol: Protocol = {
  id: 'reet-level2-mathematics',
  name: 'REET Level 2 - Mathematics',
  streamName: 'REET Level 2',
  subjectName: 'Mathematics',

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
    'TODO: Add REET Level 2 Mathematics-specific prohibitions after paper analysis',
    'TODO: Upper primary appropriateness rules',
    'TODO: Calculation accuracy standards',
    'TODO: Pedagogy question formatting'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET papers
    warmupPercentage: 0.10      // TODO: Verify with REET papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Level 2 - Mathematics protocol not implemented yet. ' +
      'Please analyze REET Level 2 Mathematics papers and implement this protocol. ' +
      'Focus on upper primary mathematics (Classes 6-8) including algebra, geometry, mensuration, and pedagogy. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Level 2 Mathematics protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Level 2 Mathematics papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
