/**
 * RPSC Senior Teacher (Grade II) - Paper 1: Rajasthan GK Protocol
 *
 * UPDATED: REET 2026-Inspired Protocol (Grade 2 MORE difficult than REET Grade 3)
 * Section: Geographical, Historical, Cultural & General Knowledge of Rajasthan
 * Question Count: ~40 questions per paper
 *
 * EXAM CONTEXT:
 * - Common Paper 1 for ALL RPSC Senior Teacher Grade II candidates
 * - Total Paper 1: 100 questions (Rajasthan GK + Current Affairs + India GK + Ed Psychology)
 * - All questions in Hindi (primary language)
 *
 * NEW STRUCTURAL DISTRIBUTION (2026 Pattern):
 * - Standard MCQ: 20% (REDUCED from 100%)
 * - Multi-Statement Evaluation (MSQ): 40% (NEW DOMINANT - most difficult)
 * - Match-the-Following: 20% (NEW)
 * - Arrange-in-Order: 15% (NEW)
 * - Assertion-Reason: 5% (NEW)
 *
 * DIFFICULTY: 4-6x multiplier (higher than REET's 3-5x)
 * HIGH COGNITIVE LOAD: 50-60% (senior position demands)
 */

import { Protocol, ProtocolConfig } from '../../../types'
import { Question } from '../../../../questionValidator'
import type { ChapterKnowledge } from '../../../../types/chapterKnowledge'

/**
 * Rajasthan GK Archetype Distributions
 * Difficulty: 20% Easy, 50% Balanced, 30% Hard
 */

const rajasthanGKArchetypes = {
  easy: {
    singleFactRecall: 0.45,           // REDUCED from 0.70 - still primary but balanced
    multiStatementEvaluation: 0.30,   // INCREASED from 0.15 - more MSQ practice
    matchTheFollowing: 0.15,          // NEW - basic matching practice
    arrangeInOrder: 0.05,             // NEW - minimal sequencing
    comparative: 0.05                 // REDUCED from 0.15 - minimal comparison
  },
  balanced: {
    singleFactRecall: 0.15,        // ADJUSTED - 15% (reduced from 20% to match MCQ structural form)
    multiStatementEvaluation: 0.35,// MAINTAINED - 35% MSQ format
    matchTheFollowing: 0.20,       // MAINTAINED - 20%
    arrangeInOrder: 0.15,          // MAINTAINED - 15%
    assertionReason: 0.15          // INCREASED - 15% (up from 2% - major boost for conceptual reasoning)
  },
  hard: {
    multiStatementEvaluation: 0.45,// NEW DOMINANT - Complex MSQ
    matchTheFollowing: 0.25,       // Complex matching
    arrangeInOrder: 0.20,          // Detailed sequencing
    exceptionNegative: 0.05,       // Reduced emphasis
    assertionReason: 0.05          // Complex A-R questions
  }
}

/**
 * Structural Forms - SEPARATED BY DIFFICULTY
 * REET 2026-inspired format distribution - Grade 2 MORE difficult than REET
 * Each difficulty level has its own structural form distribution
 */
const structuralForms = {
  easy: {
    standard4OptionMCQ: 0.50,       // More MCQ for easy level
    multipleSelectQuestions: 0.30,  // Moderate MSQ
    matchTheFollowing: 0.15,        // Light matching
    arrangeInOrder: 0.05,           // Minimal arrange
    assertionReason: 0              // No A-R (too complex for easy)
  },
  balanced: {
    standard4OptionMCQ: 0.15,       // ADJUSTED - 15% MCQ (reduced from 20%)
    multipleSelectQuestions: 0.35,  // ADJUSTED - 35% MSQ (reduced from 40%)
    matchTheFollowing: 0.20,        // MAINTAINED - 20% Match
    arrangeInOrder: 0.15,           // MAINTAINED - 15% Arrange
    assertionReason: 0.15           // INCREASED - 15% A-R (up from 5% - tests conceptual reasoning)
  },
  hard: {
    standard4OptionMCQ: 0.10,       // Minimal MCQ for hard
    multipleSelectQuestions: 0.50,  // Maximum MSQ (hardest format)
    matchTheFollowing: 0.20,        // Same as balanced
    arrangeInOrder: 0.15,           // Same as balanced
    assertionReason: 0.05           // Same as balanced
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
    highDensity: 0.70    // INCREASED from 0.30 - maximum difficulty
  }
}

/**
 * Difficulty Mappings - NOW WITH SEPARATE STRUCTURAL FORMS PER DIFFICULTY
 */
const difficultyMappings: Protocol['difficultyMappings'] = {
  easy: {
    archetypes: rajasthanGKArchetypes.easy as any,
    structuralForms: structuralForms.easy as any,      // FIXED: Use easy structural forms
    cognitiveLoad: cognitiveLoad.easy
  },
  balanced: {
    archetypes: rajasthanGKArchetypes.balanced as any,
    structuralForms: structuralForms.balanced as any,  // FIXED: Use balanced structural forms
    cognitiveLoad: cognitiveLoad.balanced
  },
  hard: {
    archetypes: rajasthanGKArchetypes.hard as any,
    structuralForms: structuralForms.hard as any,      // FIXED: Use hard structural forms
    cognitiveLoad: cognitiveLoad.hard
  }
}

/**
 * Prohibitions
 */
