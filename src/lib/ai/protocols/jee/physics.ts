/**
 * JEE Physics Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * JEE Physics is COMPLETELY DIFFERENT from NEET Biology:
 * - Different question types (Integer Type, Multiple Correct, Comprehension, Matrix Match)
 * - Different cognitive patterns (calculation-heavy, concept application, problem-solving)
 * - Different difficulty progression
 * - Different content fidelity (NCERT + HC Verma + Resnick Halliday, not just NCERT)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE JEE PHYSICS PAPERS (2019-2024 recommended)
 *    - Identify ACTUAL JEE question types (NOT copying from NEET!)
 *    - Document calculation patterns
 *    - Identify formula usage patterns
 *    - Track numerical answer ranges for Integer Type
 *
 * 2. DEFINE JEE-SPECIFIC ARCHETYPES (examples, NOT prescriptive):
 *    - Formula Application
 *    - Conceptual Understanding
 *    - Problem Solving (multi-step)
 *    - Numerical Estimation
 *    - Graph/Diagram Interpretation
 *    - Derivation-based
 *    (Analyze papers to find ACTUAL archetypes)
 *
 * 3. DEFINE JEE-SPECIFIC STRUCTURAL FORMS:
 *    - Single Correct MCQ
 *    - Multiple Correct MCQ (can have 1, 2, 3, or 4 correct answers)
 *    - Integer Type (numerical answer, no options)
 *    - Matrix Match (complex 4x4 with multiple valid combinations)
 *    - Comprehension-based (passage + 3-4 questions)
 *
 * 4. BUILD COMPREHENSIVE PROMPT (800-1200 words)
 *    Include:
 *    - JEE-specific question formats with exact templates
 *    - Calculation accuracy standards (sig figs, units)
 *    - Formula notation standards
 *    - Numerical answer range validation for Integer Type
 *    - Multiple correct validation logic
 *
 * 5. CREATE JEE-SPECIFIC VALIDATORS:
 *    - Integer Type: answer is valid integer in expected range
 *    - Multiple Correct: at least one correct option marked
 *    - SI units present and correct
 *    - Calculation verification
 *    - Formula notation standards
 *
 * REFERENCE IMPLEMENTATION: src/lib/ai/protocols/neet/biology.ts
 * CREATION GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../types'

/**
 * STUB IMPLEMENTATION - WILL THROW ERROR IF USED
 */
export const jeePhysicsProtocol: Protocol = {
  id: 'jee-physics',
  name: 'JEE Physics',
  streamName: 'JEE',
  subjectName: 'Physics',

  // These are PLACEHOLDER values - DO NOT USE
  difficultyMappings: {
    easy: {
      archetypes: {} as any,      // MUST analyze JEE papers first
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
    'TODO: Add JEE Physics-specific prohibitions after paper analysis'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with JEE papers
    warmupPercentage: 0.05      // TODO: Verify with JEE papers
  },

  buildPrompt: () => {
    throw new Error(
      'JEE Physics protocol not implemented yet. ' +
      'Please analyze JEE Physics papers and implement this protocol. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'JEE Physics question generation protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze JEE Main/Advanced Physics papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
