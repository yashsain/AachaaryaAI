/**
 * REET Mains Level 2 - Educational Psychology Protocol (Common Section)
 *
 * This is part of the COMMON SECTION for ALL REET Mains Level 2 candidates.
 * Every candidate must take this section regardless of subject specialization.
 *
 * EXAM STRUCTURE (Based on Official RSMSSB Pattern):
 * =====================================================
 *
 * EDUCATIONAL PSYCHOLOGY (20 Marks)
 * - Child Development & Pedagogy
 * - Learning Theories
 * - Personality & Individual Differences
 * - Educational Psychology concepts
 * - Classroom Management
 * - Assessment & Evaluation
 *
 * PART OF: 160-mark Common Section
 * - Rajasthan GK Part A: 80 marks
 * - Rajasthan GK Part B: 50 marks
 * - Educational Psychology: 20 marks ← THIS PROTOCOL
 * - Information Technology: 10 marks
 *
 * Question Format:
 * - Multiple Choice Questions (4 options)
 * - Graduation level difficulty
 * - Negative marking applicable
 */

import { Protocol, ProtocolConfig } from '../../../../types'
import { getArchetypeCounts, getStructuralFormCounts } from '@/lib/ai/difficultyMapper'

/**
 * Build comprehensive prompt for Educational Psychology question generation
 */
