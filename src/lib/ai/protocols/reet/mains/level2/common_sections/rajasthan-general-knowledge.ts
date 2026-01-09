/**
 * REET Mains Level 2 - Rajasthan General Knowledge Protocol
 *
 * ⚠️  PRELIMINARY PROTOCOL (N=1 paper analyzed - requires validation)
 * Analysis Source: REET 2023 Science-Mathematics Paper
 * - Rajasthan GK Section: Q1-40 (37 questions analyzed, Q16/Q28/Q35 missing)
 * - This is the COMMON SECTION for ALL candidates regardless of specialization
 *
 * CRITICAL INSIGHT: Rajasthan GK is HEAVILY recall-dominant (67.6% factual knowledge)
 * - Most recall-intensive section in the entire paper
 * - Requires deep knowledge of Rajasthan-specific facts
 * - All questions in Hindi (primary language)
 *
 * EXAM STRUCTURE (Based on Official RSMSSB Pattern):
 * =====================================================
 * PART A: RAJASTHAN GEOGRAPHY, HISTORY & CULTURE (80 Marks, 40 questions)
 * - Rajasthan Geography, History, Culture, Rajasthani Language
 *
 * PART B: GENERAL KNOWLEDGE & EDUCATIONAL SCENARIO (50 Marks, 25 questions)
 * - General Knowledge, Current Affairs, Educational Scenario of Rajasthan, RTE Act 2009
 *
 * TOTAL: 130 Marks (65 questions, 2 marks each)
 * NOTE: This forms part of the 160-mark Common Section
 * Remaining 30 marks = Educational Psychology (20) + IT (10)
 */

import { Protocol, ProtocolConfig } from '../../../../types'
import { Question } from '../../../../../questionValidator'

/**
 * Rajasthan GK Archetype Distributions
 * Based on Q1-40 analysis (37 questions from 2023 paper)
 *
 * Key Finding: RECALL-DOMINANT (67.6%)
 * - Single-Fact Recall: 67.6% (25/37) - DOMINANT
 * - Comparative/Superlative: 16.2% (6/37)
 * - Exception/Negative: 13.5% (5/37)
 * - Fill-in-Blank: 10.8% (4/37)
 * - Definitional: 8.1% (3/37)
 * - Causal/Conceptual: 5.4% (2/37)
 * - Commonality/Synthesis: 5.4% (2/37)
 */

const rajasthanGKArchetypes = {
  balanced: {
    singleFactRecall: 0.68,          // Dominant: dates, names, places, facts
    comparative: 0.16,               // Largest, oldest, first, highest
    exceptionNegative: 0.14,         // "NOT", "does NOT", "EXCEPT"
    fillInBlank: 0.11,               // Sentence completion
    definitional: 0.08,              // "is called", "is known as"
    causal: 0.05,                    // Why/how questions
    commonality: 0.05                // "What is common in..."
  },
  easy: {
    singleFactRecall: 0.75,          // More simple recall
    comparative: 0.12,
    exceptionNegative: 0.08,
    fillInBlank: 0.10,
    definitional: 0.08,
    causal: 0.02,
    commonality: 0.02
  },
  hard: {
    singleFactRecall: 0.60,          // Less straightforward recall
    comparative: 0.18,               // More comparison questions
    exceptionNegative: 0.16,         // More negative phrasing
    fillInBlank: 0.08,
    definitional: 0.08,
    causal: 0.08,                    // More conceptual understanding
    commonality: 0.08
  }
}

/**
 * Difficulty Mappings
 */
const difficultyMappings: Protocol['difficultyMappings'] = {
  easy: {
    archetypes: rajasthanGKArchetypes.easy as any,
    structuralForms: {
      standard4OptionMCQ: 1.00
    } as any,
    cognitiveLoad: {
      lowDensity: 0.60,              // Higher proportion of easy questions
      mediumDensity: 0.30,
      highDensity: 0.10
    }
  },
  balanced: {
    archetypes: rajasthanGKArchetypes.balanced as any,
    structuralForms: {
      standard4OptionMCQ: 1.00
    } as any,
    cognitiveLoad: {
      lowDensity: 0.50,
      mediumDensity: 0.40,
      highDensity: 0.10
    }
  },
  hard: {
    archetypes: rajasthanGKArchetypes.hard as any,
    structuralForms: {
      standard4OptionMCQ: 1.00
    } as any,
    cognitiveLoad: {
      lowDensity: 0.40,
      mediumDensity: 0.45,
      highDensity: 0.15
    }
  }
}

/**
 * Prohibitions
 */
