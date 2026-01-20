/**
 * RPSC Senior Teacher (Grade II) - Paper 1: India & World GK Protocol
 *
 * UPDATED: REET 2026-Inspired Protocol (Grade 2 MORE difficult than REET Grade 3)
 * Section: General Knowledge of India & the World
 * Question Count: ~30 questions per paper
 *
 * EXAM CONTEXT:
 * - Part of Common Paper 1 for ALL RPSC Senior Teacher Grade II candidates
 * - Covers Indian Polity, Geography (India + World), History, Economy, International Relations
 * - All questions in Hindi (primary language)
 *
 * NEW STRUCTURAL DISTRIBUTION (2026 Pattern):
 * - Standard MCQ: 17% (REDUCED from 100%)
 * - Multi-Statement Evaluation (MSQ): 40% (NEW DOMINANT - most difficult)
 * - Match-the-Following: 20% (NEW)
 * - Arrange-in-Order: 23% (ENHANCED from 15%)
 *
 * DIFFICULTY: 4-6x multiplier (higher than REET's 3-5x)
 * HIGH COGNITIVE LOAD: 50-60% (senior position demands)
 */

import { Protocol, ProtocolConfig } from '../../../types'
import { Question } from '../../../../questionValidator'

/**
 * India & World GK Archetype Distributions
 * Difficulty: 20% Easy, 50% Balanced, 30% Hard
 */

const indiaWorldGKArchetypes = {
  easy: {
    singleFactRecall: 0.50,           // REDUCED from 0.60 - still primary but balanced
    multiStatementEvaluation: 0.25,   // INCREASED from 0.20 - more MSQ practice
    matchTheFollowing: 0.15,          // Basic matching
    arrangeInOrder: 0.10              // Basic ordering
  },
  balanced: {
    singleFactRecall: 0.15,       // REDUCED from 0.50 - REET 2026 pattern
    multiStatementEvaluation: 0.40, // NEW DOMINANT - MSQ format
    arrangeInOrder: 0.20,         // INCREASED from 0.15
    matchTheFollowing: 0.20,      // INCREASED from 0.10
    exceptionNegative: 0.05       // REDUCED from 0.10
    // statementValidation removed (was 0.15)
  },
  hard: {
    multiStatementEvaluation: 0.50, // NEW DOMINANT - Complex MSQ
    matchTheFollowing: 0.25,      // Complex matching
    arrangeInOrder: 0.20,         // Complex sequencing
    exceptionNegative: 0.05       // Reduced emphasis
  }
}

/**
 * Structural Forms - SEPARATED BY DIFFICULTY
 * REET 2026-inspired format distribution - Grade 2 MORE difficult than REET
 * Each difficulty level has its own structural form distribution
 * NOTE: India/World GK has NO Assertion-Reason format
 */
const structuralForms = {
  easy: {
    standard4OptionMCQ: 0.55,       // More MCQ for easy level
    multipleSelectQuestions: 0.25,  // Moderate MSQ
    matchTheFollowing: 0.15,        // Light matching
    arrangeInOrder: 0.05            // Minimal arrange
  },
  balanced: {
    standard4OptionMCQ: 0.17,       // PLAN TARGET - Only 17%
    multipleSelectQuestions: 0.40,  // PLAN TARGET - 40% MSQ (most difficult)
    matchTheFollowing: 0.20,        // PLAN TARGET - 20% Match
    arrangeInOrder: 0.23            // PLAN TARGET - 23% Arrange
  },
  hard: {
    standard4OptionMCQ: 0.10,       // Minimal MCQ for hard
    multipleSelectQuestions: 0.50,  // Maximum MSQ (hardest format)
    matchTheFollowing: 0.20,        // Same as balanced
    arrangeInOrder: 0.20            // Slightly reduced from balanced
  }
}

/**
 * Cognitive Load Distribution - SMOOTHED PROGRESSION
 * Grade 2 Target: High-density 50-60% (MORE than REET's 45-55%)
 * Smooth progression: 20% → 60% → 70% (not steep 10% → 60% → 70%)
 */
const cognitiveLoad = {
  easy: {
    lowDensity: 0.40,    // REDUCED from 0.60 - easier but progressing
    mediumDensity: 0.40, // INCREASED from 0.30 - more medium-density
    highDensity: 0.20    // DOUBLED from 0.10 - smooth progression to balanced
  },
  balanced: {
    lowDensity: 0.10,    // PLAN TARGET - minimal low-density
    mediumDensity: 0.30, // PLAN TARGET
    highDensity: 0.60    // PLAN TARGET - senior position demands
  },
  hard: {
    lowDensity: 0.05,    // Minimal low-density
    mediumDensity: 0.25, // Reduced medium
    highDensity: 0.70    // Maximum difficulty
  }
}

/**
 * Difficulty Mappings - NOW WITH SEPARATE STRUCTURAL FORMS PER DIFFICULTY
 */
const difficultyMappings: Protocol['difficultyMappings'] = {
  easy: {
    archetypes: indiaWorldGKArchetypes.easy as any,
    structuralForms: structuralForms.easy as any,      // FIXED: Use easy structural forms
    cognitiveLoad: cognitiveLoad.easy
  },
  balanced: {
    archetypes: indiaWorldGKArchetypes.balanced as any,
    structuralForms: structuralForms.balanced as any,  // FIXED: Use balanced structural forms
    cognitiveLoad: cognitiveLoad.balanced
  },
  hard: {
    archetypes: indiaWorldGKArchetypes.hard as any,
    structuralForms: structuralForms.hard as any,      // FIXED: Use hard structural forms
    cognitiveLoad: cognitiveLoad.hard
  }
}

