/**
 * JEE Chemistry Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * JEE Chemistry is COMPLETELY DIFFERENT from NEET Biology:
 * - Different question types (Integer Type, Multiple Correct, Comprehension)
 * - Organic, Inorganic, and Physical Chemistry have different patterns
 * - Calculation-heavy questions (stoichiometry, equilibrium, thermodynamics)
 * - IUPAC nomenclature requirements
 * - Reaction mechanism questions
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE JEE CHEMISTRY PAPERS (2019-2024)
 *    - Separate analysis for Organic/Inorganic/Physical sections
 *    - Document calculation vs conceptual split
 *    - Track IUPAC nomenclature usage patterns
 *    - Identify reaction mechanism question patterns
 *
 * 2. DEFINE JEE CHEMISTRY-SPECIFIC ARCHETYPES (examples):
 *    - Reaction Mechanism
 *    - Structure Identification
 *    - Stoichiometric Calculation
 *    - Conceptual (bonding, periodic trends)
 *    - Equilibrium/Kinetics Problems
 *    - Organic Synthesis Pathway
 *    (Analyze papers to find ACTUAL archetypes - these are just examples)
 *
 * 3. DEFINE JEE-SPECIFIC STRUCTURAL FORMS:
 *    - Single Correct MCQ
 *    - Multiple Correct MCQ
 *    - Integer Type (numerical calculations)
 *    - Comprehension (passage + questions)
 *    - Reaction Sequence (multi-step)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - IUPAC nomenclature standards
 *    - Chemical equation balancing requirements
 *    - Significant figures for calculations
 *    - Reaction arrow notation standards
 *    - Structure drawing guidelines (if applicable)
 *
 * 5. CREATE JEE CHEMISTRY-SPECIFIC VALIDATORS:
 *    - IUPAC nomenclature correctness
 *    - Balanced chemical equations
 *    - Proper oxidation state notation
 *    - Integer Type answer validation
 *    - Multiple Correct validation
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../types'

export const jeeChemistryProtocol: Protocol = {
  id: 'jee-chemistry',
  name: 'JEE Chemistry',
  streamName: 'JEE',
  subjectName: 'Chemistry',

  difficultyMappings: {
    easy: {
      archetypes: {} as any,      // MUST analyze JEE Chemistry papers first
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
    'TODO: Add JEE Chemistry-specific prohibitions after paper analysis',
    'TODO: IUPAC nomenclature rules',
    'TODO: Chemical equation standards'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,
    warmupPercentage: 0.05
  },

  buildPrompt: () => {
    throw new Error(
      'JEE Chemistry protocol not implemented yet. ' +
      'Please analyze JEE Chemistry papers (separate Organic/Inorganic/Physical) and implement this protocol. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'JEE Chemistry question generation protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze JEE Main/Advanced Chemistry papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
