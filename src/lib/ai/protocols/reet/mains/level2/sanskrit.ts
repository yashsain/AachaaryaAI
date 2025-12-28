/**
 * REET Mains Level 2 - Sanskrit Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Mains Level 2 - Sanskrit is for Classes 6-8 Sanskrit Teacher Selection
 * Part of the 300-mark integrated paper with common sections
 */

import { Protocol } from '../../../types'

export const reetMainsLevel2SanskritProtocol: Protocol = {
  id: 'reet-mains-level2-sanskrit',
  name: 'REET Mains Level 2 - Sanskrit',
  streamName: 'REET Mains Level 2',
  subjectName: 'Sanskrit',

  difficultyMappings: {
    easy: {
      archetypes: {} as any,
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
    'TODO: Add REET Mains Sanskrit-specific prohibitions'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,
    warmupPercentage: 0.10
  },

  buildPrompt: () => {
    throw new Error(
      'REET Mains Level 2 - Sanskrit protocol not implemented yet. ' +
      'Please analyze REET Mains Level 2 papers and implement this protocol.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Mains Level 2 Sanskrit (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Mains Level 2 papers',
    version: '0.0.1-structure-fixed',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: 'Subject specialization - 140 marks (Sanskrit Content: 120m + Pedagogy: 20m)',
    note: 'Paper structure: Common 160m (Raj GK-A 80m + Raj GK-B 50m + Psychology 20m + IT 10m) + Sanskrit 140m (Content 120m + Pedagogy 20m)'
  }
}