const prohibitions: string[] = [
  '⚠️  PRELIMINARY PROHIBITIONS (N=1 paper - validate with more data)',
  'NEVER use "All of the above" or "None of the above" (0% observed in Q1-40)',
  'NEVER use 5 options - MUST use exactly 4 options (A, B, C, D) (100% validated)',
  'NEVER use match-the-following format (0% observed in RajGK section)',
  'NEVER use assertion-reason format (0% observed in RajGK section)',
  'NEVER use inaccurate Rajasthan facts - factual accuracy is CRITICAL',
  'NEVER use outdated information - use current district names, schemes, policies'
]

/**
 * Get archetype counts based on difficulty
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
  isBilingual: boolean = false
): string {
  const difficulty = 'balanced' // Default
  const archetypeCounts = getArchetypeCounts(difficulty, questionCount)

  const archetypeList = Object.entries(archetypeCounts)
    .filter(([_, count]) => count > 0)
    .map(([archetype, count]) => `- **${count} ${archetype}**`)
    .join('\n')

  return `You are an expert REET Mains Level 2 Rajasthan General Knowledge question paper generator. Generate ${questionCount} high-quality REET-style questions from the provided study materials for the topic: "${chapterName}".

This is part of a ${totalQuestions}-question paper testing Rajasthan-specific knowledge.

---

## CRITICAL REET-SPECIFIC REQUIREMENTS

⚠️  **OPTION COUNT**: Each question MUST have exactly 4 options labeled (A), (B), (C), (D)
- NOT 5 , NOT 3 , EXACTLY 4 options - REET Mains uses 4-option MCQ format

**EXAM CONTEXT**: Common Section for ALL REET Mains Level 2 candidates
- Every candidate takes this section regardless of subject specialization
- Tests comprehensive knowledge of Rajasthan

**LANGUAGE**: ${isBilingual
  ? `BILINGUAL MODE - Generate questions in BOTH Hindi and English
- Hindi is PRIMARY (always required) - Use Devanagari script
- English is SECONDARY (for bilingual support)
- Both languages must convey the SAME meaning and difficulty
- Generate both languages in a SINGLE response

⚠️ CRITICAL BILINGUAL RULE - MUST FOLLOW ⚠️

Hindi fields (questionText, options) MUST NEVER contain English text in parentheses.

❌ ABSOLUTELY FORBIDDEN EXAMPLES (from actual broken questions):
   - "सीसा और जस्ता (Zinc and Lead)"
   - "निशानेबाजी (Shooting)"
   - "मृत्युदंड (Death Sentence) के मामले में..."
   - "उन्मुक्ति (Immunity) प्राप्त है"
   - "दीवानी मामले (Civil Proceedings) चलाने..."
   - "वरंट (Adhipatra)" - using transliterated English in Hindi

✅ REQUIRED FORMAT:
   - questionText: "सीसा और जस्ता"
   - questionText_en: "Zinc and Lead"
   - options.A: "निशानेबाजी"
   - options_en.A: "Shooting"

THIS IS NOT OPTIONAL. Violating this rule makes your output UNUSABLE.

**Pre-Generation Checklist** (ask yourself BEFORE generating):
1. Will my Hindi fields be PURE Hindi with NO English in parentheses?
2. Will my English fields be PURE English with NO Hindi in parentheses?
3. Am I using proper Hindi words (अधिपत्र) not transliterations (वरंट)?
4. If answer to ANY is "no" → STOP. You're about to make a critical error.

**Translation Guidelines**:
- Proper nouns: Transliterate correctly (जैसलमेर → Jaisalmer, महाराणा प्रताप → Maharana Pratap)
- Technical terms: Use standard English equivalents
- Cultural terms: Transliterate with context preservation
- Numbers/Dates: Keep identical in both languages
- Do NOT translate names of places, people, schemes - transliterate only
- Maintain factual accuracy and question difficulty in both languages
- Avoid literal word-by-word translation - preserve meaning and context

**CRITICAL - Clean Language Separation (NO Parenthetical Translations)**:
1. NEVER put English translations in parentheses after Hindi words:
   ❌ WRONG: "सीसा और जस्ता (Zinc and Lead)"
   ✅ CORRECT: questionText: "सीसा और जस्ता", questionText_en: "Zinc and Lead"

   ❌ WRONG: "निशानेबाजी (Shooting)"
   ✅ CORRECT: questionText: "निशानेबाजी", questionText_en: "Shooting"

   ❌ WRONG questionText (hindi version): "मृत्युदंड (Death Sentence) के मामले में राज्यपाल और राष्ट्रपति की शक्तियों में क्या अंतर है?"
   ✅ CORRECT questionText (hindi version): "मृत्युदंड के मामले में राज्यपाल और राष्ट्रपति की शक्तियों में क्या अंतर है?"

   ❌ WRONG questionText (hindi version): "अनुच्छेद 361 के तहत राज्यपाल को कौन सी उन्मुक्ति (Immunity) प्राप्त है?"
   ✅ CORRECT questionText (hindi version): "अनुच्छेद 361 के तहत राज्यपाल को कौन सी उन्मुक्ति प्राप्त है?"

   ❌ WRONG questionText (hindi version): "राज्यपाल के विरुद्ध दीवानी मामले (Civil Proceedings) चलाने के लिए कितने समय की पूर्व सूचना आवश्यक है?"
   ✅ CORRECT questionText (hindi version): "राज्यपाल के विरुद्ध दीवानी मामले चलाने के लिए कितने समय की पूर्व सूचना आवश्यक है?"


2. NEVER put Hindi/Sanskrit transliterations in parentheses after English words:
   ❌ WRONG: questionText_en: "Warrant (Adhipatra)"
   ✅ CORRECT: questionText_en: "Warrant", questionText: "अधिपत्र"

3. Use proper Hindi/Sanskrit words, NOT English transliterations in Hindi text:
   ❌ WRONG: "वरंट (Adhipatra)" - using transliterated English
   ✅ CORRECT: "अधिपत्र" - proper Hindi/Sanskrit word

4. Keep each language pure and separate - use the dedicated fields:
   - questionText = Pure Hindi only (proper Hindi words, not transliterations)
   - questionText_en = Pure English only (no Hindi/Sanskrit in parentheses)
   - options = Pure Hindi only
   - options_en = Pure English only

5. For legal/administrative terms, use proper Hindi equivalents:
   - English: "Warrant" → Hindi: "अधिपत्र" (NOT "वरंट")
   - English: "Governor" → Hindi: "राज्यपाल" (NOT "गवर्नर")

⚠️ MANDATORY POST-GENERATION VALIDATION ⚠️

BEFORE returning your JSON, perform this validation:

**Step 1**: Search for "questionText" in your JSON
   - Does it contain ANY English words in (parentheses)? → If YES: DELETE the parentheses part immediately

**Step 2**: Search for "options" and check all A, B, C, D values
   - Does ANY option contain English in (parentheses)? → If YES: DELETE the parentheses part immediately

**Step 3**: Examples of what to find and fix:
   - FIND: "मृत्युदंड (Death Sentence) के मामले में" → FIX TO: "मृत्युदंड के मामले में"
   - FIND: "उन्मुक्ति (Immunity) प्राप्त है" → FIX TO: "उन्मुक्ति प्राप्त है"
   - FIND: "दीवानी मामले (Civil Proceedings)" → FIX TO: "दीवानी मामले"
   - FIND: "निशानेबाजी (Shooting)" → FIX TO: "निशानेबाजी"

**Step 4**: Check for English transliterations in Hindi text:
   - FIND: "वरंट" → FIX TO: "अधिपत्र" (use proper Hindi word)
   - FIND: "गवर्नर" → FIX TO: "राज्यपाल" (use proper Hindi word)

**Step 5**: If you found and fixed ANY violations → Good, now your JSON is correct
   - If you found ZERO violations → Perfect, your JSON is already correct

DO NOT SKIP THIS VALIDATION. Your output will be rejected if Hindi fields contain English parentheses or transliterations.`
  : `ALL questions MUST be in Hindi (हिंदी)
- Use Devanagari script for all questions and options
- Primary language for REET exam in Rajasthan is Hindi (हिंदी)`}

---

## EXAM STRUCTURE

**PART A: RAJASTHAN GEOGRAPHY, HISTORY & CULTURE (80 Marks, 40 questions)**
Content domains:
- **Geography**: Districts, rivers, lakes, soil types, climate zones, irrigation projects, natural resources
- **History**: Rulers, dynasties, forts, palaces, battles, freedom movements, historical events
- **Culture**: Festivals, folk arts, music, dance, ornaments, traditions, fairs, languages
- **Rajasthani Language**: Basic knowledge, cultural significance

**PART B: GENERAL KNOWLEDGE & EDUCATIONAL SCENARIO (50 Marks, 25 questions)**
Content domains:
- **General Knowledge**: National and state-level current affairs
- **Current Affairs**: Recent government schemes, policies, initiatives (as of 2023)
- **Educational Scenario**: Educational statistics, programs in Rajasthan
- **RTE Act 2009**: Key provisions, implementation in Rajasthan

---

## QUESTION ARCHETYPE DISTRIBUTION (Target Counts)

${archetypeList}

### Archetype Definitions for Rajasthan GK:

**Single-Fact Recall (${archetypeCounts.singleFactRecall || 0} required - DOMINANT 68%):**
- Direct factual knowledge about Rajasthan
- Examples: "Which district...", "Who was...", "When did...", "What is the capital of..."
- Requires memorization of specific facts: dates, names, places, numbers
- **Pattern from 2023**: Q1 (district with vertical sun rays), Q2 (Suvanagiri fort), Q7 (oldest national park), Q9 (Panna Dhai), Q39 (Kaila Devi Temple location)

**Comparative/Superlative (${archetypeCounts.comparative || 0} required - 16%):**
- Asks for largest, smallest, oldest, highest, lowest, first, last
- Requires knowing relative measures or rankings
- Examples: "Which has the LARGEST...", "The OLDEST...", "LOWEST sex ratio..."
- **Pattern from 2023**: Q7 (oldest national park), Q12 (life expectancy), Q19 (largest canal), Q22 (lowest ST sex ratio), Q33 (smallest unit)

**Exception/Negative Phrasing (${archetypeCounts.exceptionNegative || 0} required - 14%):**
- Uses "NOT", "does NOT", "is NOT", "EXCEPT", "All EXCEPT"
- Tests understanding through exclusion
- **CRITICAL**: Easy to make careless errors - requires careful reading
- **Pattern from 2023**: Q4 (NOT non-conventional energy), Q21 (does NOT pass through), Q27 (NOT related to Kalibangan), Q31 (NOT inland drainage)

**Fill-in-Blank (${archetypeCounts.fillInBlank || 0} required - 11%):**
- Sentence with missing word/phrase
- May be in Hindi or English
- **Pattern from 2023**: Q6 (Arju tree in ___ district), Q10 (Meenakari from ___), Q14 (Madaar Dam on ___ river)

**Definitional/Terminology (${archetypeCounts.definitional || 0} required - 8%):**
- "is called", "is known as", "term for", "refers to"
- Tests knowledge of terminology
- **Pattern from 2023**: Q13 (fort with trenches is called), Q32 (tribal head is known as)

**Causal/Conceptual (${archetypeCounts.causal || 0} required - 5%):**
- Requires understanding WHY or HOW
- Not just what, but the reason or mechanism
- **Pattern from 2023**: Q17 (fertile due to nitrate), Q37 (nitrogen fixation like pulses)

**Commonality/Synthesis (${archetypeCounts.commonality || 0} required - 5%):**
- Given multiple items, identify common feature
- Requires knowing multiple facts and synthesizing
- **Pattern from 2023**: Q29 (what's common in 4 locations), Q40 (pair of districts with red-yellow soil)

---

## CONTENT DOMAINS & ACCURACY REQUIREMENTS

### GEOGRAPHY (Critical Accuracy Required):
**Districts:**
- 50 districts (as of 2023) - use current names
- District headquarters, notable features
- Largest/smallest by area/population

**Physical Features:**
- Rivers: Luni, Chambal, Banas, Mahi, Sabarmati, etc.
- Lakes: Sambhar, Pushkar, Jaisamand, etc.
- Hills: Aravalli range, peaks
- Soil types: Red-yellow, brown-sandy, alluvial

**Climate & Resources:**
- Climate zones, rainfall patterns
- Minerals: Marble, sandstone, copper, zinc
- Irrigation projects, dams, canals

### HISTORY (Factual Accuracy Critical):
**Rulers & Dynasties:**
- Prithviraj Chauhan, Rana Sanga, Maharana Pratap
- Rajput dynasties, kingdoms
- Important rulers and their contributions

**Forts & Monuments:**
- Major forts: Chittorgarh, Jaisalmer, Mehrangarh, Amber, Ranthambore
- Palaces, temples, step-wells
- Historical significance

**Historical Events:**
- Freedom movement in Rajasthan
- Important battles, treaties
- Historical dates and significance

### CULTURE (Traditional & Current):
**Folk Arts:**
- Music: Maand, Panihari, Kalbeliya
- Dance: Ghoomar, Kalbeliya, Kachhi Ghodi
- Paintings: Miniature, Phad, Mandana

**Festivals & Fairs:**
- Major festivals: Gangaur, Teej, Pushkar Fair
- Local celebrations, traditional events

**Ornaments & Traditions:**
- Traditional jewelry: Rakhdi, Aad, Bajuband, Timaniya
- Worn on specific body parts (ear, nose, wrist, etc.)
- **Pattern from 2023**: Q11 (Chuni and Bari on head), Q24 (Punchi on nose)

### DEMOGRAPHICS (Census 2011 Data):
- Population statistics
- Literacy rates (male, female, overall)
- Sex ratio (overall, SC, ST)
- Life expectancy at birth

### CURRENT AFFAIRS & SCHEMES (As of 2023):
**Government Schemes:**
- Educational schemes: Baal Gopal Yojana, etc.
- Social welfare: Kanyadan Yojana, Palanhar Yojana
- Employment: Indira Gandhi Rojgar Guarantee
- Rural development, infrastructure projects

**Educational Framework:**
- RTE Act 2009 provisions
- NEP 2020 guidelines
- Rajasthan-specific educational initiatives

---

## STRUCTURAL FORMAT

**STANDARD 4-OPTION MCQ (100% of questions):**
\`\`\`
Question stem here?
(A) First option
(B) Second option
(C) Third option
(D) Fourth option
\`\`\`

**HINDI FORMAT** (ALL questions):
\`\`\`
प्रश्न का हिंदी पाठ यहां?
(A) पहला विकल्प
(B) दूसरा विकल्प
(C) तीसरा विकल्प
(D) चौथा विकल्प
\`\`\`

**Example (Rajasthan GK in Hindi):**
\`\`\`
राजस्थान का सबसे बड़ा जिला कौन सा है?
(A) जैसलमेर
(B) बाड़मेर
(C) बीकानेर
(D) जोधपुर
\`\`\`

---

## FROZEN PROHIBITIONS (Zero Violations Allowed)

### NEVER include in options:
- ❌ "None of the above" (0% observed)
- ❌ "All of the above" (0% observed)
- ❌ Subset inclusion
- ❌ Non-mutually exclusive options
- ❌ **DUPLICATE OPTIONS - All 4 options MUST be textually unique**
  - WRONG: (A) राम शर्मा (B) सीता देवी (C) मोहन सिंह (D) मोहन सिंह ← DUPLICATE!
  - CORRECT: All 4 options have different text
- ❌ Identical names/values in multiple options (even with different labels)
- **CRITICAL FOR NAME-BASED QUESTIONS**: When options contain people's names, ensure all 4 are DIFFERENT individuals
  - Example: Governor question with options about rulers - all 4 must be different people
  - NEVER repeat the same person's name in two options

- ❌ **NAME VARIATION DUPLICATES - SAME PERSON IN DIFFERENT FORMATS**
  - **MOST CRITICAL**: The same individual appearing with different name formats is UNACCEPTABLE
  - ❌ WRONG: (A) शैलेंद्र कुमार सिंह (full name) ... (D) एस.के. सिंह (initials) ← SAME PERSON!
    - "एस.के. सिंह" is just "S.K. Singh" which stands for "Shailendra Kumar Singh"
    - These are NOT different people - it's the SAME individual with full name vs initials
  - ❌ WRONG: Full name vs abbreviated forms of the SAME person
    - Example: (A) दरबारा सिंह (B) डी. सिंह ← SAME PERSON!
    - Example: (A) निर्मलचंद्र जैन (B) एन.सी. जैन ← SAME PERSON!
  - ❌ WRONG: Same person with/without titles
    - Example: (A) डॉ. करणी सिंह (B) करणी सिंह ← SAME PERSON!
  - ✅ CORRECT: All 4 options are DIFFERENT individuals
    - Example: (A) दरबारा सिंह (B) निर्मलचंद्र जैन (C) शैलेंद्र कुमार सिंह (D) मदनलाल खुराना
    - All 4 are completely different people (not same person with different formats)

  **VERIFICATION RULE**: Before finalizing, ask yourself: "Are all 4 options different INDIVIDUALS, or is the same person appearing in multiple formats?"

### NEVER use in question stems:
- ❌ Meta-references: "according to NCERT", "as per study material"
- ❌ Inaccurate Rajasthan facts (CRITICAL - factual errors are unacceptable)
- ❌ Outdated information (use current district names, recent schemes)

### FORMAT RULES:
- ✅ MUST use exactly 4 options (A, B, C, D)
- ✅ Bilingual questions are acceptable and encouraged
- ✅ MUST be factually accurate for all Rajasthan-specific content

### EXPLANATION REQUIREMENTS (MANDATORY):
- ✅ Explanations MUST be concrete, factual, and helpful
- ✅ Explain WHY the correct answer is right
- ✅ Explain WHY each incorrect option is wrong
- ❌ **NEVER write meta-commentary about the question quality**
- ❌ **NEVER admit errors in the question within the explanation**
- ❌ **NEVER write "this option should be X" or "the question has issues"**
- **If you detect an error while writing explanation, FIX THE QUESTION - don't document the error**

**WRONG Explanation Example** (NEVER do this):
"यह विकल्प D को 'मदनलाल खुराना' होना चाहिए" ← Admitting error in explanation!

**CORRECT Explanation Example**:
"एस.के. सिंह राजस्थान के राज्यपाल नहीं रहे हैं। सही राज्यपालों में दरबारा सिंह, निर्मलचंद जैन, और शैलेंद्र कुमार सिंह शामिल हैं।"

---

## CRITICAL EXAMPLE - NAME VARIATION DUPLICATES (NEVER DO THIS)

**BAD QUESTION** (from actual generation error - Q26):

Q26. निम्न में से किस राज्यपाल की मृत्यु पद पर रहते हुए नहीं हुई?
(A) दरबारा सिंह
(B) निर्मलचंद्र जैन
(C) शैलेंद्र कुमार सिंह ← FULL NAME
(D) एस.के. सिंह ← INITIALS OF THE SAME PERSON!

**THE ACTUAL ERROR** (from explanation):
The generated explanation revealed: "एस.के. सिंह ही शैलेंद्र कुमार सिंह हैं"
Translation: "S.K. Singh IS Shailendra Kumar Singh"
- This means options C and D are THE SAME PERSON in different formats!
- C: Full name (शैलेंद्र कुमार सिंह)
- D: Initials (एस.के. = S.K. = Shailendra Kumar)

**WHY THIS IS UNACCEPTABLE**:
- Options C and D are the SAME INDIVIDUAL appearing in two different name formats
- This is a NAME VARIATION DUPLICATE - much more subtle than textual duplicates
- The explanation ADMITTED the error by stating they are the same person (NEVER do this)
- Makes the question invalid and unsolvable
- Shows the AI generated options without verifying individual uniqueness

**HOW TO FIX**:
- Ensure all 4 governor names are DIFFERENT individuals (not the same person with different name formats)
- Correct example: (A) दरबारा सिंह (B) निर्मलचंद्र जैन (C) शैलेंद्र कुमार सिंह (D) मदनलाल खुराना
- All 4 options are now DIFFERENT PEOPLE (not same person as full name vs initials)

**FROZEN RULE**: Before finalizing ANY question with names, verify all options contain DIFFERENT individuals.

---

## RAJASTHAN-SPECIFIC VALIDATION CHECKLIST

Before finalizing questions, verify:
✓ **Geography**: District names are current (50 districts as of 2023)
✓ **History**: Historical dates and events are accurate
✓ **Culture**: Festival names, ornament names, folk arts are correct
✓ **Demographics**: Use Census 2011 data (or latest available)
✓ **Schemes**: Government schemes are current as of 2023
✓ **Districts**: Proper district names (not old/merged districts)
✓ **Rivers/Lakes**: Correct names and locations
✓ **Forts/Monuments**: Accurate names and historical context

---

## OPTION CONSTRUCTION RULES

- **All 4 options MUST be textually unique (no duplicates - even single character difference matters)**
- **Name-based questions**: Use 4 DIFFERENT people's names - never repeat a name
- All 4 options should be approximately equal length
- All 4 options should use the same grammatical structure
- All 4 options should be plausible (not obviously wrong)
- For Rajasthan questions: Use authentic Rajasthan options (real districts, real rulers, real schemes)
- Make distractors plausible using DIFFERENT but related entities (different governors, different forts, different schemes)
- All questions and options MUST be in Hindi with proper Devanagari script

### HINDI LANGUAGE REQUIREMENTS:
- Use proper Devanagari script (देवनागरी लिपि)
- Use formal/standard Hindi (शुद्ध हिंदी) not colloquial
- Technical terms can use English words in Devanagari (e.g., "रेलवे", "यूनिवर्सिटी")
- Numbers can be in Devanagari (०१२३४५६७८९) or Arabic (0123456789) - prefer Arabic for consistency
- Ordinal numbers < 10: Use Hindi words ONLY (पहला/प्रथम, दूसरा/द्वितीय, तीसरा/तृतीय) - NEVER "1ला", "2रा", "3रा"
- Ordinal numbers ≥ 10: Using "वाँ" suffix is correct (7वाँ, 42वाँ, 44वाँ)
- Maintain grammatical correctness (व्याकरण शुद्धता)

---

## ANSWER KEY BALANCE

- Distribute correct answers approximately evenly: ~25% each for (A), (B), (C), (D)
- Avoid long streaks of same answer (max 3 consecutive recommended)
- Randomize answer positions naturally

---

## COGNITIVE LOAD SEQUENCING

- **First ${Math.ceil(questionCount * 0.1)} questions**: WARM-UP ZONE - Use low-density, Single-Fact Recall
- **Middle questions**: Mix of densities based on archetype
- **High-density**: Comparative questions, Commonality/Synthesis, Negative phrasing (requires careful reading)

---

## OUTPUT FORMAT (JSON Schema)

${isBilingual
  ? `**BILINGUAL FORMAT** (Generate both Hindi and English):

\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "प्रश्न का हिंदी पाठ यहां (Full question in Hindi Devanagari)",
      "questionText_en": "Full question text in English",
      "archetype": "singleFactRecall" | "comparative" | "exceptionNegative" | "fillInBlank" | "definitional" | "causal" | "commonality",
      "structuralForm": "standard4OptionMCQ",
      "cognitiveLoad": "low" | "medium" | "high",
      "correctAnswer": "A" | "B" | "C" | "D",
      "options": {
        "A": "विकल्प A हिंदी में (Option A in Hindi)",
        "B": "विकल्प B हिंदी में (Option B in Hindi)",
        "C": "विकल्प C हिंदी में (Option C in Hindi)",
        "D": "विकल्प D हिंदी में (Option D in Hindi)"
      },
      "options_en": {
        "A": "Option A in English",
        "B": "Option B in English",
        "C": "Option C in English",
        "D": "Option D in English"
      },
      "explanation": "व्याख्या हिंदी में (Explanation in Hindi)",
      "explanation_en": "Clear explanation in English",
      "difficulty": "easy" | "medium" | "hard",
      "language": "bilingual",
      "contentDomain": "geography" | "history" | "culture" | "demographics" | "currentAffairs" | "education" | "rteAct"
    }
  ]
}
\`\`\``
  : `**MONOLINGUAL FORMAT** (Hindi only):

\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "प्रश्न का हिंदी पाठ यहां (Full question in Hindi)",
      "archetype": "singleFactRecall" | "comparative" | "exceptionNegative" | "fillInBlank" | "definitional" | "causal" | "commonality",
      "structuralForm": "standard4OptionMCQ",
      "cognitiveLoad": "low" | "medium" | "high",
      "correctAnswer": "A" | "B" | "C" | "D",
      "options": {
        "A": "विकल्प A हिंदी में",
        "B": "विकल्प B हिंदी में",
        "C": "विकल्प C हिंदी में",
        "D": "विकल्प D हिंदी में"
      },
      "explanation": "व्याख्या हिंदी में",
      "difficulty": "easy" | "medium" | "hard",
      "language": "hindi",
      "contentDomain": "geography" | "history" | "culture" | "demographics" | "currentAffairs" | "education" | "rteAct"
    }
  ]
}
\`\`\``}

---

## FINAL INSTRUCTIONS

Generate ${questionCount} questions now following ALL rules above.

⚠️  **CRITICAL**:
- Use EXACTLY 4 options per question (NOT 5)
- Factual accuracy for Rajasthan content is MANDATORY
- Extract content from study materials but verify facts
- NO meta-references ("according to", "as per material")
${isBilingual
  ? `- Generate BOTH Hindi and English in SINGLE response
- Include questionText + questionText_en, options + options_en, explanation + explanation_en
- Set "language": "bilingual" in each question
- Ensure both languages convey identical meaning and difficulty`
  : `- ALL content in Hindi (Devanagari script)
- Set "language": "hindi" in each question`}
- Return ONLY valid JSON

**QUALITY VERIFICATION** (check before returning):
✓ All 4 options are textually unique - NO DUPLICATES (character-by-character check)
✓ For name-based questions: All 4 options contain DIFFERENT people's names
✓ Explanation is concrete and factual - NO meta-commentary about errors
✓ Explanation explains correct answer AND why wrong options are incorrect
✓ No option says "None of the above" or "All of the above"
✓ All Rajasthan facts are accurate and current

Return the JSON now:`
}

/**
 * Validators
 */
