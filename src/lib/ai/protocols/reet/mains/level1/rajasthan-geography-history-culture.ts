/**
 * REET Mains Level 1 - Rajasthan Geography, History & Culture Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Mains is the 3rd Grade Teacher Selection Exam (SEPARATE from REET Pre):
 * - REET Pre = Eligibility exam (qualifying)
 * - REET Mains = Final selection exam (merit-based)
 * - Only candidates who cleared REET Pre can appear for REET Mains
 *
 * This protocol is for the Rajasthan Geography, History & Culture section:
 * - Part of REET Mains Level 1 integrated paper
 * - 50 questions, 100 marks (2 marks each)
 * - 5 options per question (changed from 4 in 2025)
 * - Negative marking: -1/3 mark per wrong answer
 * - Difficulty level: Graduation level
 * - Highest weightage section in REET Mains Level 1 (33% of paper)
 *
 * SECTION COVERAGE (50 Questions, 100 Marks):
 * ===========================================
 *
 * A. RAJASTHAN GEOGRAPHY (~15-18 questions):
 *    - Physical geography
 *      - Location, area, boundaries
 *      - Aravalli mountain range (highest peaks, passes)
 *      - Thar Desert (formation, characteristics, extent)
 *      - Rivers (Chambal, Banas, Luni, Mahi, etc.)
 *      - Lakes (Sambhar, Pushkar, Jaisamand, etc.)
 *      - Climate and seasons
 *      - Soil types
 *    - Human geography
 *      - Districts and divisions (all 33 districts, 7 divisions)
 *      - Population, density, literacy
 *      - Languages and dialects
 *    - Economic geography
 *      - Minerals (marble, granite, zinc, copper, limestone, gypsum)
 *      - Agriculture (crops - wheat, bajra, mustard, cotton)
 *      - Industries (textiles, handicrafts, mining)
 *      - Irrigation projects (Indira Gandhi Canal, Chambal Project)
 *      - Animal husbandry
 *
 * B. RAJASTHAN HISTORY (~15-18 questions):
 *    - Ancient period
 *      - Indus Valley sites (Kalibangan)
 *      - Mauryan and Gupta period
 *    - Medieval period
 *      - Rajput kingdoms (Mewar, Marwar, Amber, Bikaner, Jaipur)
 *      - Great rulers (Maharana Pratap, Rana Sanga, Rana Kumbha)
 *      - Major battles (Haldighati, Khanwa)
 *      - Forts (Chittorgarh, Kumbhalgarh, Mehrangarh, Amber, Jaisalmer)
 *      - Mughal-Rajput relations
 *    - Modern period
 *      - 1857 revolt in Rajasthan
 *      - Freedom movement (freedom fighters, movements)
 *      - Peasant and tribal movements
 *      - Integration of princely states (1949)
 *      - Formation of Rajasthan (stages)
 *
 * C. RAJASTHAN CULTURE (~12-15 questions):
 *    - Festivals (Teej, Gangaur, Pushkar Mela, Camel Festival)
 *    - Folk dances (Ghoomar, Kalbelia, Kachhi Ghodi, Bhavai)
 *    - Folk music (instruments - Ravanhatha, Kamaycha, Algoza)
 *    - Folk arts and paintings (Phad, Miniature, Mandana)
 *    - Handicrafts (Blue Pottery, Theva art, Lac bangles, Tie-dye)
 *    - Traditional attire and ornaments
 *    - Cuisine (Dal Baati Churma, Ghevar, Laal Maas)
 *    - Fairs and religious places
 *    - Literature and languages
 *
 * D. RAJASTHAN TOURISM & HERITAGE (~5 questions):
 *    - UNESCO World Heritage Sites (Hill Forts, Jantar Mantar, Keoladeo)
 *    - Wildlife sanctuaries (Ranthambore, Sariska, Keoladeo)
 *    - Tourism circuits and initiatives
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET MAINS LEVEL 1 PAPERS (2019-2024 if available)
 *    - Document geography vs history vs culture distribution
 *    - Track district-wise coverage (all 33 districts should be known)
 *    - Identify frequently asked rulers, battles, monuments
 *    - Track folk arts and handicraft coverage
 *    - Analyze 5-option MCQ patterns
 *    - Document difficulty level (graduation standard)
 *
 * 2. DEFINE REET MAINS RAJASTHAN GHC ARCHETYPES (examples):
 *    - Factual Recall (districts, rulers, monuments, rivers)
 *    - Geographical Data (minerals, crops, industries by region)
 *    - Historical Events (battles, movements, integration)
 *    - Cultural Knowledge (festivals, folk arts, handicrafts)
 *    - Current Tourism & Heritage
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET MAINS-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 5-Option MCQ (PRIMARY format - changed in 2025)
 *    - Fact-based MCQ
 *    - Map-based MCQ (if applicable)
 *    - Match-the-following (if used)
 *    (Verify against actual REET Mains papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - 50 questions, 100 marks requirement
 *    - 5 options per question (CRITICAL - different from Pre)
 *    - Graduation-level difficulty
 *    - Geography/History/Culture balance
 *    - All 33 districts coverage
 *    - Major rulers and kingdoms
 *    - Forts and monuments accuracy
 *    - Folk arts and handicrafts authenticity
 *    - Current data (minerals, crops, industries)
 *    - Factual accuracy standards
 *
 * 5. CREATE REET MAINS RAJASTHAN GHC VALIDATORS:
 *    - 5 options per question (MUST validate)
 *    - Factual accuracy (geographical, historical, cultural)
 *    - District names and data accuracy
 *    - Historical dates and events accuracy
 *    - Cultural authenticity
 *    - Graduation-level difficulty
 *    - Answer key balance
 *    - No ambiguous questions
 *
 * IMPORTANT NOTES:
 * - This is the HIGHEST weightage section (50/150 questions = 33%)
 * - REET Mains is SELECTION exam (merit-based), not eligibility
 * - 5 options per MCQ (changed in 2025, not 4)
 * - Graduation-level difficulty (deeper than REET Pre)
 * - All 33 districts must be covered in preparation
 * - Rajasthan-specific content ONLY (no other states)
 * - Current data required (recent mineral production, crops, schemes)
 * - Folk culture authenticity critical (no generic Indian culture)
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../../types'

export const reetMainsLevel1RajasthanGHCProtocol: Protocol = {
  id: 'reet-mains-level1-rajasthan-geography-history-culture',
  name: 'REET Mains Level 1 - Rajasthan Geography, History & Culture',
  streamName: 'REET Mains Level 1',
  subjectName: 'Rajasthan Geography, History & Culture',

  difficultyMappings: {
    easy: {
      archetypes: {} as any,      // MUST analyze REET Mains Level 1 papers first
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
    'TODO: Add REET Mains Rajasthan GHC-specific prohibitions after paper analysis',
    'TODO: 5-option MCQ requirements (not 4-option)',
    'TODO: Rajasthan content accuracy standards',
    'TODO: Factual accuracy (geography, history, culture)',
    'TODO: Graduation-level difficulty requirements'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET Mains papers
    warmupPercentage: 0.10      // TODO: Verify with REET Mains papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Mains Level 1 - Rajasthan Geography, History & Culture protocol not implemented yet. ' +
      'Please analyze REET Mains Level 1 papers and implement this protocol. ' +
      'CRITICAL: This is the highest weightage section (50Q/150Q = 33%). ' +
      'Coverage: Rajasthan Geography (districts, rivers, minerals, crops) + History (kingdoms, rulers, battles, forts) + ' +
      'Culture (festivals, folk arts, handicrafts). ' +
      'MUST use 5 options per MCQ. Graduation-level difficulty. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Mains Level 1 Rajasthan Geography, History & Culture - Highest weightage section (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Mains Level 1 papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: '50 questions out of 150 (33%)'
  }
}