const prohibitions: string[] = [
  'NEVER use "All of the above" or "None of the above" (0% observed)',
  'NEVER use 5 options - MUST use exactly 4 options (A, B, C, D)',
  'NEVER use duplicate options - all 4 must be textually unique',
  'NEVER use same person with different name formats (full name vs initials)',
  'NEVER use outdated facts - verify current administrative divisions',
  'NEVER use inaccurate Rajasthan facts - factual accuracy is CRITICAL',
  'DUPLICATE OPTIONS FORBIDDEN - All 4 options must be completely different',

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

  // ARCHETYPE DISTRIBUTION ENFORCEMENT (CRITICAL - MANDATORY COMPLIANCE):
  '🔴 ARCHETYPE COUNTS ARE MANDATORY - NOT SUGGESTIONS: You MUST generate EXACTLY the specified counts for each archetype',
  '🔴 ASSERTION-REASON MINIMUM ENFORCED: If protocol specifies N Assertion-Reason questions, generate AT LEAST N questions - DO NOT under-generate this format',
  '🔴 MSQ (Multi-Statement) MINIMUM ENFORCED: If protocol specifies N MSQ questions, generate AT LEAST N questions - This is the DOMINANT format',
  '🔴 MATCH-THE-FOLLOWING MINIMUM ENFORCED: If protocol specifies N Match questions, generate AT LEAST N questions',
  '🔴 ARRANGE-IN-ORDER MINIMUM ENFORCED: If protocol specifies N Arrange questions, generate AT LEAST N questions',
  '🔴 DO NOT over-generate Single-Fact Recall at expense of complex formats - respect the percentages strictly',
  '🔴 BEFORE RETURNING: Count each archetype - if ANY archetype falls short of target by 2+, REGENERATE those missing questions',

  // QUALITY PATTERN PROHIBITIONS (CRITICAL - Zero Tolerance):
  '❌ MSQ "ALL CORRECT" ABSOLUTELY BANNED: NEVER EVER make MSQ questions where all statements (a,b,c,d) are correct - ZERO TOLERANCE - Not even 1 question',
  '❌ SEQUENTIAL MATCHING ABSOLUTELY BANNED: NEVER EVER make Match-the-Following with A-i, B-ii, C-iii, D-iv as correct answer - ZERO TOLERANCE - Not even 1 question',
  '❌ SEQUENTIAL ORDERING ABSOLUTELY BANNED: NEVER EVER make Arrange-in-Order with A-B-C-D as correct answer - ZERO TOLERANCE - Not even 1 question',
  '❌ A-R OPTION 1 DOMINANCE FORBIDDEN: NEVER make more than 60% of Assertion-Reason questions have option (1) - Distribute across all 4 options',
  '❌ SIMPLISTIC QUESTIONS BANNED: NEVER make trivial questions that any layperson could answer without Rajasthan knowledge',
  'EVERY MSQ MUST have mix of true/false statements requiring discrimination - create realistic false statements',
  'EVERY Match MUST have scrambled pattern (e.g., A-iii, B-i, C-iv, D-ii) - minimum 2 items crossed',
  'EVERY Arrange MUST scramble item order (e.g., B-D-A-C, D-A-C-B) - present items in random/shuffled order, NOT natural sequence',
  'PROFESSIONAL-GRADE QUESTIONS REQUIRED: Specific facts, dates, numbers, nuanced distinctions - NOT obvious/generic questions'
]

/**
 * Calculate archetype counts based on difficulty
 */
function getArchetypeCounts(
  difficulty: 'easy' | 'balanced' | 'hard',
  questionCount: number
): Record<string, number> {
  const archetypes = rajasthanGKArchetypes[difficulty]
  const counts: Record<string, number> = {}

  for (const [key, value] of Object.entries(archetypes)) {
    counts[key] = Math.round(questionCount * value)
  }

  return counts
}

/**
 * Rajasthan GK Prompt Builder
 */
