/**
 * REET Mains Level 2 - Social Studies Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Mains is the 3rd Grade Teacher Selection Exam (SEPARATE from REET Pre):
 * - REET Pre = Eligibility exam (qualifying)
 * - REET Mains = Final selection exam (merit-based)
 * - Only candidates who cleared REET Pre can appear for REET Mains
 *
 * REET Mains Level 2 - Social Studies is for Classes 6-8 Social Studies Teacher Selection:
 * - Integrated paper: Common sections + Social Studies specialization
 * - 150 questions, 300 marks (2 marks each)
 * - Duration: 2 hours 30 minutes
 * - Negative marking: -1/3 mark per wrong answer
 * - 5 options per question (changed from 4 in 2025)
 * - Difficulty level: Graduation level
 * - Heavy emphasis on Rajasthan-specific content in common sections
 *
 * PAPER STRUCTURE (150 Questions, 300 Marks):
 * ===========================================
 * PART A - COMMON SECTIONS (80 Questions, 160 Marks) - FOR ALL CANDIDATES:
 *
 * 1. Rajasthan Geography, History & Culture (40 questions, 80 marks)
 *    - Rajasthan geography, history, culture (detailed coverage)
 *    - NOTE: This overlaps with Social Studies specialization, may be deeper
 *
 * 2. General Knowledge of Rajasthan (25 questions, 50 marks)
 *    - Current affairs, government schemes, polity
 *
 * 3. Educational Psychology (10 questions, 20 marks)
 *    - Adolescent psychology, learning theories, RTE, NEP 2020
 *
 * 4. Information Technology (5 questions, 10 marks)
 *    - Basics of Computers
 *    - MS Office, Internet, Email
 *    - Digital India, IT tools in Education
 *
 * PART B - SUBJECT SPECIALIZATION (70 Questions, 140 Marks) - SUBJECT TEACHERS ONLY:
 *
 * 5. Social Studies Subject Content (60 questions, 120 marks)
 *
 *    A. HISTORY:
 *    - Ancient Indian history (Indus Valley, Vedic period, Mauryas, Guptas)
 *    - Medieval Indian history (Delhi Sultanate, Mughals, regional kingdoms)
 *    - Modern Indian history (British rule, freedom movement, independence)
 *    - Rajasthan history (deep coverage - kingdoms, rulers, battles, forts)
 *    - World history (major civilizations, world wars, UN)
 *
 *    B. GEOGRAPHY:
 *    - Physical geography (landforms, climate, natural resources)
 *    - Indian geography (states, rivers, mountains, minerals, agriculture)
 *    - Rajasthan geography (detailed - districts, rivers, Aravalli, Thar, minerals)
 *    - World geography (continents, oceans, countries, climate zones)
 *    - Map reading and skills
 *
 *    C. CIVICS/POLITICAL SCIENCE:
 *    - Indian constitution (preamble, fundamental rights, duties, DPSP)
 *    - Union government (Parliament, Executive, Judiciary)
 *    - State government (structure, functions)
 *    - Rajasthan polity (administration, departments, local governance)
 *    - Democracy and citizenship
 *    - Electoral system
 *
 *    D. ECONOMICS:
 *    - Basic economic concepts (demand, supply, production, consumption)
 *    - Indian economy (agriculture, industries, services, trade)
 *    - Rajasthan economy (crops, minerals, industries, tourism)
 *    - Economic planning and development
 *    - Money and banking
 *
 * 6. Social Studies Teaching Methods / Pedagogy (10 questions, 20 marks)
 *    - Teaching methods for history, geography, civics, economics
 *    - Map skills and activities
 *    - Critical thinking and analysis
 *    - Current events integration
 *    - Project-based learning
 *    - Assessment methods for social studies
 *    - Use of teaching aids and resources
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET MAINS LEVEL 2 SOCIAL STUDIES PAPERS (2019-2024)
 *    - Document common sections vs Social Studies distribution
 *    - Track History/Geography/Civics/Economics balance
 *    - Identify Rajasthan content depth (both in common AND specialization)
 *    - Track factual vs analytical questions
 *    - Analyze 5-option MCQ patterns
 *    - Document pedagogy integration
 *    - Track map-based questions (if any)
 *
 * 2. DEFINE REET MAINS LEVEL 2 SOCIAL STUDIES ARCHETYPES (examples):
 *    - Rajasthan Factual Knowledge (geography, history, culture, economy)
 *    - Educational Policy & Psychology
 *    - Historical Factual Recall (Indian + World)
 *    - Geographical Knowledge (physical + human)
 *    - Civics/Political Knowledge (constitution, government)
 *    - Economic Concepts
 *    - Current Affairs Application
 *    - Social Studies Pedagogy
 *    - Analytical/Critical Thinking
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET MAINS-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 5-Option MCQ (PRIMARY format - changed in 2025)
 *    - Fact-based MCQ
 *    - Map-based MCQ (if applicable)
 *    - Timeline/chronology MCQ
 *    - Current affairs MCQ
 *    - Analytical MCQ
 *    - Pedagogy scenario MCQ
 *    (Verify against actual REET Mains papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - Integrated paper structure (Common 160 marks + Social Studies 140 marks)
 *    - 5 options per question (CRITICAL - different from Pre)
 *    - Rajasthan-specific content (VERY heavy - in both common AND specialization)
 *    - Graduation-level social studies
 *    - History/Geography/Civics/Economics balance
 *    - Historical accuracy (dates, events, persons)
 *    - Geographical accuracy (places, features, data)
 *    - Constitutional accuracy (articles, amendments)
 *    - Economic concepts clarity
 *    - Social studies pedagogy methods
 *    - Educational framework (RTE, NEP 2020)
 *
 * 5. CREATE REET MAINS LEVEL 2 SOCIAL STUDIES VALIDATORS:
 *    - Section distribution (40+25+10+5+60+10 = 150 questions)
 *    - 5 options per question (MUST validate)
 *    - Historical accuracy (dates, events, persons, places)
 *    - Geographical accuracy (locations, features, data)
 *    - Constitutional/political accuracy
 *    - Economic concepts accuracy
 *    - Rajasthan content accuracy (CRITICAL - high volume)
 *    - History/Geography/Civics/Economics balance
 *    - Educational policy accuracy
 *    - Graduation-level difficulty
 *    - Answer key balance
 *
 * IMPORTANT NOTES:
 * - REET Mains is SELECTION exam (merit-based), not eligibility like Pre
 * - Integrated paper: Common sections (160 marks) + Social Studies (140 marks)
 * - 5 options per MCQ (changed in 2025, not 4)
 * - Rajasthan content is EXTREMELY high (common sections + specialization both have Raj content)
 * - Graduation-level difficulty throughout
 * - Social Studies = History + Geography + Civics + Economics (integrated)
 * - Strong emphasis on Rajasthan history (kingdoms, rulers, forts, battles)
 * - Strong emphasis on Rajasthan geography (districts, rivers, Aravalli, Thar, minerals)
 * - Indian constitution, government structure critical
 * - Current affairs (national + state) important
 * - Pedagogy for teaching social studies
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../../types'

export const reetMainsLevel2SocialStudiesProtocol: Protocol = {
  id: 'reet-mains-level2-social-studies',
  name: 'REET Mains Level 2 - Social Studies',
  streamName: 'REET Mains Level 2',
  subjectName: 'Social Studies',

  difficultyMappings: {
    easy: {
      archetypes: {} as any,      // MUST analyze REET Mains Level 2 papers first
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
    'TODO: Add REET Mains Level 2 Social Studies-specific prohibitions after paper analysis',
    'TODO: 5-option MCQ requirements (not 4-option)',
    'TODO: Historical/geographical accuracy standards',
    'TODO: Constitutional/political accuracy standards',
    'TODO: Rajasthan content accuracy (extremely critical)',
    'TODO: Graduation-level difficulty requirements'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET Mains papers
    warmupPercentage: 0.10      // TODO: Verify with REET Mains papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Mains Level 2 - Social Studies protocol not implemented yet. ' +
      'Please analyze REET Mains Level 2 Social Studies papers and implement this protocol. ' +
      'CRITICAL: This is 3rd Grade Teacher SELECTION exam for Classes 6-8 Social Studies teachers. ' +
      'Paper structure: Common sections (Raj GK-A 80m + Raj GK-B 50m + Psychology 20m + IT 10m = 160m)) + Social Studies (Content 120m + Pedagogy 20m = 140m) = 300m. ' +
      'MUST use 5 options per MCQ. Graduation-level History, Geography, Civics, Economics. ' +
      'EXTREMELY heavy Rajasthan content (both in common sections AND specialization). ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Mains Level 2 Social Studies protocol - 3rd Grade Social Studies Teacher Selection for Classes 6-8 (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Mains Level 2 Social Studies papers (2019-2024)',
    version: '0.0.1-structure-fixed',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: 'Subject specialization - 140 marks (Social Studies Content: 120m + Pedagogy: 20m)',
    relatedExam: 'REET Pre Level 2 (Eligibility/Qualifying)'
  }
}