/**
 * Prohibitions
 */
const prohibitions: string[] = [
  'NEVER use "All of the above" or "None of the above"',
  'NEVER use 5 options - MUST use exactly 4 options',
  'NEVER use outdated data - always verify with latest sources',
  'NEVER use controversial political interpretations',
  'NEVER use ambiguous constitutional interpretations',
  'DUPLICATE OPTIONS FORBIDDEN',

  // DATA INTEGRITY PROHIBITIONS (CRITICAL - Zero Tolerance):
  'NEVER generate null values in any field - every field must have a valid value',
  'NEVER generate undefined values in any field - every field must be defined',
  'NEVER omit required fields - questionNumber, questionText, options, correctAnswer, explanation are MANDATORY',
  'NEVER generate empty option values - all 4 options MUST contain text (minimum 2 characters)',
  'NEVER use invalid option keys - options MUST be exactly "1", "2", "3", "4" (not A/B/C/D, not 0-based)',
  'NEVER generate fewer than 4 options - MUST be exactly 4 options',
  'NEVER generate more than 4 options - MUST be exactly 4 options',
  'NEVER generate invalid correctAnswer - MUST be one of "1", "2", "3", "4" (string format)',
  'NEVER generate questionText as null or empty string - MUST be full question with minimum 10 characters',
  'NEVER generate explanation as null or empty string - MUST be detailed explanation with minimum 20 characters',

  // ARCHETYPE PROHIBITIONS (CRITICAL - Prevents JSON parse errors):
  'NEVER use these archetypes: assertionReason, comparative, statementValidation, matching, sequencing',
  'ONLY use these 5 allowed archetypes: multiStatementEvaluation, matchTheFollowing, arrangeInOrder, singleFactRecall, exceptionNegative',
  'NEVER generate Assertion-Reason format questions - NOT applicable to India/World GK',
  'NEVER use old archetype names from previous versions - use only the 5 allowed names above'
]

/**
 * Calculate archetype counts
 */
function getArchetypeCounts(
  difficulty: 'easy' | 'balanced' | 'hard',
  questionCount: number
): Record<string, number> {
  const archetypes = indiaWorldGKArchetypes[difficulty]
  const counts: Record<string, number> = {}

  for (const [key, value] of Object.entries(archetypes)) {
    counts[key] = Math.round(questionCount * value)
  }

  return counts
}

/**
 * India & World GK Prompt Builder
 */
