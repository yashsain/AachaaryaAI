/**
 * REET Level 1 - Environmental Studies Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Level 1 Environmental Studies (EVS) is for teaching Classes 1-5:
 * - Integrated subject combining science, social studies, and environmental awareness
 * - Focus on child's immediate environment (family, school, community)
 * - NCF 2005 EVS curriculum alignment
 * - Rajasthan-specific environmental context (desert, wildlife, culture)
 * - Pedagogy of EVS teaching
 * - Negative marking: -1/3 mark per wrong answer
 * - Only MCQ format (4 options)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET LEVEL 1 EVS PAPERS (2019-2024)
 *    - Document content areas (plants, animals, family, community, environment)
 *    - Track Rajasthan-specific content (local flora/fauna, culture)
 *    - Identify pedagogy vs content split
 *    - Track activity-based learning questions
 *    - Document NCF 2005 EVS theme coverage
 *
 * 2. DEFINE REET EVS-SPECIFIC ARCHETYPES (examples):
 *    - Environmental Awareness (conservation, pollution)
 *    - Living World (plants, animals, human body)
 *    - Social Environment (family, community, culture)
 *    - Natural Resources (water, air, soil)
 *    - EVS Pedagogy (teaching methods, activities)
 *    - Rajasthan Context (local environment, traditions)
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 4-Option MCQ
 *    - Activity-based scenario MCQ
 *    - Picture/diagram-based MCQ (if applicable)
 *    - Negative phrasing (if used)
 *    (Verify against actual REET papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - NCF 2005 EVS themes and objectives
 *    - Rajasthan environmental context (desert ecosystem, local wildlife)
 *    - Primary level appropriateness (Classes 1-5)
 *    - Integrated approach (not separate science/social studies)
 *    - Activity-based learning emphasis
 *    - Cultural and environmental sensitivity
 *
 * 5. CREATE REET EVS-SPECIFIC VALIDATORS:
 *    - Age-appropriate content (Classes 1-5 level)
 *    - Rajasthan context accuracy
 *    - NCF 2005 EVS alignment
 *    - Environmental accuracy (scientific facts)
 *    - Cultural sensitivity
 *    - Answer key balance
 *
 * IMPORTANT NOTES:
 * - EVS is NOT separate Science and Social Studies - it's integrated
 * - Strong emphasis on child's immediate environment
 * - Rajasthan-specific context is important (desert, Ranthambore, local culture)
 * - Pedagogy of EVS teaching is part of the syllabus
 * - Activity-based learning questions common
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../types'

export const reetLevel1EVSProtocol: Protocol = {
  id: 'reet-level1-environmental-studies',
  name: 'REET Level 1 - Environmental Studies',
  streamName: 'REET Level 1',
  subjectName: 'Environmental Studies',

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
    'TODO: Add REET EVS-specific prohibitions after paper analysis',
    'TODO: Rajasthan context accuracy rules',
    'TODO: NCF 2005 EVS alignment requirements',
    'TODO: Environmental sensitivity guidelines'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET papers
    warmupPercentage: 0.10      // TODO: Verify with REET papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Level 1 - Environmental Studies protocol not implemented yet. ' +
      'Please analyze REET Level 1 EVS papers and implement this protocol. ' +
      'Focus on integrated EVS approach (not separate science/social), Rajasthan context, and NCF 2005 alignment. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Level 1 Environmental Studies protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Level 1 EVS papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