function buildRajasthanGKPrompt(
  config: ProtocolConfig,
  chapterName: string,
  questionCount: number,
  totalQuestions: number,
  isBilingual: boolean = false,
  hasStudyMaterials: boolean = true
): string {
  const difficulty = 'balanced' // Default
  const archetypeCounts = getArchetypeCounts(difficulty, questionCount)

  const archetypeList = Object.entries(archetypeCounts)
    .filter(([_, count]) => count > 0)
    .map(([archetype, count]) => `- **${count} ${archetype}**`)
    .join('\n')

  return `You are an expert RPSC Senior Teacher (Grade II) Paper 1 question generator. Generate ${questionCount} high-quality RPSC-style questions ${hasStudyMaterials ? `from the provided study materials for the topic: "${chapterName}"` : `using your comprehensive RPSC exam knowledge for: "${chapterName}"`}.

This is part of a ${totalQuestions}-question Paper 1 testing Geographical, Historical, Cultural & General Knowledge of Rajasthan.

${!hasStudyMaterials ? `
## CONTENT SOURCE

⚠️  **AI KNOWLEDGE MODE**: No study materials provided
- Generate questions using your training knowledge of RPSC Senior Teacher Grade II exam
- Ensure all questions reflect authentic RPSC exam patterns and difficulty
- Draw from comprehensive Rajasthan GK syllabus coverage
- Maintain factual accuracy for all Rajasthan-specific content
` : ''}

${hasStudyMaterials ? `
## CONTENT SOURCE

⚠️ **STRICT MATERIAL ADHERENCE**: Study materials provided ARE the source of truth
- ONLY generate questions from facts, examples, and terminology explicitly present in the uploaded materials
- DO NOT use external knowledge or facts not covered in the materials
- DO NOT invent examples or details beyond what is provided
- If materials cover limited topics, generate questions ONLY from those covered topics
- Factual accuracy must match the materials exactly - DO NOT correct or supplement material content
` : ''}

---

## CRITICAL RPSC-SPECIFIC REQUIREMENTS

⚠️  **OPTION COUNT**: Each question MUST have exactly 4 options labeled (1), (2), (3), (4)
- NOT 5, NOT 3, EXACTLY 4 options - RPSC uses 4-option MCQ format

**EXAM CONTEXT**: Paper 1 (Common for ALL Senior Teacher Grade II candidates)
- Every candidate takes Paper 1 regardless of subject specialization
- Tests comprehensive knowledge of Rajasthan geography, history, culture

**⚠️ CRITICAL QUALITY STANDARDS - READ CAREFULLY:**
This is a COMPETITIVE GOVERNMENT EXAM for SENIOR TEACHER positions. Questions MUST be:
- **Academically rigorous** - test deep knowledge, not surface-level facts
- **Professionally appropriate** - suitable for evaluating experienced educators
- **Discriminating** - separate strong candidates from weak ones
- **Complex enough** to challenge senior-level candidates
- **NOT simplistic** - avoid obvious/trivial questions that insult candidate intelligence
- **NOT generic** - use specific Rajasthan facts, not general knowledge anyone could guess

**FORBIDDEN QUALITY FAILURES:**
❌ Overly simple questions that any layperson could answer
❌ Generic questions without Rajasthan-specific depth
❌ Questions with obvious answers that don't test real knowledge
❌ Lazy statement combinations that are all obviously true/false
❌ Predictable matching patterns that require no thinking
❌ Surface-level recall when deeper analysis is possible

**REQUIRED QUALITY MARKERS:**
✅ Specific details (dates, names, places, numbers) from Rajasthan context
✅ Nuanced distinctions requiring careful study
✅ Integration of multiple knowledge domains
✅ Critical thinking and analytical reasoning
✅ Professional-grade difficulty appropriate for senior educators

**LANGUAGE**: ${isBilingual
  ? `BILINGUAL MODE - Generate questions in BOTH Hindi and English
- Hindi is PRIMARY (always required) - Use Devanagari script
- English is SECONDARY (for bilingual support)
- Both languages must convey the SAME meaning and difficulty
- Generate both languages in a SINGLE response

⚠️ CRITICAL BILINGUAL RULE - MUST FOLLOW ⚠️

Hindi fields (questionText, options) MUST NEVER contain English text in parentheses.

❌ ABSOLUTELY FORBIDDEN EXAMPLES:
   - "जैसलमेर (Jaisalmer)"
   - "मृत्युदंड (Death Sentence) के मामले में..."
   - "राजस्थान की राजधानी (Capital of Rajasthan)"

✅ REQUIRED FORMAT:
   - questionText: "जैसलमेर"
   - questionText_en: "Jaisalmer"
   - options.A: "मृत्युदंड"
   - options_en.A: "Death Sentence"

**Translation Guidelines**:
- Proper nouns: Transliterate correctly (जैसलमेर → Jaisalmer, महाराणा प्रताप → Maharana Pratap)
- Technical terms: Use standard English equivalents
- Cultural terms: Transliterate with context preservation
- Numbers/Dates: Keep identical in both languages
- Do NOT translate names of places, people, schemes - transliterate only
- Maintain factual accuracy and question difficulty in both languages
- Avoid literal word-by-word translation - preserve meaning and context

**CRITICAL - Clean Language Separation**:
1. NEVER put English translations in parentheses after Hindi words
2. NEVER put Hindi/Sanskrit transliterations in parentheses after English words
3. Keep each language pure and separate - use the dedicated fields:
   - questionText = Pure Hindi only
   - questionText_en = Pure English only
   - options = Pure Hindi only
   - options_en = Pure English only

⚠️ MANDATORY POST-GENERATION VALIDATION ⚠️

BEFORE returning your JSON:
1. Search for "questionText" - Does it contain ANY English words in (parentheses)? → DELETE them
2. Search for "options" - Does ANY option contain English in (parentheses)? → DELETE them
3. Examples of fixes:
   - FIND: "मृत्युदंड (Death Sentence)" → FIX TO: "मृत्युदंड"
   - FIND: "राजस्थान की राजधानी (Capital)" → FIX TO: "राजस्थान की राजधानी"`
  : `ALL questions MUST be in Hindi (हिंदी)
- Use Devanagari script for all questions and options
- Primary language for RPSC exam in Rajasthan is Hindi`}

---

## SECTION OVERVIEW

**Rajasthan GK Section (~40 questions out of 100 total in Paper 1)**

Content Domains:
- **Geography** (25%): Districts, rivers, lakes, soil, climate, forests, tourism circuits
- **History** (25%): Rulers, dynasties, battles, archaeological sites, inscriptions, freedom movement
- **Culture** (20%): Festivals, folk arts, music, dance, paintings, literature, ornaments, architecture
- **Administrative/Political** (20%): Government structure, commissions, universities, policies, panchayati raj
- **Demographics** (10%): Literacy, population, sex ratio, census data, industries

---

## QUESTION ARCHETYPE DISTRIBUTION (Target Counts)

${archetypeList}

### Archetype Definitions:

**Multi-Statement Evaluation (MSQ) (${archetypeCounts.multiStatementEvaluation || 0} required):**
- **NEW DOMINANT FORMAT** - 4-5 statements labeled (a), (b), (c), (d), (e)
- Candidate evaluates truth of each statement
- Options present combinations: "(1) केवल (a) और (b)", "(2) केवल (a), (c) और (d)"
- **4x harder than standard MCQ** - requires evaluating multiple facts simultaneously
- Tests comprehensive domain knowledge
- Examples: "Which statements about Rajasthan tourism circuits are correct?", "Identify correct statements about Mewar rulers"
- Cognitive load: HIGH - must verify 4-5 independent facts

**Match-the-Following (${archetypeCounts.matchTheFollowing || 0} required):**
- **ENHANCED FORMAT** - Match 4 items from List-I with List-II
- Occasionally 5 pairs for Grade 2 difficulty
- All-or-nothing scoring (entire pattern must be correct)
- **3x harder than standard MCQ**
- Pattern examples: Q11 (Match Human Rights Act dates), Q47 (Match rights with articles)
- Format: A-ii, B-i, C-iii, D-iv (matching code in options)
- Types: Event-Date, Person-Work, Place-Feature, Theory-Theorist

**Arrange-in-Order (${archetypeCounts.arrangeInOrder || 0} required):**
- **ENHANCED FORMAT** - Arrange 4 items in correct sequence
- Occasionally 5 items for Grade 2 difficulty
- **3x harder than standard MCQ**
- Types: Chronological (oldest→newest), Numerical (ascending/descending), Spatial (west→east, north→south), Process steps
- Requires knowledge of relative positioning/timeline
- Examples: "Arrange battles chronologically", "Arrange districts by literacy rate (low to high)"
- Options present different sequences: "(1) A-B-C-D", "(2) B-A-D-C"

**Assertion-Reason (${archetypeCounts.assertionReason || 0} required):**
- **NEW FORMAT** - Two statements: Assertion (A) and Reason (R)
- Evaluate: (1) Both true, R explains A, (2) Both true, R doesn't explain A, (3) A true, R false, (4) A false, R true
- Requires 4-dimensional logical evaluation
- Tests causal relationships and logical reasoning
- Example: "A: Jaisalmer has low rainfall. R: Jaisalmer is in Thar Desert."
- Cognitive load: HIGH - requires truth verification + causal analysis

**Single-Fact Recall (${archetypeCounts.singleFactRecall || 0} required):**
- **REDUCED EMPHASIS** (20% vs old 60%)
- Direct factual knowledge about Rajasthan
- Examples: "Where is X fair held?", "Who authored X?", "Where is X university located?"
- Requires memorization: dates, names, places, numbers
- Used for warm-up questions and factual anchors

**Exception/Negative Phrasing (${archetypeCounts.exceptionNegative || 0} required):**
- **REDUCED EMPHASIS** (5% vs old 20%)
- Uses "NOT", "does NOT", "is NOT", "EXCEPT", "incorrect"
- Tests understanding through exclusion
- Example: "Which of the following is NOT correct regarding X?"

**Comparative/Superlative (${archetypeCounts.comparative || 0} required):**
- Asks for largest, smallest, oldest, highest, lowest, first, maximum, minimum
- Requires knowing relative measures or rankings
- Example: "Which district has the lowest literacy rate?"

---

## CONTENT DOMAIN DETAILS

### GEOGRAPHY (Critical Accuracy):
**Districts:**
- 50 districts (current as of 2024)
- District headquarters, notable features
- Largest/smallest by area/population
- Tourism circuits (Jaipur, Shekhawati, Hadoti, Alwar circuits)

**Physical Features:**
- Rivers: Luni, Chambal, Banas, Mahi, Sabarmati, Banganga, Ahu
- Lakes: Sambhar, Pushkar, Jaisamand
- Hills: Aravalli range, Vindhyan scarplands
- Climate: Koppen classifications (Aw, BShw, BWkw, Cwg)
- Forests: Forest types, wildlife sanctuaries, bird sanctuaries

**Resources:**
- Minerals: Limestone, marble, sandstone
- Agriculture: Linseed regions, livestock regions (Nagour, Kankarej, Rath)
- Irrigation: Rivers, dams, canals

### HISTORY (Factual Accuracy Critical):
**Civilizations:**
- Indus Valley: Kalibangan (Dhoolkot), Ganeshwar, Balathal, Bairath
- Copper-age civilizations on river origins

**Rulers & Dynasties:**
- Chauhans: Ranthambhor dynasty (Govindraj founder)
- Pratihar rulers: Mandor line (Ghatiyala inscription)
- Mewar rulers: Maharanas during 1857 revolution
- Battle locations: Haldighati (Rajsamand district)

**Forts & Architecture:**
- Major forts: Taragarh (Bundi - built by Rao Bairisal), Gagron Fort
- Temple architecture: Maru Gurjar style, Sun Temple combinations
- Archaeological sites: Excavations by specific archaeologists

**Freedom Movement:**
- Leaders: Motilal Tejwat (birthplace), Kesari Singh Barhath
- Organizations: Prajamandals (Mewar, Kota, Bikaner, Alwar), Desh Hiteshini Sabha
- Peasant movements: Barad movement, Meo Peasant Movement

**Integration:**
- Formation of Rajasthan (completed 1956)
- Merger of princely states

### CULTURE (Traditional & Current):
**Folk Arts:**
- Painting schools: Kishangarh (Nihal Chand), Jodhpur, Alwar, Nathdwara
- Female painters: Kamla, Ilaychi
- Literature: Rajasthani plays (Alekhun Amba author), Mancharitra Raso

**Dance & Music:**
- Dance forms: Agni dance (origin place), Gavari (Bhil tribe)
- Tribal associations

**Festivals:**
- Festival sequence: Start with Shravani Teej, end with specific festival
- Regional festivals: Kajaliteej, Gangaur, Teej variations

**Ornaments:**
- Body-part specific: Mandlya (worn on which part?), Khanga (medieval garment/ornament type)

**Temples & Religious Sites:**
- Lok Devtas: Mallinathji temple location (Tilwara)
- Brahma Temple (Pushkar - circuit classification)
- Ganeshwar excavation site

**Languages:**
- Dialect regions: Ahirwati (Mewat region), other regional dialects

### ADMINISTRATIVE/POLITICAL:
**State Government:**
- Governor's powers: Disqualification decisions, ordinance approval, Chancellor roles
- Chief Ministers and Chief Secretaries pairings
- Constitutional amendments: Rajpramukh abolition (which amendment?)

**Commissions:**
- RPSC: Establishment date (December 1949), initial composition, regulations
- Human Rights Commission: Formation (2000), notification, autonomy status

**Legislative Assembly:**
- By-elections during XV Assembly (how many seats?)
- Member value in Presidential Election 2017
- Resignation procedures for members
- Committee tenures: Public Accounts Committee
- Recent inaugurations: Digital Museum (by which Chief Justice?)

**Judiciary:**
- Rajasthan Civil Services Appellate Tribunal: Bench jurisdictions
- District divisions under Jaipur Bench

**Education:**
- University governance: Governor as Chancellor exceptions
- School policies: No-Bag-Day declaration (which day?)

**Panchayati Raj:**
- Amendment Act 2021: Gram Sevak renamed to what?
- Average Gram Panchayats per district
- 11th Schedule subjects count

### DEMOGRAPHICS (Census 2011 + Recent):
**Population Statistics:**
- Density by district groups (lowest density districts)
- Sex ratio: Rural (933), Urban (914), Child (898)
- District with highest child sex ratio: Banswara
- Literacy rates: District-wise, above 75% districts

**Livestock:**
- Breed associations: Sheep (Nali), Cattle (Sanchori), Buffalo (Surti), Goat (Barbari)
- Livestock regions: Rath, Kankarej, Malwai, Nagour

**Agriculture:**
- Tribal agriculture: Bhil plains agriculture (Dajiya)
- Linseed production regions

**Industries:**
- District with maximum large-scale industries
- Plastic hub district

### CURRENT AFFAIRS (Recent):
**Recent Developments:**
- G-20 Presidency: First Sherpa meeting location (December 2022)
- Awards: Veerbala Kalibai award recipients (December 2022)
- Sports: Tribal Hockey Academy location
- Environmental programs: Khadi Commission desertification program
- Climate conferences: 2022 location (Sharm-el-Sheikh, Egypt)

---

## STRUCTURAL FORMAT (REET 2026-Inspired - 5 Format Types)

**FORMAT 1: STANDARD 4-OPTION MCQ (20% of questions):**
\`\`\`
प्रश्न का हिंदी पाठ यहां?
(1) पहला विकल्प
(2) दूसरा विकल्प
(3) तीसरा विकल्प
(4) चौथा विकल्प
\`\`\`
Example: फूटा देवल मेला कहाँ आयोजित होता है? (1) उदयपुर (2) सिरोही (3) राजसमंद (4) डूंगरपुर

**FORMAT 2: MULTI-STATEMENT EVALUATION (MSQ) (40% of questions - DOMINANT):**
\`\`\`
राजस्थान के बारे में निम्नलिखित कथनों पर विचार कीजिए:
(a) जैसलमेर में सबसे कम वर्षा होती है
(b) माउंट आबू राजस्थान का एकमात्र हिल स्टेशन है
(c) चंबल नदी राजस्थान की सबसे लंबी नदी है
(d) थार रेगिस्तान पूरे राजस्थान में फैला है
उपरोक्त में से कौन से कथन सही हैं?
(1) केवल (a) और (b)
(2) केवल (a), (b) और (c)
(3) केवल (b) और (c)
(4) केवल (a) और (d)
\`\`\`
**MSQ GENERATION RULES:**
- Present 4-5 statements (use 5 for hard difficulty)
- Each statement must be independently verifiable
- Options show different combinations of true statements
- ALL options must be grammatically parallel: "केवल (a) और (b)" format
- Ensure only ONE option contains the correct combination

**⚠️ CRITICAL MSQ QUALITY RULE - ZERO TOLERANCE:**
**"ALL CORRECT" ANSWERS BANNED**: NEVER make MSQ questions where all statements are correct
- ❌ ZERO TOLERANCE: Do NOT make even 1 MSQ question with all options (a), (b), (c), (d) correct
- ✅ EVERY MSQ MUST have MIX of true/false statements requiring discrimination
- Create realistic false statements using: common misconceptions, partial truths, reversed facts, outdated data
- MAKE IT CHALLENGING - test actual knowledge, not just "select all correct" laziness
- Example distribution for 10 MSQ: 3 correct (a,b), 2 correct (a,c), 3 correct (b,d), 2 correct (a,b,c) - ZERO "all correct"
- **FORBIDDEN LAZINESS**: Do NOT make all statements obviously true - this is NOT a quality question

**FORMAT 3: MATCH-THE-FOLLOWING (20% of questions):**
\`\`\`
सूची-I को सूची-II से सुमेलित कीजिए:
सूची-I (किले)              सूची-II (निर्माता)
A. तारागढ़ (बूंदी)         i. राव बीरसाल
B. गागरोन किला             ii. अचलदास खींची
C. जूनागढ़ किला            iii. राय सिंह
D. मेहरानगढ़ किला          iv. राव जोधा
सही विकल्प चुनिए:
(1) A-i, B-ii, C-iii, D-iv
(2) A-ii, B-i, C-iv, D-iii
(3) A-i, B-iii, C-ii, D-iv
(4) A-iii, B-ii, C-i, D-iv
\`\`\`
**MATCHING GENERATION RULES:**
- Use 4 pairs (occasionally 5 for hard difficulty)
- Ensure all pairings are factually accurate
- Create plausible distractor options by mixing correct pairings
- All-or-nothing: entire pattern must match correctly

**⚠️ CRITICAL MATCH QUALITY RULE - RANDOMIZATION ENFORCEMENT:**
**LAZY SEQUENTIAL MATCHING FORBIDDEN**: NEVER make A-i, B-ii, C-iii, D-iv the correct answer
- This is LAZY question making and provides ZERO challenge
- Correct answer MUST have randomized matching (e.g., A-iii, B-i, C-iv, D-ii)
- Minimum 2 items must be "crossed" (not sequential) - prefer 3-4 crossed items
- Examples of ACCEPTABLE patterns: A-ii, B-iv, C-i, D-iii OR A-iii, B-i, C-iv, D-ii
- Example of FORBIDDEN pattern: A-i, B-ii, C-iii, D-iv (this will be REJECTED)
- **QUALITY TEST**: If a student can guess without reading List-II, the question is TOO EASY

**FORMAT 4: ARRANGE-IN-ORDER (15% of questions):**
\`\`\`
निम्नलिखित युद्धों को कालक्रम (प्राचीनतम से नवीनतम) में व्यवस्थित कीजिए:
A. हल्दीघाटी का युद्ध
B. खानवा का युद्ध
C. दिवेर का युद्ध
D. राणा सांगा की मृत्यु
सही कालक्रम चुनिए:
(1) B-A-D-C
(2) B-D-A-C
(3) A-B-C-D
(4) B-C-D-A
\`\`\`
**ARRANGE GENERATION RULES:**
- Use 4 items (occasionally 5 for hard difficulty)
- Types: Chronological, Numerical (ascending/descending), Spatial
- Ensure items have clear ordering criteria
- Create distractor sequences with partial correctness

**⚠️ CRITICAL ARRANGE QUALITY RULE - RANDOMIZATION ENFORCEMENT:**
**LAZY SEQUENTIAL ORDERING FORBIDDEN**: NEVER make A-B-C-D the correct answer
- This is LAZY question making - items are already in correct order, providing ZERO challenge
- Correct answer MUST scramble the order (e.g., B-D-A-C, D-A-C-B, C-A-D-B)
- Present items in RANDOM/SHUFFLED order initially, NOT in their natural sequence
- Examples of ACCEPTABLE patterns: B-D-A-C, D-C-B-A, C-A-D-B, B-A-D-C
- Example of FORBIDDEN pattern: A-B-C-D (this will be REJECTED)
- **QUALITY TEST**: If the items are already presented in correct chronological/numerical order, you are being LAZY
- Shuffle items deliberately so students must think about the correct sequence

**FORMAT 5: ASSERTION-REASON (5% of questions):**
\`\`\`
निम्नलिखित कथनों पर विचार कीजिए:
अभिकथन (A): जैसलमेर में बहुत कम वर्षा होती है।
कारण (R): जैसलमेर थार रेगिस्तान के मध्य में स्थित है।
सही विकल्प चुनिए:
(1) (A) और (R) दोनों सही हैं और (R), (A) की सही व्याख्या है
(2) (A) और (R) दोनों सही हैं परंतु (R), (A) की सही व्याख्या नहीं है
(3) (A) सही है परंतु (R) गलत है
(4) (A) गलत है परंतु (R) सही है
\`\`\`
**ASSERTION-REASON GENERATION RULES:**
- Present two statements: Assertion (A) and Reason (R)
- Both must be independently factual claims about Rajasthan
- Test causal/logical relationship between them
- Standard 4 options (as shown above) - MUST use these exact options in Hindi

**⚠️ CRITICAL A-R QUALITY RULE - ANSWER DISTRIBUTION ENFORCEMENT:**
**OPTION 1 DOMINANCE FORBIDDEN**: Maximum 30-40% of A-R questions can have option (1) as correct answer
- **REQUIRED DISTRIBUTION** for Assertion-Reason questions:
  - Option (1) "Both true, R explains A": 30-40% of questions
  - Option (2) "Both true, R does NOT explain A": 30-35% of questions
  - Option (3) "A true, R false": 15-20% of questions
  - Option (4) "A false, R true": 10-15% of questions
- **AVOID LAZY PATTERN**: Do NOT make all A-R questions have both statements true with correct explanation
- Create proper variation: independent truths, false assertions, false reasons, non-causal relationships
- **QUALITY TEST**: If 80%+ of A-R questions are option (1), you are being LAZY - add more variety

---

## FROZEN PROHIBITIONS (Zero Violations Allowed)

### NEVER include in options:
- ❌ "उपरोक्त सभी" (All of the above)
- ❌ "इनमें से कोई नहीं" (None of the above)
- ❌ Duplicate options - all 4 must be textually unique
- ❌ Same person with different formats: Full name (शैलेंद्र कुमार सिंह) vs Initials (एस.के. सिंह)
- ❌ 5 options (MUST be exactly 4)

### NEVER use in question stems:
- ❌ Meta-references: "according to study material", "as per notes"
- ❌ Inaccurate Rajasthan facts (factual errors are unacceptable)
- ❌ Outdated information (use current district names, schemes, data)

### FORMAT RULES:
- ✅ MUST use exactly 4 options (1), (2), (3), (4)
- ✅ ALL content in Hindi (Devanagari script)
- ✅ MUST be factually accurate

### ❌ ABSOLUTELY FORBIDDEN LAZY PATTERNS (Zero Violations Allowed):

1. **MSQ "All Correct" BANNED**: NEVER EVER make MSQ questions where all statements are correct
   - ❌ FORBIDDEN: Answer where ALL options (a), (b), (c), (d) are correct
   - ❌ ZERO TOLERANCE: Not even 1 question out of 10 can have "all correct" answer
   - ✅ REQUIRED: EVERY MSQ must have mix of true/false statements requiring discrimination
   - ✅ REQUIRED: Create realistic false statements using misconceptions, partial truths, reversed facts

2. **Sequential Matching BANNED**: NEVER EVER make A-i, B-ii, C-iii, D-iv the correct answer
   - ❌ FORBIDDEN: A-i, B-ii, C-iii, D-iv (sequential pattern)
   - ❌ ZERO TOLERANCE: Not even 1 Match question can have sequential pattern
   - ✅ REQUIRED: EVERY Match must have scrambled pattern (e.g., A-iii, B-i, C-iv, D-ii)
   - ✅ REQUIRED: Minimum 2 items crossed, prefer 3-4 crossed items

3. **Sequential Ordering BANNED**: NEVER EVER make A-B-C-D the correct answer
   - ❌ FORBIDDEN: A-B-C-D (items already in correct chronological order)
   - ❌ ZERO TOLERANCE: Not even 1 Arrange question can have A-B-C-D answer
   - ✅ REQUIRED: EVERY Arrange must scramble item order (e.g., B-D-A-C, D-A-C-B, C-A-D-B)
   - ✅ REQUIRED: Present items in random/shuffled order, NOT natural sequence

4. **A-R Option 1 Dominance**: DO NOT make majority of A-R questions have option (1)
   - ❌ FORBIDDEN: Making 60%+ of A-R questions have answer "both true, R explains A"
   - ✅ REQUIRED: Distribute answers across all 4 options (roughly 30% opt1, 30% opt2, 20% opt3, 20% opt4)
   - Create variation: independent truths, false assertions, false reasons, non-causal relationships

5. **Simplistic Questions BANNED**: NEVER make trivial questions that insult intelligence
   - ❌ FORBIDDEN: Questions any layperson could answer without Rajasthan knowledge
   - ✅ REQUIRED: Professional-grade with specific facts, dates, numbers, nuanced distinctions

**⚠️ CRITICAL: If you violate patterns #1, #2, or #3 even ONCE, the entire question set will be REJECTED**

### EXPLANATION REQUIREMENTS (MANDATORY):
- ✅ Explain WHY correct answer is right
- ✅ Explain WHY incorrect options are wrong
- ❌ NEVER write meta-commentary about question quality
- ❌ NEVER admit errors in explanation - FIX THE QUESTION instead

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
16. ✓ Factual accuracy verified (Rajasthan-specific facts are correct)
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
29. ✓ Assertion-Reason: Both (A) and (R) present with standard 4 options

---

## RAJASTHAN-SPECIFIC VALIDATION CHECKLIST

Before finalizing questions, verify:
✓ **Geography**: District names are current (50 districts as of 2024)
✓ **History**: Dates, rulers, events are accurate
✓ **Culture**: Festival names, ornaments, folk arts are correct
✓ **Demographics**: Use Census 2011 or latest data
✓ **Current Affairs**: Recent schemes, events (2022-2024)
✓ **Administrative**: Current structure, positions, policies

---

## OPTION CONSTRUCTION RULES

- **All 4 options MUST be textually unique** (no duplicates)
- **Name-based questions**: Use 4 DIFFERENT people's names
- All 4 options should be approximately equal length
- All 4 options should use same grammatical structure
- All 4 options should be plausible (not obviously wrong)
- Use authentic Rajasthan entities (real districts, real rulers, real schemes)
- Make distractors plausible using DIFFERENT but related entities

### HINDI LANGUAGE REQUIREMENTS:
- Use proper Devanagari script (देवनागरी लिपि)
- Use formal/standard Hindi (शुद्ध हिंदी)
- Technical terms can use English words in Devanagari
- Numbers in Arabic numerals (0123456789) for consistency
- Maintain grammatical correctness (व्याकरण शुद्धता)

---

## ANSWER KEY BALANCE

- Distribute correct answers approximately evenly: ~25% each for (1), (2), (3), (4)
- Avoid long streaks of same answer (max 3 consecutive)
- Randomize answer positions naturally

---

## COGNITIVE LOAD SEQUENCING

- **First ${Math.ceil(questionCount * 0.1)} questions**: WARM-UP - Use low-density, Single-Fact Recall
- **Middle questions**: Mix of densities based on archetype
- **High-density**: Exception/Negative, Matching, Sequencing (requires careful reading)

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
      "questionText": "प्रश्न का हिंदी पाठ यहां (Full question in Hindi Devanagari)",
      "questionText_en": "Full question text in English",
      "archetype": "multiStatementEvaluation" | "matchTheFollowing" | "arrangeInOrder" | "assertionReason" | "singleFactRecall" | "exceptionNegative" | "comparative",
      "structuralForm": "multipleSelectQuestions" | "matchTheFollowing" | "arrangeInOrder" | "assertionReason" | "standard4OptionMCQ",
      "cognitiveLoad": "low" | "medium" | "high",
      "correctAnswer": "1" | "2" | "3" | "4",
      "options": {
        "1": "विकल्प 1 हिंदी में (Option 1 in Hindi)",
        "2": "विकल्प 2 हिंदी में (Option 2 in Hindi)",
        "3": "विकल्प 3 हिंदी में (Option 3 in Hindi)",
        "4": "विकल्प 4 हिंदी में (Option 4 in Hindi)"
      },
      "options_en": {
        "1": "Option 1 in English",
        "2": "Option 2 in English",
        "3": "Option 3 in English",
        "4": "Option 4 in English"
      },
      "explanation": "व्याख्या हिंदी में (Explanation in Hindi)",
      "explanation_en": "Clear explanation in English",
      "difficulty": "easy" | "medium" | "hard",
      "language": "bilingual",
      "contentDomain": "geography" | "history" | "culture" | "administrative" | "demographics"
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
      "questionText": "प्रश्न का हिंदी पाठ यहां (Full question in Hindi)",
      "archetype": "multiStatementEvaluation" | "matchTheFollowing" | "arrangeInOrder" | "assertionReason" | "singleFactRecall" | "exceptionNegative" | "comparative",
      "structuralForm": "multipleSelectQuestions" | "matchTheFollowing" | "arrangeInOrder" | "assertionReason" | "standard4OptionMCQ",
      "cognitiveLoad": "low" | "medium" | "high",
      "correctAnswer": "1" | "2" | "3" | "4",
      "options": {
        "1": "विकल्प 1 हिंदी में",
        "2": "विकल्प 2 हिंदी में",
        "3": "विकल्प 3 हिंदी में",
        "4": "विकल्प 4 हिंदी में"
      },
      "explanation": "व्याख्या हिंदी में - explain why correct answer is right and why others are wrong",
      "difficulty": "easy" | "medium" | "hard",
      "language": "hindi",
      "contentDomain": "geography" | "history" | "culture" | "administrative" | "demographics"
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

**VALIDATION COMPLETE**: Only proceed to return JSON if ALL checks passed.

---

## FINAL INSTRUCTIONS

Generate ${questionCount} questions now following ALL rules above.

⚠️  **CRITICAL**:
- Use EXACTLY 4 options per question (NOT 5)
- Label options as (1), (2), (3), (4)
- Factual accuracy for Rajasthan content is MANDATORY
${hasStudyMaterials ? '- Extract content from study materials but verify facts' : '- Generate authentic RPSC-quality questions from your training knowledge'}
- NO meta-references
${isBilingual
  ? `- Generate BOTH Hindi and English in SINGLE response
- Include questionText + questionText_en, options + options_en, explanation + explanation_en
- Set "language": "bilingual" in each question
- Ensure both languages convey identical meaning and difficulty`
  : `- ALL content in Hindi (Devanagari script)
- Set "language": "hindi" in each question`}
- Return ONLY valid JSON

**QUALITY VERIFICATION** (check before returning):
✓ All 4 options are textually unique - NO DUPLICATES
✓ For name-based questions: All 4 options contain DIFFERENT people
✓ Explanation is concrete and factual - NO meta-commentary
✓ No option says "उपरोक्त सभी" or "इनमें से कोई नहीं"
✓ All Rajasthan facts are accurate and current
✓ Options labeled as (1), (2), (3), (4) not (A), (B), (C), (D)

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
        errors.push(`Question ${q.questionNumber}: Must have exactly 4 options (found ${optionKeys.length})`)
      }
      if (!optionKeys.every(k => ['1', '2', '3', '4', 'A', 'B', 'C', 'D'].includes(k))) {
        errors.push(`Question ${q.questionNumber}: Options must be labeled 1,2,3,4 or A,B,C,D`)
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
 * Complete RPSC Senior Teacher Grade II Paper 1 - Rajasthan GK Protocol
 */
export const rpscSeniorTeacherPaper1RajasthanGKProtocol: Protocol = {
  id: 'rpsc-senior-teacher-paper1-rajasthan-gk',
  name: 'RPSC Senior Teacher Grade II - Paper 1: Rajasthan GK',
  streamName: 'RPSC Senior Teacher Grade II',
  subjectName: 'Paper 1 - Rajasthan General Knowledge',
  difficultyMappings,
  prohibitions,
  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,
    warmupPercentage: 0.10
  },
  buildPrompt: buildRajasthanGKPrompt,
  validators,
  metadata: {
    description: 'RPSC Senior Teacher Grade II Paper 1: Rajasthan GK protocol - REET 2026-inspired with 5 structural formats',
    analysisSource: 'Based on REET 2026 analysis + Enhanced for Grade 2 senior position',
    version: '2.0.0',
    lastUpdated: '2025-01-18',
    examType: 'SELECTION (Merit-based) - Common Paper 1 Section',
    sectionWeightage: '~40 questions out of 100 total in Paper 1',
    note: `REET 2026-INSPIRED PROTOCOL (Grade 2 MORE difficult than REET):

**NEW STRUCTURAL DISTRIBUTION (~40 questions):**
  - Standard MCQ: 20% (8Q) - REDUCED from 100%
  - Multi-Statement Evaluation (MSQ): 40% (16Q) - NEW DOMINANT (4x difficulty)
  - Match-the-Following: 20% (8Q) - NEW (3x difficulty)
  - Arrange-in-Order: 15% (6Q) - NEW (3x difficulty)
  - Assertion-Reason: 5% (2Q) - NEW

**ARCHETYPE TRANSFORMATION (Balanced Difficulty):**
  - Single-Fact Recall: 20% (was 60% - DRASTICALLY REDUCED)
  - Multi-Statement Evaluation: 35% (NEW - DOMINANT)
  - Match-the-Following: 20% (was 10%)
  - Arrange-in-Order: 15% (was 5%)
  - Exception/Negative: 5% (was 20%)
  - Comparative: 3% (was 5%)
  - Assertion-Reason: 2% (NEW)

**COGNITIVE LOAD TARGET:**
  - Low-Density: 10% (was 40% - REDUCED)
  - Medium-Density: 30% (was 50%)
  - High-Density: 60% (was 10% - MASSIVELY INCREASED)

**DIFFICULTY MULTIPLIER:** 4-6x (higher than REET's 3-5x)

**Content Distribution (Unchanged):**
  - Geography: ~25% (districts, rivers, climate, forests, tourism)
  - History: ~25% (rulers, battles, civilizations, freedom movement)
  - Culture: ~20% (festivals, arts, literature, temples)
  - Administrative/Political: ~20% (government, commissions, policies)
  - Demographics: ~10% (census, literacy, industries)

**Quality Characteristics:**
  - Factual accuracy is CRITICAL
  - Requires deep Rajasthan-specific knowledge
  - All questions in Hindi (Devanagari)
  - Common Paper 1 - taken by ALL candidates
  - Senior position demands higher complexity than REET Grade 3`
  }
}
