/**
 * RPSC Senior Teacher (Grade II) - Paper 1: Current Affairs of Rajasthan Protocol
 *
 * UPDATED: REET 2026-Inspired Protocol (Grade 2 MORE difficult than REET Grade 3)
 * Section: Current Affairs of Rajasthan
 * Question Count: ~10 questions per paper
 *
 * EXAM CONTEXT:
 * - Part of Common Paper 1 for ALL RPSC Senior Teacher Grade II candidates
 * - Focuses on recent events, schemes, appointments, achievements in Rajasthan
 * - Time period: Last 12-24 months from exam date
 * - All questions in Hindi (primary language)
 *
 * NEW STRUCTURAL DISTRIBUTION (2026 Pattern):
 * - Standard MCQ: 30% (REDUCED from 100%)
 * - Multi-Statement Evaluation (MSQ): 50% (NEW DOMINANT - most difficult)
 * - Assertion-Reason: 20% (NEW)
 *
 * DIFFICULTY: 4-6x multiplier (higher than REET's 3-5x)
 * HIGH COGNITIVE LOAD: 50% (current affairs analysis demands high density)
 * DATE-SENSITIVE: Requires current information (2023-2024 range)
 */

import { Protocol, ProtocolConfig } from '../../../types'
import { Question } from '../../../../questionValidator'

/**
 * Current Affairs Archetype Distributions
 * Difficulty: 20% Easy, 50% Balanced, 30% Hard
 */

const currentAffairsArchetypes = {
  easy: {
    recentEventRecall: 0.45,         // REDUCED from 0.50 - major events, high-profile
    multiStatementEvaluation: 0.35,  // INCREASED from 0.30 - more MSQ practice
    policyScheme: 0.20               // Well-known schemes (MCQ-based)
  },
  balanced: {
    recentEventRecall: 0.10,         // ADJUSTED - 10% (major events, appointments)
    appointmentAchievement: 0.10,
    policyScheme: 0.10,              // RESTORED - 10% (schemes, policies, initiatives)
    multiStatementEvaluation: 0.40,  // ADJUSTED - 45% MSQ format (reduced from 50%)
    assertionReason: 0.30            // INCREASED - 35% A-R (up from 10% - critical for event-cause reasoning in current affairs)
  },
  hard: {
    multiStatementEvaluation: 0.60,  // NEW DOMINANT - Complex policy/scheme MSQ
    assertionReason: 0.20,           // Complex event-cause analysis
    recentEventRecall: 0.10,         // Obscure events only
    policyScheme: 0.10               // Detailed technical provisions
  }
}

/**
 * Structural Forms - SEPARATED BY DIFFICULTY
 * REET 2026-inspired format distribution - Grade 2 MORE difficult than REET
 * Each difficulty level has its own structural form distribution
 * NOTE: Current Affairs has NO Match-the-Following or Arrange-in-Order (only 3 formats)
 */
const structuralForms = {
  easy: {
    standard4OptionMCQ: 0.65,       // More MCQ for easy level (only 3 formats)
    multipleSelectQuestions: 0.35,  // Moderate MSQ
    assertionReason: 0              // No A-R (too complex for easy)
  },
  balanced: {
    standard4OptionMCQ: 0.20,       // ADJUSTED - 20% (reduced from 30% for more A-R)
    multipleSelectQuestions: 0.45,  // ADJUSTED - 45% MSQ (reduced from 50%)
    assertionReason: 0.35           // INCREASED - 35% A-R (up from 20% - event-cause reasoning critical for current affairs)
  },
  hard: {
    standard4OptionMCQ: 0.20,       // Less MCQ for hard
    multipleSelectQuestions: 0.60,  // Maximum MSQ (hardest format)
    assertionReason: 0.20           // Same as balanced
  }
}

/**
 * Cognitive Load Distribution - SMOOTHED PROGRESSION
 * Grade 2 Target: High-density 50% (current affairs analysis demands)
 * Smooth progression: 20% → 50% → 65% (not steep 10% → 50% → 65%)
 */
