/**
 * JEE Mathematics Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * JEE Mathematics is COMPLETELY DIFFERENT from NEET Biology:
 * - Heavily calculation and proof-based
 * - Integer Type questions are VERY common (numerical answers)
 * - Multiple Correct questions with complex logic
 * - Matrix Match with intricate mappings
 * - Calculus, Algebra, Coordinate Geometry have different patterns
 * - Requires step-by-step solution validation
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE JEE MATHEMATICS PAPERS (2019-2024)
 *    - Separate analysis for Calculus/Algebra/Coordinate Geometry/Trigonometry/etc.
 *    - Document Integer Type answer ranges (usually 0-9999)
 *    - Track proof-based vs calculation-based split
 *    - Identify graph/diagram-based questions
 *    - Track formula application patterns
 *
 * 2. DEFINE JEE MATHEMATICS-SPECIFIC ARCHETYPES (examples):
 *    - Direct Formula Application
 *    - Multi-step Problem Solving
 *    - Proof/Derivation
 *    - Graph Interpretation
 *    - Conceptual Understanding
 *    - Optimization Problems
 *    - Limit/Continuity/Differentiability Analysis
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE JEE-SPECIFIC STRUCTURAL FORMS:
 *    - Single Correct MCQ
 *    - Multiple Correct MCQ (very common in JEE Math)
 *    - Integer Type (VERY common - answer is 0-9999)
 *    - Matrix Match (4x4 with complex mappings)
 *    - Comprehension (less common in Math)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - Mathematical notation standards (LaTeX-style)
 *    - Integer Type answer range validation (0-9999)
 *    - Step-by-step solution requirements
 *    - Formula notation standards
 *    - Significant figures / rounding rules
 *    - Graph/diagram requirements (if needed)
 *    - Multiple Correct logic (at least 1, at most 4 correct)
 *
 * 5. CREATE JEE MATHEMATICS-SPECIFIC VALIDATORS:
 *    - Integer Type: answer is integer in [0, 9999]
 *    - Multiple Correct: has 1-4 correct answers marked
 *    - Mathematical notation correctness
 *    - Formula syntax validation
 *    - Step verification (if solution steps provided)
 *    - Answer reasonableness check
 *
 * IMPORTANT NOTES:
 * - JEE Math Integer Type typically asks for answer in specific format
 *   (e.g., "If answer is 12.34, enter 1234" or "If answer is √5, enter 2")
 * - Matrix Match in JEE Math can have multiple correct combinations
 * - Multiple Correct questions are scored as: +4 if all correct, 0 otherwise
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../types'

export const jeeMathematicsProtocol: Protocol = {
  id: 'jee-mathematics',
  name: 'JEE Mathematics',
  streamName: 'JEE',
  subjectName: 'Mathematics',

  difficultyMappings: {
    easy: {
      archetypes: {} as any,      // MUST analyze JEE Mathematics papers first
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
    'TODO: Add JEE Mathematics-specific prohibitions after paper analysis',
    'TODO: Mathematical notation standards',
    'TODO: Integer Type answer format rules',
    'TODO: Multiple Correct marking scheme clarification'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify - JEE Math might have different pattern
    warmupPercentage: 0.05      // TODO: Verify - JEE Math might start hard immediately
  },

  buildPrompt: () => {
    throw new Error(
      'JEE Mathematics protocol not implemented yet. ' +
      'Please analyze JEE Mathematics papers (Main + Advanced) and implement this protocol. ' +
      'Pay special attention to Integer Type (very common), Multiple Correct, and Matrix Match questions. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'JEE Mathematics question generation protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze JEE Main/Advanced Mathematics papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
