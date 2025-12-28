/**
 * REET Level 2 - Social Studies Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Level 2 Social Studies is for teaching Classes 6-8 (Upper Primary Level):
 * - History, Geography, Civics (Political Science), Economics
 * - Replaces EVS from Level 1 (more formal social studies)
 * - Social Studies pedagogy (teaching methods)
 * - NCF 2005 social science curriculum alignment
 * - NCERT Classes 6-8 social studies coverage
 * - Rajasthan-specific history and geography emphasis
 * - Negative marking: -1/3 mark per wrong answer
 * - Only MCQ format (4 options)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET LEVEL 2 SOCIAL STUDIES PAPERS (2019-2024)
 *    - Document History vs Geography vs Civics vs Economics distribution
 *    - Track content vs pedagogy split
 *    - Identify Rajasthan-specific content emphasis
 *    - Track NCERT Classes 6-8 alignment
 *    - Document map-based questions (if applicable)
 *    - Identify pedagogy questions
 *
 * 2. DEFINE REET SOCIAL STUDIES-SPECIFIC ARCHETYPES (examples):
 *    - History (ancient, medieval, modern Indian history)
 *    - Geography (physical, human, Rajasthan geography)
 *    - Civics/Political Science (constitution, government, democracy)
 *    - Economics (basic economic concepts, resources)
 *    - Social Studies Pedagogy (teaching methods, activities)
 *    - Rajasthan Context (local history, geography, culture)
 *    - Current Social Issues (if applicable)
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 4-Option MCQ
 *    - Map-based MCQ (if applicable)
 *    - Timeline/chronology MCQ
 *    - Pedagogy scenario MCQ
 *    - Negative phrasing (if used)
 *    (Verify against actual REET papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - Upper primary social studies scope (Classes 6-8)
 *    - NCF 2005 social science pedagogy alignment
 *    - NCERT Classes 6-8 social studies content accuracy
 *    - History/Geography/Civics/Economics balance
 *    - Rajasthan-specific content requirements
 *    - Factual accuracy (dates, events, places)
 *    - Teaching methodology for social studies
 *    - Age-appropriate social concepts
 *
 * 5. CREATE REET SOCIAL STUDIES-SPECIFIC VALIDATORS:
 *    - Age-appropriate content (Classes 6-8 level)
 *    - Historical/geographical accuracy (facts, dates, events)
 *    - NCERT alignment verification
 *    - Subject distribution balance (History/Geo/Civics/Eco)
 *    - Rajasthan context accuracy
 *    - Pedagogical correctness (teaching methods)
 *    - Answer key balance
 *
 * IMPORTANT NOTES:
 * - REET Level 2 Social Studies is formal social science (not EVS)
 * - Covers History, Geography, Civics, and Economics as distinct areas
 * - Strong emphasis on Rajasthan history and geography
 * - Tests both content knowledge AND pedagogy
 * - Must align with NCERT Classes 6-8 social studies syllabus
 * - Map-reading and geography skills may be tested
 * - Chronological understanding important for history questions
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../types'

export const reetLevel2SocialStudiesProtocol: Protocol = {
  id: 'reet-level2-social-studies',
  name: 'REET Level 2 - Social Studies',
  streamName: 'REET Level 2',
  subjectName: 'Social Studies',

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
    'TODO: Add REET Level 2 Social Studies-specific prohibitions after paper analysis',
    'TODO: Historical/geographical accuracy standards',
    'TODO: NCERT alignment requirements',
    'TODO: Rajasthan context accuracy rules'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET papers
    warmupPercentage: 0.10      // TODO: Verify with REET papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Level 2 - Social Studies protocol not implemented yet. ' +
      'Please analyze REET Level 2 Social Studies papers and implement this protocol. ' +
      'Focus on upper primary social studies (Classes 6-8): History, Geography, Civics, Economics, ' +
      'with emphasis on Rajasthan context and pedagogy. Ensure NCERT alignment. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Level 2 Social Studies protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Level 2 Social Studies papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