const cognitiveLoad = {
  easy: {
    lowDensity: 0.40,    // REDUCED from 0.60 - easier but progressing
    mediumDensity: 0.40, // INCREASED from 0.30 - more medium-density
    highDensity: 0.20    // DOUBLED from 0.10 - smooth progression to balanced
  },
  balanced: {
    lowDensity: 0.20,    // PLAN TARGET
    mediumDensity: 0.30, // PLAN TARGET
    highDensity: 0.50    // PLAN TARGET - current affairs requires analysis
  },
  hard: {
    lowDensity: 0.10,    // Minimal low-density
    mediumDensity: 0.25, // Reduced medium
    highDensity: 0.65    // Maximum difficulty
  }
}

/**
 * Difficulty Mappings - NOW WITH SEPARATE STRUCTURAL FORMS PER DIFFICULTY
 */
const difficultyMappings: Protocol['difficultyMappings'] = {
  easy: {
    archetypes: currentAffairsArchetypes.easy as any,
    structuralForms: structuralForms.easy as any,      // FIXED: Use easy structural forms
    cognitiveLoad: cognitiveLoad.easy
  },
  balanced: {
    archetypes: currentAffairsArchetypes.balanced as any,
    structuralForms: structuralForms.balanced as any,  // FIXED: Use balanced structural forms
    cognitiveLoad: cognitiveLoad.balanced
  },
  hard: {
    archetypes: currentAffairsArchetypes.hard as any,
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
  'NEVER use outdated information - verify event dates and details',
  'NEVER use events older than 24 months from exam date',
  'NEVER make up fake events or schemes - all must be verifiable',
  'DUPLICATE OPTIONS FORBIDDEN - All 4 options must be unique',

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
  '🔴 DO NOT over-generate Recent Event Recall at expense of A-R format - respect the percentages strictly',
  '🔴 BEFORE RETURNING: Count each archetype - if ANY archetype falls short of target by 2+, REGENERATE those missing questions',

  // QUALITY PATTERN PROHIBITIONS (CRITICAL - Zero Tolerance):
  '❌ MSQ "ALL CORRECT" ABSOLUTELY BANNED: NEVER EVER make MSQ questions where all statements (A,B,C,D) are correct - ZERO TOLERANCE - Not even 1 question',
  '❌ A-R OPTION 1 DOMINANCE FORBIDDEN: NEVER make more than 60% of Assertion-Reason questions have option (1) - Distribute across all 4 options',
  '❌ SIMPLISTIC CURRENT AFFAIRS BANNED: NEVER make trivial questions that any layperson could answer without current affairs knowledge',
  'EVERY MSQ MUST have mix of true/false statements requiring discrimination - create realistic false statements using misconceptions, outdated data',
  'A-R questions MUST be distributed: roughly 30% opt1, 30% opt2, 20% opt3, 20% opt4 - create variation with independent truths, false assertions',
  'PROFESSIONAL-GRADE QUESTIONS REQUIRED: Specific dates, names, amounts, nuanced distinctions - NOT obvious/generic current affairs'
]

/**
 * Calculate archetype counts
 */
function getArchetypeCounts(
  difficulty: 'easy' | 'balanced' | 'hard',
  questionCount: number
): Record<string, number> {
  const archetypes = currentAffairsArchetypes[difficulty]
  const counts: Record<string, number> = {}

  for (const [key, value] of Object.entries(archetypes)) {
    counts[key] = Math.round(questionCount * value)
  }

  return counts
}

/**
 * Current Affairs Prompt Builder
 */
function buildCurrentAffairsPrompt(
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

  return `You are an expert RPSC Senior Teacher (Grade II) Paper 1 question generator. Generate ${questionCount} high-quality RPSC-style Current Affairs questions ${hasStudyMaterials ? `from the provided study materials for the topic: "${chapterName}"` : `using your comprehensive RPSC exam knowledge for: "${chapterName}"`}.

This is part of a ${totalQuestions}-question Paper 1 testing Current Affairs of Rajasthan.

${!hasStudyMaterials ? `
## CONTENT SOURCE

⚠️  **AI KNOWLEDGE MODE**: No study materials provided
- Generate questions using your training knowledge of RPSC Senior Teacher Grade II exam
- Focus on authentic Rajasthan current affairs from recent 12-24 months
- Cover major events, schemes, appointments, and developments in Rajasthan
- Maintain factual accuracy for all current affairs content
` : ''}

---

## ⚠️ CRITICAL QUALITY STANDARDS - READ CAREFULLY

This is a COMPETITIVE GOVERNMENT EXAM for SENIOR TEACHER positions. Questions MUST be:
- **Academically rigorous** - test current affairs knowledge, not obvious facts
- **Professionally appropriate** - suitable for evaluating experienced educators
- **Discriminating** - separate strong candidates from weak ones
- **Complex enough** to challenge senior-level candidates
- **NOT simplistic** - avoid obvious/trivial current affairs that insult candidate intelligence
- **NOT generic** - use specific Rajasthan current affairs, not general news anyone could guess
- **Time-sensitive** - focus on 12-24 months recent events, NOT outdated news

**FORBIDDEN QUALITY FAILURES:**
❌ Overly simple current affairs that any layperson could answer
❌ Generic questions without Rajasthan-specific depth
❌ Questions with obvious answers that don't test real knowledge
❌ Lazy statement combinations that are all obviously true/false
❌ Surface-level event recall when deeper analysis is possible
❌ Outdated events from more than 24 months ago

**REQUIRED QUALITY MARKERS:**
✅ Specific details (dates, names, places, numbers, amounts) from Rajasthan current affairs
✅ Nuanced distinctions requiring careful attention to recent news
✅ Integration of multiple knowledge domains (schemes + governance + development)
✅ Critical thinking and analytical reasoning about current affairs
✅ Professional-grade difficulty appropriate for senior educators
✅ Recent events, schemes, appointments from last 12-24 months

---

## CRITICAL RPSC-SPECIFIC REQUIREMENTS

⚠️  **OPTION COUNT**: Each question MUST have exactly 4 options labeled (1), (2), (3), (4)
- NOT 5, NOT 3, EXACTLY 4 options

**EXAM CONTEXT**: Paper 1 - Current Affairs Section (~10 questions)
- Tests knowledge of recent events, schemes, appointments in Rajasthan
- Time frame: Last 12-24 months from exam date
- All candidates must answer these questions

**LANGUAGE**: ${isBilingual
  ? `BILINGUAL MODE - Generate questions in BOTH Hindi and English
- Hindi is PRIMARY (always required) - Use Devanagari script
- English is SECONDARY (for bilingual support)
- Both languages must convey the SAME meaning and difficulty
- Generate both languages in a SINGLE response

⚠️ CRITICAL BILINGUAL RULE - MUST FOLLOW ⚠️

Hindi fields (questionText, options) MUST NEVER contain English text in parentheses.

❌ ABSOLUTELY FORBIDDEN EXAMPLES:
   - "मुख्यमंत्री (Chief Minister)"
   - "योजना (Scheme)"
   - "राजस्थान सरकार (Rajasthan Government)"

✅ REQUIRED FORMAT:
   - questionText: "मुख्यमंत्री"
   - questionText_en: "Chief Minister"
   - options.A: "योजना"
   - options_en.A: "Scheme"

**Translation Guidelines**:
- Proper nouns: Transliterate correctly (राजस्थान → Rajasthan)
- Scheme names: Keep official names in both languages
- Numbers/Dates: Keep identical in both languages
- Do NOT translate scheme names - transliterate only
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

**TIME SENSITIVITY**:
- All events/schemes must be from 2023-2024 period (or as specified)
- Verify dates and current status of schemes
- Use official government announcements as source

---

## SECTION OVERVIEW

**Current Affairs of Rajasthan (~10 questions out of 100 total)**

Content Domains:
- **Government Schemes** (30%): New welfare schemes, insurance schemes, employment programs
- **Events/Conferences** (25%): State-level events, national events in Rajasthan (G-20, etc.)
- **Sports/Culture** (20%): Sports achievements, cultural events, awards
- **Administrative** (15%): Appointments, committees, notifications
- **Infrastructure** (10%): New projects, inaugurations, developments

---

## QUESTION ARCHETYPE DISTRIBUTION (Target Counts)

${archetypeList}

### Archetype Definitions:

**Multi-Statement Evaluation - MSQ (${archetypeCounts.multiStatementEvaluation || 0} required) - DOMINANT FORMAT:**
- Present 4-5 statements about schemes, events, or policies
- Candidate evaluates truth of each statement
- Select correct combination of true/false statements
- **DIFFICULTY: 4x harder than standard MCQ** (cannot guess - all statements must be evaluated)
- Examples:
  - "Which of the following statements about Mukhya Mantri Chiranjeev Swasthya Bima Yojana are correct?"
  - "Evaluate these statements about G-20 events in Rajasthan..."
  - "Which statements about recent sports achievements in Rajasthan are accurate?"
- Requires: Knowledge of multiple aspects, detail retention, careful evaluation
- **GRADE 2 ENHANCEMENT**: 5 statements where possible, cross-scheme comparisons

**Recent Event Recall (${archetypeCounts.recentEventRecall || 0} required) - REDUCED EMPHASIS:**
- Questions about events that occurred in last 12-24 months
- Examples: "Where was X event held in 2022?", "Who inaugurated X?", "Who won X award in December 2022?"
- Pattern: Q13 (By-elections in XV Assembly), Q17 (Digital Museum inauguration), Q20 (G-20 Sherpa meeting), Q26 (Veerbala Kalibai award)
- Requires awareness of recent happenings
- **NOTE**: Reduced from 50% to 20% - focus on major events only

**Policy/Scheme Questions (${archetypeCounts.policyScheme || 0} required) - REDUCED EMPHASIS:**
- Questions about government schemes, their provisions, coverage
- Examples: "What is the insurance coverage under X scheme?", "Which day declared as No-Bag-Day?", "How many crores allocated for X?"
- Pattern: Q19 (No-Bag-Day for schools), Q22 (Kamdhenu Pashu Bima Yojana provisions), Q23 (Award to Industries Department), Q24 (Chiranjeev Swasthya Bima)
- Requires knowledge of scheme details
- **NOTE**: Reduced from 30% to 10% - complex schemes now in MSQ format

**Appointment/Achievement (${archetypeCounts.appointmentAchievement || 0} required) - REDUCED EMPHASIS:**
- Questions about appointments to positions, sports achievements, awards
- Examples: "Who has been nominated as...?", "Which team won X championship?", "Who completed Ironman World Championship?"
- Pattern: Q19 (Rajya Sabha member nomination), Q25 (Hockey team captain), Q26 (Ironman completion), Q27 (Taekwondo Premier League)
- Requires awareness of recent recognitions
- **NOTE**: Reduced from 20% to 10%

**Assertion-Reason (${archetypeCounts.assertionReason || 0} required) - NEW FORMAT:**
- Two statements: Assertion (A) and Reason (R)
- Evaluate: Both true? Does R explain A? Which is false?
- **DIFFICULTY: 4x harder than MCQ** (4-dimensional evaluation required)
- Examples:
  - "Assertion: Rajasthan hosted G-20 Sherpa meeting in Udaipur. Reason: Udaipur was selected for its tourism infrastructure."
  - "Assertion: Chiranjeev Swasthya Bima provides ₹25 lakh coverage. Reason: State government increased coverage from ₹10 lakh in 2023."
- Requires: Deep understanding of event causation, policy reasoning, temporal connections
- **GRADE 2 FOCUS**: Event-cause relationships, policy impact analysis

---

## CONTENT DOMAIN DETAILS

### GOVERNMENT SCHEMES (Detailed Knowledge Required):
**Welfare Schemes:**
- Mukhya Mantri Chiranjeev Swasthya Bima Yojana: Coverage (₹25 lakh), packages (1998), start date (May 1, 2021)
- Mukhya Mantri Kamdhenu Pashu Bima Yojana: Coverage (₹40,000), beneficiaries (20 lakh+), budget (₹750 crores), premium (₹500)
- Gas Cylinder Guarantee Card Scheme
- Free Annapurna Food Packet Scheme
- Yuva Sambal Yojana

**Educational Schemes:**
- No-Bag-Day declaration (Saturday)
- Mahangai Rahat Camp schemes
- Green Lungs development (13 cities)

### EVENTS/CONFERENCES:
**National Events in Rajasthan:**
- G-20 Presidency: First Sherpa meeting (Udaipur, December 2022)
- Climate change conferences
- Other national-level conferences

**State Events:**
- Digital Museum inauguration (Rajasthan Legislative Assembly) - by Chief Justice D.Y. Chandrachud
- Award ceremonies: Buyer Seller Gaurav Samman (June 26, 2023, New Delhi)
- Department recognitions: JAM Excellence, RAJSHREE awards

### SPORTS & CULTURE:
**Sports Achievements:**
- Tribal Hockey Academy establishment (location)
- Hockey teams: Women's team in Junior competitions (captains)
- Taekwondo Premier League: Rajasthan Rebels championship
- Ironman World Championship: Completion by Rajasthan player (Shivangi Sarda)
- Badminton tournaments: All India Sub Junior Ranking

**Cultural Events:**
- Regional literature: Rajasthani play authors (Alekhun Amba)
- Awards: Veerbala Kalibai award (December 2022)

### ADMINISTRATIVE:
**Appointments:**
- Rajya Sabha member nominations to State committees (Randeep Surjewala)
- Chief Secretary during Congress government (December 2018)
- Judicial appointments: Chief Justice inaugurations

**Committees:**
- State level Jan Abhiyog Nirakaran Samiti members
- Commission memberships

### INFRASTRUCTURE:
**New Projects:**
- Tribal Hockey Academy
- Green Lungs in cities (count: 13)
- Wildlife reserves: Amagarh Leopard Reserve
- Environmental programs: Khadi Commission projects (Project Bold)

---

## STRUCTURAL FORMAT

### FORMAT 1: STANDARD 4-OPTION MCQ (30% - REDUCED)

**Template:**
\`\`\`
प्रश्न का हिंदी पाठ यहां?
(1) पहला विकल्प
(2) दूसरा विकल्प
(3) तीसरा विकल्प
(4) चौथा विकल्प
\`\`\`

**Example (Event-based):**
\`\`\`
भारत की G-20 अध्यक्षता की पहली शेरपा बैठक दिसंबर 2022 में कहाँ आयोजित की गई?
(1) जोधपुर
(2) जयपुर
(3) उदयपुर
(4) कोटा
\`\`\`

**Example (Scheme-based):**
\`\`\`
स्कूलों में बच्चों के लिए राजस्थान सरकार ने किस दिन को 'नो-बैग-डे' घोषित किया है?
(1) शुक्रवार
(2) शनिवार
(3) सोमवार
(4) मंगलवार
\`\`\`

### FORMAT 2: MULTI-STATEMENT EVALUATION - MSQ (50% - DOMINANT)

**Template:**
\`\`\`
निम्नलिखित में से कौन से कथन सही हैं?
A. कथन 1
B. कथन 2
C. कथन 3
D. कथन 4
विकल्प:
(1) केवल A और B
(2) केवल B और C
(3) केवल A, C और D
(4) सभी कथन सही हैं
\`\`\`

**Example (Scheme-based MSQ):**
\`\`\`
मुख्यमंत्री चिरंजीवी स्वास्थ्य बीमा योजना के बारे में निम्नलिखित कथनों पर विचार करें:
A. यह योजना 1 मई 2021 को शुरू की गई थी
B. इस योजना के तहत ₹25 लाख तक का स्वास्थ्य बीमा कवरेज प्रदान किया जाता है
C. योजना में 1998 स्वास्थ्य पैकेज शामिल हैं
D. यह योजना केवल BPL परिवारों के लिए उपलब्ध है

सही कथनों का चयन करें:
(1) केवल A, B और C
(2) केवल A और D
(3) केवल B, C और D
(4) सभी कथन सही हैं
\`\`\`

**Example (Event-based MSQ):**
\`\`\`
राजस्थान में G-20 से संबंधित निम्नलिखित कथनों में से कौन से सही हैं?
A. भारत की G-20 अध्यक्षता की पहली शेरपा बैठक उदयपुर में आयोजित हुई
B. यह बैठक दिसंबर 2022 में आयोजित की गई थी
C. राजस्थान ने G-20 के दौरान कई सांस्कृतिक कार्यक्रम आयोजित किए
D. जयपुर में G-20 शिखर सम्मेलन आयोजित हुआ था

सही विकल्प चुनें:
(1) केवल A, B और C
(2) केवल A और B
(3) केवल B, C और D
(4) सभी कथन सही हैं
\`\`\`

**⚠️ CRITICAL MSQ QUALITY RULE - ZERO TOLERANCE:**
**"ALL CORRECT" ANSWERS BANNED**: NEVER make MSQ questions where all statements are correct
- ❌ ZERO TOLERANCE: Do NOT make even 1 MSQ question with all options A, B, C, D correct
- ✅ EVERY MSQ MUST have MIX of true/false statements requiring discrimination
- Create realistic false statements using: common misconceptions, partial truths, outdated data, reversed facts
- MAKE IT CHALLENGING - test actual current affairs knowledge, not just "select all correct" laziness
- Example distribution for 10 MSQ: 3 correct (A,B), 2 correct (A,C), 3 correct (B,D), 2 correct (A,B,C) - ZERO "all correct"
- **FORBIDDEN LAZINESS**: Do NOT make all statements obviously true - this is NOT a quality question

### FORMAT 3: ASSERTION-REASON (20% - NEW)

**Template:**
\`\`\`
निम्नलिखित में से दो कथन दिए गए हैं:
अभिकथन (A): [कथन]
कारण (R): [कथन]

निम्नलिखित में से सही विकल्प चुनें:
(1) A और R दोनों सत्य हैं और R, A की सही व्याख्या है
(2) A और R दोनों सत्य हैं लेकिन R, A की सही व्याख्या नहीं है
(3) A सत्य है लेकिन R असत्य है
(4) A असत्य है लेकिन R सत्य है
\`\`\`

**Example (Scheme-based A-R):**
\`\`\`
निम्नलिखित कथनों पर विचार करें:
अभिकथन (A): मुख्यमंत्री चिरंजीवी स्वास्थ्य बीमा योजना राजस्थान के सभी परिवारों को ₹25 लाख तक का स्वास्थ्य बीमा कवरेज प्रदान करती है।
कारण (R): राजस्थान सरकार ने स्वास्थ्य सेवाओं तक सार्वभौमिक पहुंच सुनिश्चित करने के लिए यह योजना शुरू की।

सही विकल्प चुनें:
(1) A और R दोनों सत्य हैं और R, A की सही व्याख्या है
(2) A और R दोनों सत्य हैं लेकिन R, A की सही व्याख्या नहीं है
(3) A सत्य है लेकिन R असत्य है
(4) A असत्य है लेकिन R सत्य है
\`\`\`

**Example (Event-based A-R):**
\`\`\`
निम्नलिखित कथनों का मूल्यांकन करें:
अभिकथन (A): उदयपुर में दिसंबर 2022 में भारत की G-20 अध्यक्षता की पहली शेरपा बैठक आयोजित की गई।
कारण (R): उदयपुर को इसकी समृद्ध सांस्कृतिक विरासत और पर्यटन बुनियादी ढांचे के कारण चुना गया था।

सही उत्तर चुनें:
(1) A और R दोनों सत्य हैं और R, A की सही व्याख्या है
(2) A और R दोनों सत्य हैं लेकिन R, A की सही व्याख्या नहीं है
(3) A सत्य है लेकिन R असत्य है
(4) A असत्य है लेकिन R सत्य है
\`\`\`

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
- Example distribution for 10 A-R: 4 option(1), 3 option(2), 2 option(3), 1 option(4)

---

## FROZEN PROHIBITIONS

### NEVER include in options:
- ❌ "उपरोक्त सभी" (All of the above)
- ❌ "इनमें से कोई नहीं" (None of the above)
- ❌ Duplicate options
- ❌ Outdated events (older than 24 months)

### NEVER use in question stems:
- ❌ Unverified information
- ❌ Made-up events or schemes
- ❌ Wrong dates or details

### FORMAT RULES:
- ✅ MUST use exactly 4 options (1), (2), (3), (4)
- ✅ ALL content in Hindi
- ✅ Must be factually accurate and verifiable

### ❌ ABSOLUTELY FORBIDDEN LAZY PATTERNS (Zero Violations Allowed):

1. **MSQ "All Correct" BANNED**: NEVER EVER make MSQ questions where all statements are correct
   - ❌ FORBIDDEN: Answer where ALL options A, B, C, D are correct
   - ❌ ZERO TOLERANCE: Not even 1 question out of 10 can have "all correct" answer
   - ✅ REQUIRED: EVERY MSQ must have mix of true/false statements requiring discrimination
   - ✅ REQUIRED: Create realistic false statements using misconceptions, outdated data, reversed facts

2. **A-R Option 1 Dominance**: DO NOT make majority of A-R questions have option (1)
   - ❌ FORBIDDEN: Making 60%+ of A-R questions have answer "both true, R explains A"
   - ✅ REQUIRED: Distribute answers across all 4 options (roughly 30% opt1, 30% opt2, 20% opt3, 20% opt4)
   - Create variation: independent truths, false assertions, false reasons, non-causal relationships

3. **Simplistic Current Affairs BANNED**: NEVER make trivial questions that insult intelligence
   - ❌ FORBIDDEN: Questions any layperson could answer without current affairs knowledge
   - ✅ REQUIRED: Professional-grade with specific dates, names, amounts, nuanced distinctions

**⚠️ CRITICAL: If you violate pattern #1 even ONCE, the entire question set will be REJECTED**

### EXPLANATION REQUIREMENTS:
- ✅ Mention the date/year of the event
- ✅ Provide context about the event/scheme
- ✅ Explain why other options are incorrect
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
16. ✓ Event dates and details are accurate and verifiable
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
27. ✓ Assertion-Reason: Both (A) and (R) present with standard 4 options

---

## DATE VERIFICATION CRITICAL

**For ALL questions, verify:**
✓ **Event Date**: Confirm exact date/month/year
✓ **Scheme Launch**: Verify start date and current status
✓ **Appointment**: Confirm when appointment was made
✓ **Achievement**: Verify date of achievement/award
✓ **Current Status**: Ensure scheme/position is still active
✓ **Official Source**: Cross-check with government notifications

**Pattern from actual questions:**
- "December 2022" (specific month-year)
- "2023" (year specification)
- "Recently" (within last 6-12 months)

---

## OPTION CONSTRUCTION RULES

- All 4 options must be plausible dates/locations/names
- For location questions: Use actual Rajasthan cities
- For person questions: Use 4 DIFFERENT people's names
- For scheme questions: Use realistic numbers/provisions
- Make distractors plausible (nearby cities, similar names, close numbers)

---

## ANSWER KEY BALANCE

- Distribute correct answers evenly across (1), (2), (3), (4)
- Avoid streaks of same answer

---

## COGNITIVE LOAD

- **Easy questions**: Well-known events (G-20, major schemes)
- **Balanced questions**: Specific details (dates, amounts, locations)
- **Hard questions**: Obscure awards, lesser-known appointments, specific provisions

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
- eventDate: string (optional, can be omitted)

\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "प्रश्न का हिंदी पाठ यहां",
      "questionText_en": "Full question text in English",
      "archetype": "recentEventRecall" | "multiStatementEvaluation" | "policyScheme" | "appointmentAchievement" | "assertionReason",
      "structuralForm": "standard4OptionMCQ" | "multipleSelectQuestions" | "assertionReason",
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
      "explanation": "व्याख्या - include event date, context",
      "explanation_en": "Explanation in English - include event date, context",
      "difficulty": "easy" | "medium" | "hard",
      "language": "bilingual",
      "contentDomain": "governmentScheme" | "events" | "sports" | "administrative" | "infrastructure",
      "eventDate": "2023-12" | "2024-01" // Optional: for tracking currency
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
- eventDate: string (optional, can be omitted)

\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "प्रश्न का हिंदी पाठ यहां",
      "archetype": "recentEventRecall" | "multiStatementEvaluation" | "policyScheme" | "appointmentAchievement" | "assertionReason",
      "structuralForm": "standard4OptionMCQ" | "multipleSelectQuestions" | "assertionReason",
      "cognitiveLoad": "low" | "medium" | "high",
      "correctAnswer": "1" | "2" | "3" | "4",
      "options": {
        "1": "विकल्प 1",
        "2": "विकल्प 2",
        "3": "विकल्प 3",
        "4": "विकल्प 4"
      },
      "explanation": "व्याख्या - include event date, context, and why others are wrong",
      "difficulty": "easy" | "medium" | "hard",
      "language": "hindi",
      "contentDomain": "governmentScheme" | "events" | "sports" | "administrative" | "infrastructure",
      "eventDate": "2023-12" | "2024-01" // Optional: for tracking currency
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
- Use EXACTLY 4 options per question
- Label options as (1), (2), (3), (4)
- ALL events must be from 2023-2024 period (or as specified)
- Verify all dates and details
- NO made-up events or schemes
${hasStudyMaterials ? '- Extract content from study materials but verify facts' : '- Generate authentic RPSC-quality current affairs questions from your training knowledge'}
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
✓ All events are recent (2023-2024)
✓ All facts are verifiable
✓ Dates are accurate
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
 * Complete Current Affairs Protocol
 */
export const rpscSeniorTeacherPaper1CurrentAffairsProtocol: Protocol = {
  id: 'rpsc-senior-teacher-paper1-current-affairs',
  name: 'RPSC Senior Teacher Grade II - Paper 1: Current Affairs',
  streamName: 'RPSC Senior Teacher Grade II',
  subjectName: 'Paper 1 - Current Affairs of Rajasthan',
  difficultyMappings,
  prohibitions,
  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,
    warmupPercentage: 0.10
  },
  buildPrompt: buildCurrentAffairsPrompt,
  validators,
  metadata: {
    description: 'RPSC Senior Teacher Grade II Paper 1: Current Affairs protocol - REET 2026-inspired with 3 structural formats',
    analysisSource: '2 RPSC Senior Teacher Grade II papers (OC and OB codes) + REET 2026 pattern analysis',
    version: '2.0.0',
    lastUpdated: '2025-01-18',
    examType: 'SELECTION (Merit-based) - Common Paper 1 Section',
    sectionWeightage: '~10 questions out of 100 total in Paper 1',
    note: `**NEW STRUCTURAL DISTRIBUTION (~10 questions):**
  - Standard MCQ: 30% (3Q) - REDUCED from 100%
  - Multi-Statement Evaluation (MSQ): 50% (5Q) - NEW DOMINANT (4x difficulty)
  - Assertion-Reason: 20% (2Q) - NEW (4x difficulty)

**REET 2026-INSPIRED TRANSFORMATION:**
  - Grade 2 MORE difficult than REET Grade 3
  - Difficulty Multiplier: 4-6x (vs baseline)
  - High Cognitive Load: 50% (was 0%)
  - MSQ Dominance: 50% (highest among Paper 1 sections)

**ARCHETYPE DISTRIBUTION (UPDATED):**
  - Multi-Statement Evaluation: 50% (NEW DOMINANT - scheme/event analysis)
  - Recent Event Recall: 20% (REDUCED from 50% - major events only)
  - Assertion-Reason: 10% (NEW - event-cause relationships)
  - Policy/Scheme: 10% (REDUCED from 30% - now in MSQ)
  - Appointment/Achievement: 10% (REDUCED from 20%)

**Content Distribution:**
  - Government Schemes: ~30%
  - Events/Conferences: ~25%
  - Sports/Culture: ~20%
  - Administrative: ~15%
  - Infrastructure: ~10%

**Time Frame:**
  - All events from last 12-24 months
  - Specific dates mentioned (December 2022, June 2023, etc.)
  - Current schemes as of 2023-2024

**COGNITIVE LOAD TRANSFORMATION:**
  - Low: 20% (REDUCED from 40% - well-known events)
  - Medium: 30% (REDUCED from 50% - specific details)
  - High: 50% (NEW - obscure events, complex analysis)

**Quality Characteristics:**
  - Date accuracy is CRITICAL
  - All facts must be verifiable
  - Official government sources preferred
  - All questions in Hindi
  - MSQ format requires multi-dimensional knowledge
  - A-R format requires causal understanding`
  }
}