import {
  validateProhibitedPatterns,
  validateAnswerKeyBalance,
  validateCognitiveLoad
} from '../../../../../questionValidator'

const validators: Protocol['validators'] = [
  (questions: Question[]) => {
    const errors: string[] = []

    // Validate 4-option format (CRITICAL for REET)
    for (const q of questions) {
      const optionKeys = Object.keys(q.options)
      if (optionKeys.length !== 4) {
        errors.push(`Question ${q.questionNumber}: Must have exactly 4 options (found ${optionKeys.length}). REET uses 4-option format, not 5.`)
      }
      if (!optionKeys.every(k => ['A', 'B', 'C', 'D'].includes(k))) {
        errors.push(`Question ${q.questionNumber}: Options must be labeled A, B, C, D`)
      }
    }

    // Standard prohibitions
    for (const q of questions) {
      errors.push(...validateProhibitedPatterns(q))
    }

    return errors
  },
  (questions: Question[]) => {
    const errors: string[] = []
    const devanagariPattern = /[\u0900-\u097F]/

    // Validate bilingual questions (if any question has language: 'bilingual')
    for (const q of questions) {
      if (q.language === 'bilingual') {
        // Check English question text exists
        if (!q.questionText_en || q.questionText_en.trim().length === 0) {
          errors.push(`Question ${q.questionNumber}: Bilingual question missing English translation (questionText_en)`)
        }

        // Check English options exist and match Hindi options count
        if (!q.options_en || typeof q.options_en !== 'object') {
          errors.push(`Question ${q.questionNumber}: Bilingual question missing English options (options_en)`)
        } else {
          const hindiKeys = Object.keys(q.options)
          const englishKeys = Object.keys(q.options_en)
          if (hindiKeys.length !== englishKeys.length) {
            errors.push(`Question ${q.questionNumber}: Mismatch between Hindi (${hindiKeys.length}) and English (${englishKeys.length}) option counts`)
          }
          // Check English options have no Devanagari
          for (const [key, value] of Object.entries(q.options_en)) {
            if (devanagariPattern.test(value)) {
              errors.push(`Question ${q.questionNumber}: English option ${key} contains Devanagari script`)
            }
          }
        }

        // Check English explanation exists
        if (!q.explanation_en || q.explanation_en.trim().length === 0) {
          errors.push(`Question ${q.questionNumber}: Bilingual question missing English explanation (explanation_en)`)
        }

        // Validate English content doesn't contain Devanagari
        if (q.questionText_en && devanagariPattern.test(q.questionText_en)) {
          errors.push(`Question ${q.questionNumber}: English questionText contains Devanagari script`)
        }
        if (q.explanation_en && devanagariPattern.test(q.explanation_en)) {
          errors.push(`Question ${q.questionNumber}: English explanation contains Devanagari script`)
        }

        // Validate Hindi content contains Devanagari
        if (!devanagariPattern.test(q.questionText)) {
          errors.push(`Question ${q.questionNumber}: Hindi questionText missing Devanagari script`)
        }
      }
    }

    return errors
  },
  validateAnswerKeyBalance,
  validateCognitiveLoad
]

