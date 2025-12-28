/**
 * REET Level 2 - Science Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Level 2 Science is for teaching Classes 6-8 (Upper Primary Level):
 * - Physics, Chemistry, and Biology concepts for upper primary
 * - Replaces EVS from Level 1 (more formal science)
 * - Science pedagogy (teaching methods for young adolescents)
 * - NCF 2005 science curriculum alignment
 * - NCERT Classes 6-8 science coverage
 * - Negative marking: -1/3 mark per wrong answer
 * - Only MCQ format (4 options)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET LEVEL 2 SCIENCE PAPERS (2019-2024)
 *    - Document Physics vs Chemistry vs Biology distribution
 *    - Track content vs pedagogy split
 *    - Identify difficulty level (Classes 6-8 appropriate)
 *    - Track experiment/activity-based questions
 *    - Document NCERT alignment patterns
 *    - Identify science pedagogy questions
 *
 * 2. DEFINE REET SCIENCE-SPECIFIC ARCHETYPES (examples):
 *    - Physics Concepts (motion, force, light, sound, electricity)
 *    - Chemistry Concepts (matter, substances, acids/bases, reactions)
 *    - Biology Concepts (plants, animals, human body, microorganisms)
 *    - Science Pedagogy (teaching methods, experiments, activities)
 *    - Conceptual Understanding (scientific principles)
 *    - Application-based (real-life science)
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 4-Option MCQ
 *    - Diagram/picture-based MCQ (if applicable)
 *    - Experiment-based scenario MCQ
 *    - Pedagogy scenario MCQ
 *    - Negative phrasing (if used)
 *    (Verify against actual REET papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - Upper primary science scope (Classes 6-8)
 *    - NCF 2005 science pedagogy alignment
 *    - NCERT Classes 6-8 science content accuracy
 *    - Physics, Chemistry, Biology balance
 *    - Experiment and activity-based learning
 *    - Scientific accuracy standards
 *    - Teaching methodology for science
 *    - Age-appropriate scientific concepts
 *
 * 5. CREATE REET SCIENCE-SPECIFIC VALIDATORS:
 *    - Age-appropriate content (Classes 6-8 level)
 *    - Scientific accuracy (facts, concepts, principles)
 *    - NCERT alignment verification
 *    - Physics/Chemistry/Biology distribution balance
 *    - Pedagogical correctness (teaching methods)
 *    - Answer key balance
 *    - Experiment/activity accuracy (if applicable)
 *
 * IMPORTANT NOTES:
 * - REET Level 2 Science is formal science (not EVS like Level 1)
 * - Covers Physics, Chemistry, and Biology as distinct branches
 * - Tests both content knowledge AND science pedagogy
 * - Must align with NCERT Classes 6-8 science syllabus
 * - Experiment-based and activity-based learning questions common
 * - May include questions on lab safety, scientific method
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../types'

export const reetLevel2ScienceProtocol: Protocol = {
  id: 'reet-level2-science',
  name: 'REET Level 2 - Science',
  streamName: 'REET Level 2',
  subjectName: 'Science',

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
    'TODO: Add REET Level 2 Science-specific prohibitions after paper analysis',
    'TODO: Scientific accuracy standards',
    'TODO: NCERT alignment requirements',
    'TODO: Age-appropriate content rules'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET papers
    warmupPercentage: 0.10      // TODO: Verify with REET papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Level 2 - Science protocol not implemented yet. ' +
      'Please analyze REET Level 2 Science papers and implement this protocol. ' +
      'Focus on upper primary science (Classes 6-8): Physics, Chemistry, Biology, and science pedagogy. ' +
      'Ensure NCERT alignment. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Level 2 Science protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Level 2 Science papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