function buildIndiaWorldGKPrompt(
  config: ProtocolConfig,
  chapterName: string,
  questionCount: number,
  totalQuestions: number,
  isBilingual: boolean = false,
  hasStudyMaterials: boolean = true
): string {
  const difficulty = 'balanced'
  const archetypeCounts = getArchetypeCounts(difficulty, questionCount)

  const archetypeList = Object.entries(archetypeCounts)
    .filter(([_, count]) => count > 0)
    .map(([archetype, count]) => `- **${count} ${archetype}**`)
    .join('\n')

  return `You are an expert RPSC Senior Teacher (Grade II) Paper 1 question generator. Generate ${questionCount} high-quality RPSC-style India & World GK questions ${hasStudyMaterials ? `from the provided study materials for the topic: "${chapterName}"` : `using your comprehensive RPSC exam knowledge for: "${chapterName}"`}.

This is part of a ${totalQuestions}-question Paper 1 testing General Knowledge of India & the World.

${!hasStudyMaterials ? `
## CONTENT SOURCE

⚠️  **AI KNOWLEDGE MODE**: No study materials provided
- Generate questions using your training knowledge of RPSC Senior Teacher Grade II exam
- Cover Indian Polity, Geography, History, Economy, and International Relations
- Ensure questions reflect NCERT-level knowledge with advanced topics
- Maintain factual accuracy for all India & World GK content
` : ''}

---

## CRITICAL RPSC-SPECIFIC REQUIREMENTS

⚠️  **OPTION COUNT**: Each question MUST have exactly 4 options labeled (1), (2), (3), (4)
- NOT 5, NOT 3, EXACTLY 4 options

**EXAM CONTEXT**: Paper 1 - India & World GK Section (~30 questions)
- Tests knowledge of Indian Polity, Geography, History, Economy, International Relations
- All candidates must answer these questions
- NCERT-level knowledge with some advanced topics

**LANGUAGE**: ${isBilingual
  ? `BILINGUAL MODE - Generate questions in BOTH Hindi and English
- Hindi is PRIMARY (always required) - Use Devanagari script
- English is SECONDARY (for bilingual support)
- Both languages must convey the SAME meaning and difficulty
- Generate both languages in a SINGLE response

⚠️ CRITICAL BILINGUAL RULE - MUST FOLLOW ⚠️

Hindi fields (questionText, options) MUST NEVER contain English text in parentheses.

❌ ABSOLUTELY FORBIDDEN EXAMPLES:
   - "संविधान (Constitution)"
   - "लोकसभा (Lok Sabha)"
   - "राष्ट्रपति (President)"

✅ REQUIRED FORMAT:
   - questionText: "संविधान"
   - questionText_en: "Constitution"
   - options.A: "लोकसभा"
   - options_en.A: "Lok Sabha"

**Translation Guidelines**:
- Proper nouns: Transliterate correctly (भारत → India, संयुक्त राष्ट्र → United Nations)
- Constitutional terms: Use standard English equivalents
- Numbers/Dates: Keep identical in both languages
- Maintain factual accuracy in both languages
- Avoid literal translation - preserve meaning

**CRITICAL - Clean Language Separation**:
1. NEVER put English translations in parentheses after Hindi words
2. Keep each language pure and separate - use dedicated fields:
   - questionText = Pure Hindi only
   - questionText_en = Pure English only
   - options = Pure Hindi only
   - options_en = Pure English only

⚠️ MANDATORY POST-GENERATION VALIDATION ⚠️

BEFORE returning your JSON:
1. Search for "questionText" - Does it contain ANY English in (parentheses)? → DELETE them
2. Search for "options" - Does ANY option contain English in (parentheses)? → DELETE them`
  : `ALL questions MUST be in Hindi (हिंदी)
- Use Devanagari script for all questions and options`}

---

## SECTION OVERVIEW

**India & World GK (~30 questions out of 100 total)**

Content Domains:
- **Indian Polity/Constitution** (30%): Articles, amendments, constitutional bodies, provisions
- **Geography (India + World)** (25%): Physical features, climate, resources, world geography
- **History** (15%): Freedom movement, constitutional development, world history
- **Economy** (15%): Economic indicators, trade, FDI, schemes, banking
- **International Relations** (10%): Organizations, conferences, foreign policy
- **Current Affairs (India + World)** (5%): Recent major events, summits, agreements

---

## QUESTION ARCHETYPE DISTRIBUTION (Target Counts)

${archetypeList}

### Archetype Definitions:

**Multi-Statement Evaluation (MSQ) (${archetypeCounts.multiStatementEvaluation || 0} required):**
- **NEW DOMINANT FORMAT** - 4-5 statements labeled (a), (b), (c), (d), (e)
- Candidate evaluates truth of each statement
- Options present combinations: "(1) केवल (a) और (b)", "(2) केवल (a), (c) और (d)"
- **4x harder than standard MCQ** - requires evaluating multiple facts simultaneously
- Tests comprehensive domain knowledge across India & World GK
- Examples: "Which statements about Indian Constitution are correct?", "Identify correct statements about UN agencies"
- Cognitive load: HIGH - must verify 4-5 independent facts

**Match-the-Following (${archetypeCounts.matchTheFollowing || 0} required):**
- **ENHANCED FORMAT** - Match 4 items from List-I with List-II
- Occasionally 5 pairs for Grade 2 difficulty
- All-or-nothing scoring (entire pattern must be correct)
- **3x harder than standard MCQ**
- Pattern examples: Q47 (Match rights with articles), Q53 (Match parties with leaders)
- Format: A-ii, B-i, C-iii, D-iv (matching code in options)
- Types: Article-Subject, Country-Capital, Leader-Organization, Treaty-Year

**Arrange-in-Order (${archetypeCounts.arrangeInOrder || 0} required):**
- **ENHANCED FORMAT** - Arrange 4 items in correct sequence
- Occasionally 5 items for Grade 2 difficulty
- **3x harder than standard MCQ**
- Types: Chronological (oldest→newest), Numerical (ascending/descending - population, GDP, area), Spatial (west→east, north→south)
- Pattern: Q30 (continents by population), Q32 (plateaus west to east), Q40 (countries by trade balance)
- Examples: "Arrange Acts chronologically", "Arrange countries by HDI (low to high)"
- Options present different sequences: "(1) A-B-C-D", "(2) B-A-D-C"

**Single-Fact Recall (${archetypeCounts.singleFactRecall || 0} required):**
- **REDUCED EMPHASIS** (15% vs old 50%)
- Direct factual knowledge about India/World
- Examples: "Where is deepest point on earth?", "Which Article deals with X?"
- Requires memorization of specific facts
- Used for warm-up questions and factual anchors

**Exception/Negative (${archetypeCounts.exceptionNegative || 0} required):**
- **REDUCED EMPHASIS** (5% vs old 10%)
- Uses "NOT", "incorrect", "does NOT", "EXCEPT"
- Identify the FALSE statement
- Example: "Which of the following is NOT correct about monsoons?"

---

## CONTENT DOMAIN DETAILS

### INDIAN POLITY/CONSTITUTION (30%):

**Constitutional Articles:**
- Fundamental Rights: Articles 19-22 (Freedom, Life, Education, Trafficking)
- DPSP: Articles 40, 42A, 44, 49-52
- Union Government: Articles 74, 75, 77, 78 (President, PM, Ministers)
- State Government: Articles related to Governor, State Legislature
- Scheduled Areas: Article 5th, 6th Schedule provisions

**Constitutional Bodies:**
- Election Commission
- Public Service Commissions
- Finance Commission
- CAG

**Constitutional Development:**
- Government of India Acts: 1861, 1909, 1919, 1935, 1947
- Cabinet Mission Plan (1946)
- Constituent Assembly: Formation (June/August/November 1946), membership (299 reduced to 289)
- Important Committees: Union Powers Committee, Union Constitution Committee, Steering Committee
- Chairpersons: Sardar Patel, Jawaharlal Nehru, Dr. K.M. Munshi

**Fundamental Rights & Duties:**
- Right to Life (Article 21): Includes Right to Privacy, Right to Education
- Right to Education (Article 21-A)
- Right to Know (Article 19(1)(a))
- Trafficking Prohibition (Article 23)
- Freedom rights: Not literally including Freedom of Conscience (that's in Article 25)
- Fundamental Duties: Part IV-A, 11th duty added (2002)

**President:**
- Term: 5 years, resignation to Chief Justice
- Impeachment: Article 61
- Powers: Cannot resign to PM (only to CJ)

**Prime Minister:**
- Channel of communication: Article 78
- Council of Ministers: Collective Responsibility (Article 75(3)), Appointment (75(1)), Oath (75(5))

**DPSP Additions:**
- Equal justice and free legal aid (added by amendment)
- Promotion of co-operative society (97th Amendment)
- Right to work (not added, original)
- Separation of Judiciary: Article 50
- Uniform Civil Code: Article 44
- Participation of Workers: Article 43A (NOT 42A)
- Village Panchayat: Article 40

**International Peace:**
- Article 51 seeks to promote International Peace and Security

**Scheduled Areas:**
- President has power to declare scheduled areas (not Governor, not PM)

### GEOGRAPHY (INDIA + WORLD) (25%):

**World Geography:**
- Deepest continental point: Antarctica (Bentley Subglacial Trench)
- Planetary winds: Depend on pressure belts, rotation of earth, distribution of continents/oceans (NOT atmospheric humidity)
- Climate conferences: COP27 in Sharm-el-Sheikh, Egypt (2022)
- Continents by population (2020): Africa > Europe > North America > South America
- International migrants globally (2019): 272 million

**Indian Geography:**
- Plateaus west to east: Deccan → Dandakaranya → Chotanagpur → Meghalaya
- Monsoon system: El-nino appears May-June (correct), Easterly jet influences monsoon
- West-flowing rivers of Sahyadri: Mandovi, Sharavati, Bharatpujha (Indravati is EAST-flowing)
- Tropical Dry Evergreen forests: Tamil Nadu coast
- Westernmost Himalayan peak: Dhaulagiri (NOT Gauri Shankar, Makalu, Namcha Barua)
- Tributaries: Purna, Girna, Panjara are tributaries of Tapti (Tapi)
- Common trees: Tendu, Palas, Bel, Khair → Dry deciduous forests

**Energy & Resources:**
- Non-fossil fuel largest capacity: Wind Energy (not Solar/Nuclear/Hydro)
- Atomic Power Stations: Kaiga (Karnataka), Narora (UP), Kakrapar (Gujarat - NOT Maharashtra), Kalpakkam (TN)
- Idukki Hydel Power Project: Kerala

### HISTORY (15%):

**Freedom Movement:**
- Act of 1919: Introduced Direct Election (not Adult Suffrage/Federal Court/Provincial Autonomy)
- Government of India Act 1935: Upper chamber called "Council of State" (not Council of States/Federal Chamber/Chamber of Princes)
- Government of India Act 1935: Introduced Federation and Provincial Autonomy
- Government of India Act 1919: Indian Legislative Council had 50 members (not 75/100/150)
- Constituent Assembly: Formed August 1946 (per Cabinet Mission), reduced to 289 members after partition (from 299)
- Important Committees: Union Powers (Nehru chair), Union Constitution (Patel chair), Steering Committee (Munshi chair - INCORRECT if stated otherwise)

**Indian National Movement:**
- Afro-Asian Conference 1955: Bandung, Indonesia (NOT New Delhi/Belgrade/Colombo)
- Asian Relations Conference: Started 21st March 1947 (before independence)

**Preamble:**
- Elected President highlights: Republic feature (not Sovereign/Secular/Socialist)

**Soviet History:**
- Glasnost and Perestroika: Mikhail Gorbachev (not Brezhnev/Yeltsin/Putin)

### ECONOMY (15%):

**Economic Indicators:**
- Business Expectation Index (BEI): Published by Reserve Bank of India (not Ministry/FICCI/NITI Aayog)
- Largest FDI recipient sector: Services Sector (not Agriculture/Industrial/IT specifically)

**International Trade:**
- Economic Survey 2021-22: Most favourable trade balance with USA, Bangladesh & Nepal
- Import destinations (2021-22): China was top (not UAE/USA/Singapore)
- Top export destinations (April-Nov 2022): USA, UAE and Netherlands

**Schemes:**
- Operation Green Scheme: Launched November 2018, expanded from TOP (Tomato, Onion, Potato) to TOTAL (41 perishables), covers 41 perishables from 52 production clusters

**Global Rankings:**
- India's milk production rank: First (world's largest)
- India's FDI recipient rank 2021: Seventh (per UNCTAD World Investment Report 2022)
- Ease of Doing Business 2019: India ranked 63 (not 72/121/142)

**Globalization:**
- Term coined by: Theodore Levitt (not Peter Drucker/Alfred Marshall/Mary Parsley)

**Textile Industry:**
- Employs 4.5 crore people directly
- PM MITRA Parks approved for all states (Statement B about "all states" needs verification)

### INTERNATIONAL RELATIONS (10%):

**UN Positions:**
- First woman President of UNGA: Vijayalakshmi Pandit (correct)
- ECOSOC President: Chinmaya Rajaninath Gharekhan (correct)
- President of ICJ: Nagendra Singh (correct)
- First woman President of UNSC: Hansa Mehta (INCORRECT - she never held this position)

**Organizations:**
- Shanghai Co-operation Organisation: Iran joined as new member state (2021) - INCORRECT, Iran became member in 2023
- Indian Council for World Affairs: Established 1943

**Theories:**
- "Clash of Civilizations": Samuel P. Huntington (not Kissinger/Nye/Rosecrance)

**Political Parties Foundation Years:**
- AIADMK: 1972
- BJD: 1997
- INLD: 1999 (or 1996, verify)
- SP: 1992

**Trade Union Affiliations:**
- CPI: AITUC
- INC: INTUC
- BJP: HMS (Hind Mazdoor Sabha)
- All India Forward Bloc: TUCC (NOT TUCC necessarily - verify)

### CURRENT AFFAIRS (5%):

**Recent Events:**
- Climate Change Conference 2022: Sharm-el-Sheikh, Egypt
- Marginal Seas: Bering (Pacific), Baltic (Atlantic), Red (Indian), Okhotsk (Pacific - NOT Atlantic)
- World Ozone Day: 16th September (not 5 June/22 May/25 Dec)
- Population 2023 estimates by country

---

## STRUCTURAL FORMAT (REET 2026-Inspired - 4 Format Types)

**FORMAT 1: STANDARD 4-OPTION MCQ (17% of questions):**
\`\`\`
प्रश्न का हिंदी पाठ यहां?
(1) पहला विकल्प
(2) दूसरा विकल्प
(3) तीसरा विकल्प
(4) चौथा विकल्प
\`\`\`
Example: भारत में व्यवसाय प्रत्याशा सूचकांक (BEI) कौन सा संगठन प्रकाशित करता है? (1) वाणिज्य मंत्रालय (2) RBI (3) FICCI (4) नीति आयोग

**FORMAT 2: MULTI-STATEMENT EVALUATION (MSQ) (40% of questions - DOMINANT):**
\`\`\`
भारतीय संविधान के बारे में निम्नलिखित कथनों पर विचार कीजिए:
(a) अनुच्छेद 21 में निजता का अधिकार शामिल है
(b) अनुच्छेद 21-A शिक्षा का अधिकार प्रदान करता है
(c) मूल संविधान में 11 मूल कर्तव्य थे
(d) अनुच्छेद 19(1)(a) में जानने का अधिकार शामिल है
उपरोक्त में से कौन से कथन सही हैं?
(1) केवल (a) और (b)
(2) केवल (a), (b) और (d)
(3) केवल (b) और (c)
(4) केवल (a), (c) और (d)
\`\`\`
**MSQ GENERATION RULES:**
- Present 4-5 statements (use 5 for hard difficulty)
- Each statement must be independently verifiable
- Options show different combinations of true statements
- ALL options must be grammatically parallel: "केवल (a) और (b)" format
- Ensure only ONE option contains the correct combination

**FORMAT 3: MATCH-THE-FOLLOWING (20% of questions):**
\`\`\`
सूची-I को सूची-II से सुमेलित कीजिए:
सूची-I (अधिकार)         सूची-II (अनुच्छेद)
A. निजता का अधिकार        i. अनुच्छेद 23
B. शिक्षा का अधिकार       ii. अनुच्छेद 21-A
C. जानने का अधिकार        iii. अनुच्छेद 21
D. तस्करी का निषेध       iv. अनुच्छेद 19(1)(a)
सही विकल्प चुनिए:
(1) A-i, B-ii, C-iii, D-iv
(2) A-iii, B-ii, C-iv, D-i
(3) A-iv, B-ii, C-iii, D-i
(4) A-i, B-iii, C-ii, D-iv
\`\`\`
**MATCHING GENERATION RULES:**
- Use 4 pairs (occasionally 5 for hard difficulty)
- Ensure all pairings are factually accurate
- Create plausible distractor options by mixing correct pairings
- All-or-nothing: entire pattern must match correctly

**FORMAT 4: ARRANGE-IN-ORDER (23% of questions):**
\`\`\`
निम्नलिखित महाद्वीपों को जनसंख्या के अवरोही क्रम (सर्वाधिक से न्यूनतम) में व्यवस्थित कीजिए:
A. अफ्रीका
B. यूरोप
C. उत्तरी अमेरिका
D. दक्षिण अमेरिका
सही क्रम चुनिए:
(1) A-B-C-D
(2) A-C-D-B
(3) A-C-B-D
(4) C-A-B-D
\`\`\`
**ARRANGE GENERATION RULES:**
- Use 4 items (occasionally 5 for hard difficulty)
- Types: Chronological, Numerical (ascending/descending), Spatial (west→east, north→south)
- Ensure items have clear ordering criteria
- Create distractor sequences with partial correctness

---

## FROZEN PROHIBITIONS

### NEVER include in options:
- ❌ "उपरोक्त सभी" (All of the above)
- ❌ "इनमें से कोई नहीं" (None of the above)
- ❌ Duplicate options
- ❌ Outdated constitutional information

### NEVER use in question stems:
- ❌ Controversial political interpretations
- ❌ Ambiguous constitutional questions with multiple valid answers
- ❌ Outdated data (use latest census, economic data)

### FORMAT RULES:
- ✅ MUST use exactly 4 options (1), (2), (3), (4)
- ✅ ALL content in Hindi
- ✅ Must be factually accurate

### EXPLANATION REQUIREMENTS:
- ✅ Explain correct answer with factual basis
- ✅ Explain why incorrect options are wrong
- ✅ Cite article numbers/years/data sources where relevant
- ❌ NO meta-commentary

---

## MANDATORY SELF-VALIDATION CHECKLIST

**YOU MUST MENTALLY VERIFY EACH ITEM BEFORE GENERATING EACH QUESTION:**

### Data Integrity Validation (CRITICAL):
1. ✓ questionNumber is a positive integer (not null, not undefined, not 0)
2. ✓ questionText is a non-empty string with minimum 10 characters (not null, not undefined, not "")
3. ✓ options object exists and is not null/undefined
4. ✓ options has EXACTLY 4 keys: "1", "2", "3", "4" (not A/B/C/D, not 0-indexed)
5. ✓ options["1"] is a non-empty string with minimum 2 characters
6. ✓ options["2"] is a non-empty string with minimum 2 characters
7. ✓ options["3"] is a non-empty string with minimum 2 characters
8. ✓ options["4"] is a non-empty string with minimum 2 characters
9. ✓ correctAnswer is one of "1", "2", "3", "4" (string format, not number)
10. ✓ explanation is a non-empty string with minimum 20 characters (not null, not undefined)

### Content Quality Validation:
11. ✓ All 4 options are textually DIFFERENT (no duplicates)
12. ✓ No option contains "उपरोक्त सभी" or "All of the above"
13. ✓ No option contains "इनमें से कोई नहीं" or "None of the above"
14. ✓ questionText uses proper Hindi Devanagari script
15. ✓ All options use proper Hindi Devanagari script
16. ✓ Factual accuracy verified (no outdated data)
17. ✓ archetype matches the question type actually generated
18. ✓ structuralForm matches the format actually used
19. ✓ cognitiveLoad is appropriate for question complexity
20. ✓ difficulty is set correctly

### Bilingual Validation (if isBilingual=true):
21. ✓ questionText_en exists and is non-empty (if bilingual mode)
22. ✓ options_en object exists with all 4 keys (if bilingual mode)
23. ✓ explanation_en exists and is non-empty (if bilingual mode)
24. ✓ Hindi fields contain NO English words in parentheses
25. ✓ English fields contain NO Hindi words in parentheses

### Format-Specific Validation:
26. ✓ MSQ: Statements labeled (a), (b), (c), (d) with correct combination options
27. ✓ Match: List-I and List-II clearly presented with matching codes in options
28. ✓ Arrange: Items labeled A, B, C, D with sequence codes in options
29. ✓ Archetype is ONLY one of the 5 allowed values (multiStatementEvaluation, matchTheFollowing, arrangeInOrder, singleFactRecall, exceptionNegative)
30. ✓ Archetype is NOT one of forbidden values (assertionReason, comparative, statementValidation, matching, sequencing)

---

## VALIDATION CHECKLIST

Before finalizing questions, verify:
✓ **Polity**: Article numbers are correct, provisions are accurate
✓ **Geography**: Physical features, locations are accurate
✓ **History**: Dates, events, personalities are correct
✓ **Economy**: Latest data, rankings are current
✓ **International**: Organization memberships, positions are accurate
✓ **NO Controversial Politics**: Stick to factual, non-partisan content

---

## OPTION CONSTRUCTION RULES

- All 4 options must be plausible
- For Article questions: Use actual article numbers
- For geography: Use actual locations/features
- For history: Use actual dates/events/persons
- For economy: Use realistic numbers/rankings
- Make distractors plausible but clearly wrong upon verification

---

## ANSWER KEY BALANCE

- Distribute correct answers evenly across (1), (2), (3), (4)
- Avoid streaks of same answer

---

## COGNITIVE LOAD

- **Easy**: NCERT-level basic facts
- **Balanced**: Specific articles, moderate geography, basic economy
- **Hard**: Obscure constitutional provisions, complex statement validation, detailed rankings

---

## OUTPUT FORMAT (JSON Schema with Type Annotations)

${isBilingual
  ? `**BILINGUAL FORMAT** (Generate both Hindi and English):

⚠️ **TYPE REQUIREMENTS - READ CAREFULLY**:
- questionNumber: number (integer, positive, NOT null/undefined)
- questionText: string (non-empty, min 10 chars, NOT null/undefined)
- questionText_en: string (non-empty, min 10 chars, NOT null/undefined)
- archetype: string (one of the specified values, NOT null)
- structuralForm: string (one of the specified values, NOT null)
- cognitiveLoad: string ("low" | "medium" | "high", NOT null)
- correctAnswer: string ("1" | "2" | "3" | "4", NOT null, NOT number type)
- options: object (MUST have exactly 4 keys: "1", "2", "3", "4", NOT null)
- options["1"]: string (non-empty, min 2 chars, NOT null/undefined)
- options["2"]: string (non-empty, min 2 chars, NOT null/undefined)
- options["3"]: string (non-empty, min 2 chars, NOT null/undefined)
- options["4"]: string (non-empty, min 2 chars, NOT null/undefined)
- options_en: object (MUST have exactly 4 keys: "1", "2", "3", "4", NOT null)
- options_en["1"]: string (non-empty, min 2 chars, NOT null/undefined)
- options_en["2"]: string (non-empty, min 2 chars, NOT null/undefined)
- options_en["3"]: string (non-empty, min 2 chars, NOT null/undefined)
- options_en["4"]: string (non-empty, min 2 chars, NOT null/undefined)
- explanation: string (non-empty, min 20 chars, NOT null/undefined)
- explanation_en: string (non-empty, min 20 chars, NOT null/undefined)
- difficulty: string ("easy" | "medium" | "hard", NOT null)
- language: string ("bilingual", NOT null)
- contentDomain: string (one of the specified values, NOT null)

\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "प्रश्न का हिंदी पाठ यहां",
      "questionText_en": "Full question text in English",
      "archetype": "multiStatementEvaluation" | "matchTheFollowing" | "arrangeInOrder" | "singleFactRecall" | "exceptionNegative",  // ONLY these 5 values allowed - NO OTHER archetypes
      "structuralForm": "multipleSelectQuestions" | "matchTheFollowing" | "arrangeInOrder" | "standard4OptionMCQ",  // ONLY these 4 values allowed
      "cognitiveLoad": "low" | "medium" | "high",
      "correctAnswer": "1" | "2" | "3" | "4",
      "options": {
        "1": "विकल्प 1",
        "2": "विकल्प 2",
        "3": "विकल्प 3",
        "4": "विकल्प 4"
      },
      "options_en": {
        "1": "Option 1 in English",
        "2": "Option 2 in English",
        "3": "Option 3 in English",
        "4": "Option 4 in English"
      },
      "explanation": "व्याख्या",
      "explanation_en": "Explanation in English - explain with factual basis",
      "difficulty": "easy" | "medium" | "hard",
      "language": "bilingual",
      "contentDomain": "polity" | "geography" | "history" | "economy" | "internationalRelations" | "currentAffairs"
    }
  ]
}
\`\`\``
  : `**MONOLINGUAL FORMAT** (Hindi only):

⚠️ **TYPE REQUIREMENTS - READ CAREFULLY**:
- questionNumber: number (integer, positive, NOT null/undefined)
- questionText: string (non-empty, min 10 chars, NOT null/undefined)
- archetype: string (one of the specified values, NOT null)
- structuralForm: string (one of the specified values, NOT null)
- cognitiveLoad: string ("low" | "medium" | "high", NOT null)
- correctAnswer: string ("1" | "2" | "3" | "4", NOT null, NOT number type)
- options: object (MUST have exactly 4 keys: "1", "2", "3", "4", NOT null)
- options["1"]: string (non-empty, min 2 chars, NOT null/undefined)
- options["2"]: string (non-empty, min 2 chars, NOT null/undefined)
- options["3"]: string (non-empty, min 2 chars, NOT null/undefined)
- options["4"]: string (non-empty, min 2 chars, NOT null/undefined)
- explanation: string (non-empty, min 20 chars, NOT null/undefined)
- difficulty: string ("easy" | "medium" | "hard", NOT null)
- language: string ("hindi", NOT null)
- contentDomain: string (one of the specified values, NOT null)

\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "प्रश्न का हिंदी पाठ यहां",
      "archetype": "multiStatementEvaluation" | "matchTheFollowing" | "arrangeInOrder" | "singleFactRecall" | "exceptionNegative",  // ONLY these 5 values allowed - NO OTHER archetypes
      "structuralForm": "multipleSelectQuestions" | "matchTheFollowing" | "arrangeInOrder" | "standard4OptionMCQ",  // ONLY these 4 values allowed
      "cognitiveLoad": "low" | "medium" | "high",
      "correctAnswer": "1" | "2" | "3" | "4",
      "options": {
        "1": "विकल्प 1",
        "2": "विकल्प 2",
        "3": "विकल्प 3",
        "4": "विकल्प 4"
      },
      "explanation": "व्याख्या - explain with factual basis, cite sources if relevant",
      "difficulty": "easy" | "medium" | "hard",
      "language": "hindi",
      "contentDomain": "polity" | "geography" | "history" | "economy" | "internationalRelations" | "currentAffairs"
    }
  ]
}
\`\`\``}