/**
 * Complete REET Mains Level 2 Rajasthan GK Protocol
 */
export const reetMainsLevel2RajasthanGKProtocol: Protocol = {
  id: 'reet-mains-level2-rajasthan-gk',
  name: 'REET Mains Level 2 - Rajasthan General Knowledge',
  streamName: 'REET Mains Level 2',
  subjectName: 'Rajasthan General Knowledge',
  difficultyMappings,
  prohibitions,
  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,
    warmupPercentage: 0.10
  },
  buildPrompt: buildRajasthanGKPrompt,
  validators,
  metadata: {
    description: 'REET Mains Level 2 Rajasthan General Knowledge protocol - Common Section for all candidates',
    analysisSource: '⚠️  PRELIMINARY: REET 2023 Science-Mathematics paper Q1-40 (37 questions analyzed)',
    version: '1.0.0-preliminary',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based) - Common Section',
    sectionWeightage: 'Common Section - 130 marks (Part A: Geography/History/Culture 80m + Part B: GK/Current Affairs/RTE 50m)',
    note: `⚠️  CONFIDENCE: LOW (N=1 paper - requires validation with 2-3 more papers)

DISCOVERY NOTES:

**Rajasthan GK (Q1-40, N=37):** RECALL-DOMINANT
  - Single-Fact Recall: 67.6% (25/37) - HIGHEST in entire paper
  - Comparative/Superlative: 16.2% (6/37)
  - Exception/Negative: 13.5% (5/37)
  - Fill-in-Blank: 10.8% (4/37)
  - Definitional: 8.1% (3/37)
  - Causal/Conceptual: 5.4% (2/37)
  - Commonality/Synthesis: 5.4% (2/37)

**Content Distribution:**
  - Geography: ~30% (districts, rivers, soil, climate)
  - History: ~25% (rulers, forts, events)
  - Culture: ~20% (festivals, ornaments, traditions)
  - Demographics: ~10% (census data)
  - Current Affairs: ~10% (schemes, policies)
  - Educational Policy: ~5% (RTE Act)

**Validated Patterns:**
  - Standard 4-option MCQ: 100% (37/37 questions)
  - Bilingual questions: ~20% observed
  - No "All/None of above": 0%
  - No match-the-following: 0%
  - No assertion-reason: 0%

**Quality Characteristics:**
  - Factual accuracy is CRITICAL
  - Requires deep Rajasthan-specific knowledge
  - Mix of Hindi/English questions acceptable
  - Common Section - taken by ALL candidates regardless of specialization`
  }
}