function buildEducationalPsychologyPrompt(
  config: ProtocolConfig,
  chapterName: string,
  questionCount: number,
  totalQuestions: number
): string {
  const archetypeCounts = getArchetypeCounts(config, questionCount)
  const structuralCounts = getStructuralFormCounts(config, questionCount)

  return `You are an expert REET Mains Level 2 Educational Psychology question paper generator. Generate ${questionCount} high-quality questions from the provided study materials for the topic: "${chapterName}".

This is part of a ${totalQuestions}-question paper. Generate questions following the REET Mains Educational Psychology protocol strictly.

---

## EXAM CONTEXT

**REET Mains Level 2 - Educational Psychology** is part of the Common Section (160 marks total) that ALL candidates must take regardless of subject specialization.

**Coverage (20 marks, 10 questions):**
- Child Development & Pedagogy
- Learning Theories (Behaviorism, Cognitivism, Constructivism)
- Personality & Individual Differences
- Educational Psychology concepts
- Classroom Management
- Assessment & Evaluation

**Difficulty Level:** Graduation level
**Question Format:** Multiple Choice Questions (4 options)
**Negative Marking:** Applicable
**Alignment:** NCF (National Curriculum Framework) and NEP (National Education Policy) principles

---

## QUESTION ARCHETYPE DISTRIBUTION (Target Counts)

Generate exactly:
- **${archetypeCounts.directRecall} Direct Recall questions**: Definitions, terminology, stages of development (e.g., "Piaget's stages", "Vygotsky's ZPD", "Bloom's Taxonomy levels"). Focus on factual knowledge recall.
- **${archetypeCounts.theoryAttribution || 0} Theory Attribution questions**: "Who proposed...?", "According to [Psychologist], ...", "Which psychologist is associated with...?" Ask about authorship of theories and concepts (e.g., "Spearman's 'g' factor", "Maslow's hierarchy", "Gardner's Multiple Intelligences").
- **${archetypeCounts.directApplication} Direct Application questions**: Apply psychological theories to classroom scenarios - identify learning style from behavior, suggest appropriate teaching method, recognize developmental stage from description. Use scenario-based contexts.
- **${archetypeCounts.discriminator} Conceptual Discriminator questions**: Differentiate similar theories (Piaget vs Vygotsky), distinguish assessment types (formative vs summative), identify subtle differences between psychological concepts.
- **${archetypeCounts.exceptionOutlier} Exception/Outlier Logic questions**: Identify exceptions to psychological principles, incorrect statements, outliers in learning patterns, limitations of specific theories. Often use "Which is NOT..." phrasing.
- **${archetypeCounts.calculationNumerical || 0} Calculation/Numerical questions**: Numerical calculations like IQ formula (Mental Age / Chronological Age × 100), statistical concepts, age-based developmental stages.

Every question must fall into exactly ONE archetype category.

---

## STRUCTURAL FORMS DISTRIBUTION (Target Counts)

Generate exactly:
- **${structuralCounts.standardMCQ} Standard 4-Option MCQ**: Traditional single stem with 4 options A, B, C, D. Direct, concise question followed by 4 mutually exclusive options.
- **${structuralCounts.scenarioBasedMCQ || 0} Scenario-Based MCQ**: Present a classroom situation, student behavior, or teaching context (2-3 sentences), then ask a question. Example: "Neha is watching the latest movie 'Drishyam-2' since she wants to know what happens to hero and his family. This is the best example of -"
- **${structuralCounts.matchFollowing || 0} Match-the-Following**: Always use 4×4 matrix with coded options (see template below). Rare format - use sparingly.
- **${structuralCounts.negativePhrasing} Negative Phrasing**: Use "Which is NOT correct", "incorrect statement", "Which of the following is not related to..." format. Common format for exception/outlier questions.

Every question must use exactly ONE structural form.

---

## STRUCTURAL FORM TEMPLATES (Use Exact Formats)

### Match-the-Following Template (RARE - Use only if allocated):
**Note**: This format is RARE in actual REET Mains Ed Psych papers (only ~2% of questions). Only use if structuralCounts.matchFollowing > 0.

**FROZEN RULE**: The questionText field MUST contain the COMPLETE matrix showing Column I and Column II items, followed by the exact ending phrase.

Display Format (what students see):
\`\`\`
Match Column I with Column II:

Column I                          Column II
A. [Psychologist/Theory 1]        I. [Concept/Contribution 1]
B. [Psychologist/Theory 2]        II. [Concept/Contribution 2]
C. [Psychologist/Theory 3]        III. [Concept/Contribution 3]
D. [Psychologist/Theory 4]        IV. [Concept/Contribution 4]

Choose the correct answer from the options given below:
(1) A-III, B-I, C-IV, D-II
(2) A-I, B-II, C-III, D-IV
(3) A-II, B-IV, C-I, D-III
(4) A-IV, B-III, C-II, D-I
\`\`\`

**CRITICAL**: Put the ENTIRE matrix (Column I, Column II, all A-D and I-IV items) INSIDE questionText. Options field ONLY contains coded combinations like "A-III, B-I, C-IV, D-II".

### Scenario-Based MCQ Template (Common Format - ~16% of questions):
Present a real-life classroom or student behavior scenario, then ask for analysis/identification.

Example 1 (Motivation):
\`\`\`
Neha is watching the latest movie "Drishyam-2" since she wants to know what happens to hero and his family. This is the best example of -
(1) Intrinsic motivation
(2) Extrinsic motivation
(3) Both Intrinsic and Extrinsic motivation
(4) Neither Intrinsic nor Extrinsic motivation
\`\`\`

Example 2 (Defense Mechanism):
\`\`\`
An eight years old child crawls like his younger infant brother. This is an example of -
(1) Regression
(2) Repression
(3) Rationalization
(4) Compensation
\`\`\`

Example 3 (Conflict):
\`\`\`
Ramesh doesn't like to participate in family gathering because every time he doesn't want to disappoint his mother. The conflict here is –
(1) Avoidance – Avoidance
(2) Approach – Approach
(3) Approach – Avoidance
(4) Dual Approach – Avoidance
\`\`\`

---

## CO-OCCURRENCE RULES (Apply Strictly)

- **Theory Attribution archetype** → STRONGLY prefer Standard MCQ format (e.g., "Who proposed...?", "According to Piaget...")
- **Exception/Outlier archetype** → STRONGLY prefer Negative Phrasing format (e.g., "Which is NOT...", "incorrect statement")
- **Direct Application archetype** → STRONGLY prefer Scenario-Based MCQ format (classroom situations, student behaviors)
- **Match-the-Following format** → STRONGLY prefer Direct Recall archetype content (psychologists with theories, stages with ages, concepts with definitions)
- **Calculation/Numerical archetype** → MUST use Standard MCQ format with numerical problem in stem

---

## COGNITIVE LOAD SEQUENCING

- **First ${config.cognitiveLoad.warmupCount} questions**: WARM-UP ZONE - Use low-density, Direct Recall only (short stems, simple definitions, basic terminology)
- **Middle questions**: Mix of densities, but NEVER place more than 2 high-density questions consecutively
- **Last questions**: Maintain challenge - NO cooldown, keep difficulty consistent

**High-density definition**: Long stems (>50 words) OR 3+ decisions (like Assertion-Reason) OR Match-the-Following
**FROZEN RULE**: After any 2 consecutive high-density questions, MUST place at least 1 low-density question

---

## FROZEN PROHIBITIONS (Zero Violations Allowed)

### Question Stems - NEVER use:
- "Always" or "Never"
- Double negatives
- Ambiguous pronouns without clear referents
- Meta-references to sources: "according to the study material", "as mentioned in", "as per the notes", "the material states"

**CRITICAL**: Write questions as direct, authoritative statements. This is a REET Mains exam, not a textbook quiz.

**WRONG EXAMPLES** (meta-references - NEVER do this):
❌ "According to the study material, what is Zone of Proximal Development?"
❌ "As mentioned in the notes, who proposed the theory of Multiple Intelligences?"
❌ "What does the material say about Piaget's stages?"

**CORRECT EXAMPLES** (direct, authoritative):
✅ "The Zone of Proximal Development (ZPD) refers to:"
✅ "The theory of Multiple Intelligences was proposed by:"
✅ "According to Piaget's theory of cognitive development, the concrete operational stage occurs at:"

### Options - NEVER include:
- "None of the above"
- "All of the above"
- Subset inclusion (where Option A is completely contained in Option B)
- Lopsided visual weight (one massive option + three tiny options)
- Non-mutually exclusive options (options must be distinct)

### Answer Key - NEVER violate:
- No more than 3 consecutive questions with the same correct answer

### Match Questions - MUST follow:
- Always 4×4 matrix format
- Always coded options format (A-III, B-I, C-IV, D-II)
- Always end with "Choose the correct answer from the options given below"

---

## OPTION CONSTRUCTION RULES

- All 4 options must be approximately equal length (87% of questions)
- All 4 options must use the same grammatical structure (98% of questions)
- All 4 options must be mutually exclusive
- Make distractors plausible - use similar psychological theories, related concepts, common misconceptions about child development

---

## ANSWER KEY BALANCE

- Distribute correct answers evenly: approximately 25% each for options A, B, C, D
- Never place more than 3 consecutive questions with the same correct answer
- Randomize answer positions naturally

---

## EDUCATIONAL PSYCHOLOGY SPECIFIC CONTENT REQUIREMENTS (Critical)

### Theoretical Accuracy:
- Use exact names of psychologists and their theories from study materials
- Ensure accurate representation of psychological concepts (no oversimplification)
- Verify developmental stage ages and characteristics
- Use correct terminology (e.g., "scaffolding", "metacognition", "intrinsic motivation")

### Key Content Areas:
**Child Development**: Piaget's stages, Vygotsky's sociocultural theory, Kohlberg's moral development, Erikson's psychosocial stages
**Learning Theories**: Behaviorism (Pavlov, Skinner, Watson), Cognitivism (Bruner, Ausubel), Constructivism (Piaget, Vygotsky)
**Intelligence**: Spearman's g-factor, Thurstone's primary mental abilities, Gardner's Multiple Intelligences, Sternberg's Triarchic Theory
**Motivation**: Intrinsic vs Extrinsic, Maslow's hierarchy, Achievement motivation
**Personality**: Big Five, Type theories, Trait theories
**Individual Differences**: Learning styles, Special needs, Gifted learners, Learning disabilities
**Assessment**: Formative vs Summative, Diagnostic, Norm-referenced vs Criterion-referenced, Bloom's Taxonomy
**Classroom Management**: Discipline strategies, Inclusive education, Collaborative learning

### Graduation-Level Expectation:
- Questions should test conceptual understanding, not just definitions
- Include scenario-based application questions (classroom situations)
- Require analysis and discrimination between similar concepts
- Focus on practical implications of theories for teaching

### NCF/NEP Alignment:
- Emphasize learner-centered approaches
- Include questions on inclusive education and equity
- Cover 21st-century skills (critical thinking, collaboration)
- Reference constructivist and progressive pedagogies

---

## OUTPUT FORMAT (JSON Schema)

Generate questions in this exact JSON format:

\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "Full question text here with all options",
      "archetype": "directRecall" | "theoryAttribution" | "directApplication" | "discriminator" | "exceptionOutlier" | "calculationNumerical",
      "structuralForm": "standardMCQ" | "scenarioBasedMCQ" | "matchFollowing" | "negativePhrasing",
      "cognitiveLoad": "low" | "medium" | "high",
      "correctAnswer": "A" | "B" | "C" | "D",
      "options": {
        "A": "Full text of option A",
        "B": "Full text of option B",
        "C": "Full text of option C",
        "D": "Full text of option D"
      },
      "explanation": "Clear explanation of why the correct answer is right and why other options are wrong",
      "difficulty": "easy" | "medium" | "hard",
      "ncertFidelity": "strict" | "moderate" | "loose"
    }
  ]
}
\`\`\`

---

## QUALITY CHECKLIST (Self-Validate Before Returning)

✓ All archetype counts match targets (directRecall, theoryAttribution, directApplication, discriminator, exceptionOutlier, calculationNumerical)
✓ All structural form counts match targets (standardMCQ, scenarioBasedMCQ, matchFollowing, negativePhrasing)
✓ First ${config.cognitiveLoad.warmupCount} questions are low-density Direct Recall or Theory Attribution
✓ No more than 2 consecutive high-density questions
✓ No prohibited patterns present (Always/Never, None/All of above, double negatives, meta-references)
✓ All Match questions use exact 4×4 template with full matrix in questionText (if any allocated)
✓ All Scenario-Based MCQ questions present realistic classroom/student situations
✓ All options mutually exclusive and similar length
✓ Answer key balanced (~25% each option)
✓ No more than 3 consecutive same answers
✓ All psychological theories and concepts are 100% accurate
✓ NO meta-references to sources ("according to study material", "as per notes", "the material says")
✓ Theory Attribution questions correctly identify psychologist-theory pairings
✓ Calculation questions use correct formulas (e.g., IQ = Mental Age / Chronological Age × 100)
✓ Alignment with NCF/NEP principles

---

## FINAL INSTRUCTIONS - READ CAREFULLY

Generate ${questionCount} questions now following ALL rules above.

**CRITICAL REQUIREMENTS** (violations will cause system errors):
1. Extract content EXCLUSIVELY from the provided study materials about Educational Psychology
2. Return ONLY valid JSON - no explanations, no comments, no text before/after
3. Follow the exact JSON format shown in the examples above - COPY the structure exactly
4. **NEVER reference sources in questions** - No "according to study material", "as per notes", etc. Write questions as direct, authoritative statements like a real REET exam
5. Ensure ALL psychological concepts and theories are 100% accurate
6. Theory Attribution questions use "According to [Psychologist]" or "Who proposed..." format (referring to psychologist, NOT study material)

**FOR MATCH-THE-FOLLOWING QUESTIONS** (${structuralCounts.matchFollowing || 0} required):
- Only generate if count > 0 (rare format in REET Ed Psych)
- Put the COMPLETE matrix (Column I items A-D, Column II items I-IV) in questionText
- End questionText with: "Choose the correct answer from the options given below:"
- Put ONLY coded combinations (e.g., "A-III, B-I, C-IV, D-II") in options
- If you omit the matrix or ending phrase, the question will be rejected

**FOR SCENARIO-BASED MCQ QUESTIONS** (${structuralCounts.scenarioBasedMCQ || 0} required):
- Present a realistic classroom situation, student behavior, or teaching context (2-3 sentences)
- Make scenarios relatable to Indian educational context
- Ask for identification/analysis of psychological concept demonstrated
- Use actual REET examples as templates (Neha watching movie for intrinsic motivation, child crawling for regression, etc.)

**FOR CALCULATION QUESTIONS** (${archetypeCounts.calculationNumerical || 0} required):
- Use standard formulas: IQ = (Mental Age / Chronological Age) × 100
- Provide all necessary numerical data in the question stem
- Make calculations straightforward (no calculator needed)
- All 4 options should be plausible numerical values

**JSON OUTPUT**:
- Do NOT wrap JSON in markdown code blocks (\`\`\`json)
- Do NOT add any text before { or after }
- Ensure all ${questionCount} questions are in the "questions" array
- Validate your JSON structure before returning

Return the JSON now:`
}