---

## PRE-RETURN VALIDATION PROCEDURE (MANDATORY)

⚠️ **BEFORE RETURNING YOUR JSON OUTPUT, YOU MUST COMPLETE THIS 5-STEP VALIDATION**:

**STEP 1: NULL/UNDEFINED CHECK**
- Scan your entire JSON output for the word "null" - Count: ___
- If count > 0: STOP, identify which field is null, FIX IT with a valid value
- Scan for "undefined" - Count: ___
- If count > 0: STOP, FIX IT immediately

**STEP 2: EMPTY STRING CHECK**
- Check each questionText - Is it empty or less than 10 characters? YES/NO: ___
- If YES: STOP, write a proper question (minimum 10 characters)
- Check each option["1"], ["2"], ["3"], ["4"] - Any empty or less than 2 characters? YES/NO: ___
- If YES: STOP, write proper option text
- Check each explanation - Is it empty or less than 20 characters? YES/NO: ___
- If YES: STOP, write detailed explanation

**STEP 3: OPTION COUNT VERIFICATION**
- Count option keys in each question - Expected: 4, Actual: ___
- Are all keys exactly "1", "2", "3", "4"? YES/NO: ___
- If NO: STOP, fix the option keys

**STEP 4: CORRECTANSWER VALIDATION**
- Check each correctAnswer value - Is it one of "1", "2", "3", "4" (string)? YES/NO: ___
- If NO: STOP, fix the correctAnswer (must be string "1", "2", "3", or "4")

