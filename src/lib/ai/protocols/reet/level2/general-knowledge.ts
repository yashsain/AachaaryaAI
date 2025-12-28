/**
 * REET Level 2 - General Knowledge Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Level 2 General Knowledge (GK) covers:
 * - Rajasthan-specific general knowledge (history, culture, geography, politics)
 * - Current affairs (national and state level)
 * - Indian history, geography, polity, economy
 * - General science awareness
 * - Sports, awards, books & authors
 * - Same topics as Level 1 but may have different emphasis/depth
 * - Negative marking: -1/3 mark per wrong answer
 * - Only MCQ format (4 options)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET LEVEL 2 GK PAPERS (2019-2024)
 *    - Document Rajasthan GK vs India GK split
 *    - Compare with Level 1 to identify differences (if any)
 *    - Track current affairs temporal range
 *    - Identify topic distribution (history, geography, polity, etc.)
 *    - Track fact-based vs reasoning-based questions
 *    - Document Rajasthan-specific focus areas
 *
 * 2. DEFINE REET GK-SPECIFIC ARCHETYPES (examples):
 *    - Rajasthan History (kingdoms, freedom fighters, monuments)
 *    - Rajasthan Geography (rivers, districts, climate, minerals)
 *    - Rajasthan Culture (festivals, folk arts, traditions, handicrafts)
 *    - Rajasthan Polity (government schemes, administration, departments)
 *    - Rajasthan Economy (agriculture, industries, tourism)
 *    - Indian History & Geography
 *    - Current Affairs (state and national)
 *    - General Science (basic awareness)
 *    - Sports & Awards
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 4-Option MCQ
 *    - Fact-based recall MCQ
 *    - Current affairs MCQ
 *    - Match-the-following (if used)
 *    (Verify against actual REET papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - Rajasthan-specific knowledge requirements (heavy emphasis)
 *    - Current affairs time range (typically last 6-12 months)
 *    - Factual accuracy standards
 *    - Topic distribution balance
 *    - Avoid overly specialized/niche topics
 *    - Focus on REET-relevant GK (not random trivia)
 *    - Rajasthan government schemes awareness
 *
 * 5. CREATE REET GK-SPECIFIC VALIDATORS:
 *    - Factual accuracy (dates, names, events, places)
 *    - Rajasthan context accuracy
 *    - Current affairs recency (avoid outdated info)
 *    - Topic distribution balance
 *    - Answer key balance
 *    - No trick questions or obscure facts
 *
 * IMPORTANT NOTES:
 * - Heavy emphasis on Rajasthan-specific GK (50-60% typically)
 * - Level 2 GK may be similar to Level 1, or may have different depth
 * - Current affairs should be recent but not too recent
 * - Rajasthan topics: history (forts, rulers, battles), geography (Aravalli, Thar, rivers),
 *   culture (Ghoomar, Kalbelia, miniature paintings), economy (minerals, crops, industries),
 *   polity (CM schemes, departments, administration)
 * - Indian GK also important but secondary to Rajasthan GK
 * - General science at awareness level (not in-depth)
 * - Sports, awards, important books & authors may be included
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../types'

export const reetLevel2GKProtocol: Protocol = {
  id: 'reet-level2-general-knowledge',
  name: 'REET Level 2 - General Knowledge',
  streamName: 'REET Level 2',
  subjectName: 'General Knowledge',

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
    'TODO: Add REET Level 2 GK-specific prohibitions after paper analysis',
    'TODO: Rajasthan context accuracy rules',
    'TODO: Current affairs recency requirements',
    'TODO: Factual accuracy standards'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET papers
    warmupPercentage: 0.10      // TODO: Verify with REET papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Level 2 - General Knowledge protocol not implemented yet. ' +
      'Please analyze REET Level 2 GK papers and implement this protocol. ' +
      'Focus heavily on Rajasthan-specific GK (history, geography, culture, polity, economy), ' +
      'with additional coverage of Indian GK and current affairs. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Level 2 General Knowledge protocol (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Level 2 GK papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27'
  }
}