export const reetMainsLevel2EducationalPsychologyProtocol: Protocol = {
  id: 'reet-mains-level2-educational-psychology',
  name: 'REET Mains Level 2 - Educational Psychology',
  streamName: 'REET Mains Level 2',
  subjectName: 'Psychology (Child Development & Pedagogy)',

  difficultyMappings: {
    easy: {
      archetypes: {
        directRecall: 0.50,
        theoryAttribution: 0.12,
        directApplication: 0.18,
        discriminator: 0.02,
        exceptionOutlier: 0.16,
        calculationNumerical: 0.02
      },
      structuralForms: {
        standardMCQ: 0.80,
        scenarioBasedMCQ: 0.12,
        matchFollowing: 0.02,
        negativePhrasing: 0.06
      },
      cognitiveLoad: {
        lowDensity: 0.70,
        mediumDensity: 0.27,
        highDensity: 0.03
      }
    },
    balanced: {
      archetypes: {
        directRecall: 0.47,
        theoryAttribution: 0.15,
        directApplication: 0.20,
        discriminator: 0.03,
        exceptionOutlier: 0.13,
        calculationNumerical: 0.02
      },
      structuralForms: {
        standardMCQ: 0.77,
        scenarioBasedMCQ: 0.16,
        matchFollowing: 0.02,
        negativePhrasing: 0.13
      },
      cognitiveLoad: {
        lowDensity: 0.65,
        mediumDensity: 0.32,
        highDensity: 0.03
      }
    },
    hard: {
      archetypes: {
        directRecall: 0.44,
        theoryAttribution: 0.18,
        directApplication: 0.22,
        discriminator: 0.04,
        exceptionOutlier: 0.10,
        calculationNumerical: 0.02
      },
      structuralForms: {
        standardMCQ: 0.74,
        scenarioBasedMCQ: 0.20,
        matchFollowing: 0.02,
        negativePhrasing: 0.16
      },
      cognitiveLoad: {
        lowDensity: 0.60,
        mediumDensity: 0.36,
        highDensity: 0.04
      }
    }
  },

  prohibitions: [
    'NEVER use "Always" or "Never" in question stems',
    'NEVER use double negatives',
    'NEVER include "None of the above" (observed in 0% of actual papers)',
    'AVOID "All of the above" as an option (rare in actual papers)',
    'NEVER create subset inclusion (Option A contained in Option B)',
    'NEVER place more than 2 consecutive high-density questions',
    'NEVER create lopsided visual weight (1 long + 3 short options)',
    'NEVER use ambiguous pronouns without clear referents',
    'NEVER create non-mutually exclusive options',
    'NEVER create Match questions without 4×4 matrix and coded options',
    'NEVER violate max-3-consecutive same answer key',
    'NEVER use Assertion-Reason format (0% usage in actual REET Ed Psych papers)',
    'NEVER use Multi-Statement combination format (0% usage in actual REET Ed Psych papers)',
    'NEVER include non-psychology questions (e.g., biology/DNA questions observed in some papers - exclude these)',
    'NEVER reference study materials ("according to the material", "as per notes") - only reference psychologists',
    'MUST align with NCF/NEP principles',
    'MUST use accurate psychological theories and concepts',
    'MUST use Indian educational context for scenario-based questions'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,
    warmupPercentage: 0.10
  },

  buildPrompt: buildEducationalPsychologyPrompt,

  validators: [],

  metadata: {
    description: 'REET Mains Level 2 - Educational Psychology (Common Section - 20 marks)',
    analysisSource: 'REET Mains 2022-23 papers (60 questions from 6 papers: English, SciMath, SST, Hindi, Sanskrit, Urdu)',
    version: '2.0.0',
    lastUpdated: '2025-12-29',
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: 'Common Section - 20 marks out of 160-mark common section',
    note: 'Protocol fitness improved from 42/100 to 75+/100 based on comprehensive analysis. Key findings: (1) Added Theory Attribution archetype (15% of questions), (2) Added Scenario-Based MCQ format (16%), (3) Removed unused formats (Assertion-Reason, Multi-Statement - 0% usage), (4) Exam is simpler than expected (65% low cognitive load vs 45% initial estimate), (5) 70% cross-paper overlap with 30% subject-specific variation'
  }
}