**STEP 5: DUPLICATE OPTIONS CHECK**
- For each question, compare all 4 options - Are they all textually different? YES/NO: ___
- If NO: STOP, rewrite duplicate options to be unique

**STEP 6: ARCHETYPE VALIDATION**
- Scan all questions: Does each archetype use ONLY allowed values? YES/NO: ___
- Allowed: multiStatementEvaluation, matchTheFollowing, arrangeInOrder, singleFactRecall, exceptionNegative
- FORBIDDEN: assertionReason, comparative, statementValidation, matching, sequencing
- If ANY question uses forbidden archetype: STOP and FIX before returning
- Check structural form matches archetype correctly: YES/NO: ___

**VALIDATION COMPLETE**: Only proceed to return JSON if ALL checks passed.

---

## FINAL INSTRUCTIONS

Generate ${questionCount} questions now following ALL rules above.

⚠️  **CRITICAL**:
- Use EXACTLY 4 options per question
- Label options as (1), (2), (3), (4)
- Verify all factual information
- Use latest data (Census, economic rankings, etc.)
- NO controversial political content
${hasStudyMaterials ? '- Extract content from study materials but verify facts' : '- Generate authentic RPSC-quality questions from your training knowledge'}
${isBilingual
  ? `- Generate BOTH Hindi and English in SINGLE response
- Include questionText + questionText_en, options + options_en, explanation + explanation_en
- Set "language": "bilingual" in each question
- Ensure both languages convey identical meaning`
  : `- ALL content in Hindi
- Set "language": "hindi" in each question`}
- Return ONLY valid JSON

**QUALITY VERIFICATION**:
✓ All 4 options are unique
✓ All facts are accurate and current
✓ Article numbers are correct
✓ Geographic information is accurate
✓ Historical dates/events are correct
✓ No "उपरोक्त सभी" or "इनमें से कोई नहीं"
✓ Options labeled as (1), (2), (3), (4)

Return the JSON now:`
}

/**
 * Validators
 */
import {
  validateProhibitedPatterns,
  validateAnswerKeyBalance,
  validateCognitiveLoad
} from '../../../../questionValidator'

const validators: Protocol['validators'] = [
  (questions: Question[]) => {
    const errors: string[] = []

    // Validate 4-option format
    for (const q of questions) {
      const optionKeys = Object.keys(q.options)
      if (optionKeys.length !== 4) {
        errors.push(`Question ${q.questionNumber}: Must have exactly 4 options`)
      }
      if (!optionKeys.every(k => ['1', '2', '3', '4', 'A', 'B', 'C', 'D'].includes(k))) {
        errors.push(`Question ${q.questionNumber}: Options must be labeled 1,2,3,4`)
      }
    }

    // Standard prohibitions
    for (const q of questions) {
      errors.push(...validateProhibitedPatterns(q))
    }

    return errors
  },
  validateAnswerKeyBalance,
  validateCognitiveLoad
]

/**
 * Complete India & World GK Protocol
 */
export const rpscSeniorTeacherPaper1IndiaWorldGKProtocol: Protocol = {
  id: 'rpsc-senior-teacher-paper1-india-world-gk',
  name: 'RPSC Senior Teacher Grade II - Paper 1: India & World GK',
  streamName: 'RPSC Senior Teacher Grade II',
  subjectName: 'Paper 1 - India & World General Knowledge',
  difficultyMappings,
  prohibitions,
  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,
    warmupPercentage: 0.10
  },
  buildPrompt: buildIndiaWorldGKPrompt,
  validators,
  metadata: {
    description: 'RPSC Senior Teacher Grade II Paper 1: India & World GK protocol - REET 2026-inspired with 4 structural formats',
    analysisSource: 'Based on REET 2026 analysis + Enhanced for Grade 2 senior position',
    version: '2.0.0',
    lastUpdated: '2025-01-18',
    examType: 'SELECTION (Merit-based) - Common Paper 1 Section',
    sectionWeightage: '~30 questions out of 100 total in Paper 1',
    note: `REET 2026-INSPIRED PROTOCOL (Grade 2 MORE difficult than REET):

**NEW STRUCTURAL DISTRIBUTION (~30 questions):**
  - Standard MCQ: 17% (5Q) - REDUCED from 100%
  - Multi-Statement Evaluation (MSQ): 40% (12Q) - NEW DOMINANT (4x difficulty)
  - Match-the-Following: 20% (6Q) - NEW (3x difficulty)
  - Arrange-in-Order: 23% (7Q) - ENHANCED from 15% (3x difficulty)

**ARCHETYPE TRANSFORMATION (Balanced Difficulty):**
  - Single-Fact Recall: 15% (was 50% - DRASTICALLY REDUCED)
  - Multi-Statement Evaluation: 40% (NEW - DOMINANT)
  - Arrange-in-Order: 20% (was 15%)
  - Match-the-Following: 20% (was 10%)
  - Exception/Negative: 5% (was 10%)
  - Statement Validation: REMOVED (was 15%)

**COGNITIVE LOAD TARGET:**
  - Low-Density: 10% (was 40% - REDUCED)
  - Medium-Density: 30% (was 50%)
  - High-Density: 60% (was 10% - MASSIVELY INCREASED)

**DIFFICULTY MULTIPLIER:** 4-6x (higher than REET's 3-5x)

**Content Distribution (Unchanged):**
  - Indian Polity/Constitution: ~30%
  - Geography (India + World): ~25%
  - History: ~15%
  - Economy: ~15%
  - International Relations: ~10%
  - Current Affairs: ~5%

**Quality Characteristics:**
  - Factual accuracy is CRITICAL
  - Requires NCERT + advanced knowledge
  - Constitutional provisions must be exact
  - Latest data required for economy/demographics
  - All questions in Hindi
  - Senior position demands higher complexity than REET Grade 3`
  }
}
