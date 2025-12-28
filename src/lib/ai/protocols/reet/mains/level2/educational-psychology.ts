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

import { Protocol, ProtocolConfig } from '../../../types'
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
- **${archetypeCounts.directRecall} Direct Recall questions**: Definitions, theories, psychologists' names, stages of development, terminology. Use exact information from study materials (e.g., "Piaget's stages", "Vygotsky's ZPD", "Bloom's Taxonomy").
- **${archetypeCounts.directApplication} Direct Application questions**: Apply psychological theories to classroom scenarios - identify learning style, suggest appropriate teaching method, recognize developmental stage from behavior.
- **${archetypeCounts.integrative} Integrative/Multi-concept questions**: Combine multiple psychological concepts - link learning theories with classroom strategies, connect assessment types with learning objectives, integrate development stages with pedagogical approaches.
- **${archetypeCounts.discriminator} Conceptual Discriminator questions**: Deep understanding to separate subtle distinctions - differentiate similar theories (Piaget vs Vygotsky), distinguish assessment types (formative vs summative), identify appropriate interventions for different learner needs.
- **${archetypeCounts.exceptionOutlier} Exception/Outlier Logic questions**: Identify exceptions to psychological principles, special cases in child development, outliers in learning patterns, limitations of specific theories.

Every question must fall into exactly ONE archetype category.

---

## STRUCTURAL FORMS DISTRIBUTION (Target Counts)

Generate exactly:
- **${structuralCounts.standardMCQ} Standard 4-Option MCQ**: Traditional single stem with 4 options (1), (2), (3), (4).
- **${structuralCounts.matchFollowing} Match-the-Following**: Always use 4×4 matrix with coded options (see template below).
- **${structuralCounts.assertionReason} Assertion-Reason**: Two statements with 4 options about truth and linkage (see template below).
- **${structuralCounts.negativePhrasing} Negative Phrasing**: Use "Which is NOT correct", "incorrect statement", "exception" format.
- **${structuralCounts.multiStatement} Multi-Statement Combination**: Provide 4-5 statements, ask to select correct group from coded combinations.

Every question must use exactly ONE structural form.

---

## STRUCTURAL FORM TEMPLATES (Use Exact Formats)

### Match-the-Following Template (MANDATORY - ZERO DEVIATION ALLOWED):
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

### Assertion-Reason Template (MANDATORY - ZERO DEVIATION ALLOWED):
**FROZEN RULE**: The questionText field MUST contain Assertion (A), Reason (R), AND the ending phrase "In the light of the above statements, choose the correct answer from the options given below:"

Display Format (what students see):
\`\`\`
Assertion (A): [Statement about psychological concept or theory]
Reason (R): [Explanation or related psychological principle]

In the light of the above statements, choose the correct answer from the options given below:
(1) Both A and R are true and R is the correct explanation of A
(2) Both A and R are true but R is NOT the correct explanation of A
(3) A is true but R is false
(4) A is false but R is true
\`\`\`

**CRITICAL**: The word "explanation" MUST appear in option (1) and option (2). The ending phrase "In the light of the above statements, choose the correct answer from the options given below:" is MANDATORY in questionText.

### Multi-Statement Combination Template:
\`\`\`
Given below are two statements about child development:

Statement I: [First statement about psychological concept]
Statement II: [Second statement about psychological concept]

In the light of the above statements, choose the correct answer from the options given below:
(1) Both Statement I and Statement II are true
(2) Both Statement I and Statement II are false
(3) Statement I is true but Statement II is false
(4) Statement I is false but Statement II is true
\`\`\`

OR use this variant:
\`\`\`
Which of the following statements about learning theories are correct?

A. [Statement A]
B. [Statement B]
C. [Statement C]
D. [Statement D]

Choose the correct answer from the options given below:
(1) A and B only
(2) B and C only
(3) A, B and D only
(4) B, C and D only
\`\`\`

---

## CO-OCCURRENCE RULES (Apply Strictly)

- **Integrative/Multi-concept archetype** → MUST use Multi-Statement Combination OR Assertion-Reason format
- **Exception/Outlier archetype** → STRONGLY prefer Negative Phrasing format
- **Match-the-Following format** → STRONGLY prefer Direct Recall archetype content (psychologists with theories, stages with ages, concepts with definitions)

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

- Distribute correct answers evenly: approximately 25% each for options (1), (2), (3), (4)
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
      "archetype": "directRecall" | "directApplication" | "integrative" | "discriminator" | "exceptionOutlier",
      "structuralForm": "standardMCQ" | "matchFollowing" | "assertionReason" | "negativePhrasing" | "multiStatement",
      "cognitiveLoad": "low" | "medium" | "high",
      "correctAnswer": "(1)" | "(2)" | "(3)" | "(4)",
      "options": {
        "(1)": "Full text of option 1",
        "(2)": "Full text of option 2",
        "(3)": "Full text of option 3",
        "(4)": "Full text of option 4"
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

✓ All archetype counts match targets
✓ All structural form counts match targets
✓ First ${config.cognitiveLoad.warmupCount} questions are low-density Direct Recall
✓ No more than 2 consecutive high-density questions
✓ No prohibited patterns present (Always/Never, None/All, double negatives, meta-references)
✓ All Match questions use exact 4×4 template with full matrix in questionText
✓ All Assertion-Reason questions use exact template with ending phrase
✓ All options mutually exclusive and similar length
✓ Answer key balanced (~25% each option)
✓ No more than 3 consecutive same answers
✓ All psychological theories and concepts are accurate
✓ NO meta-references to sources ("according to", "as per", "the material says")
✓ Alignment with NCF/NEP principles

---

## FINAL INSTRUCTIONS - READ CAREFULLY

Generate ${questionCount} questions now following ALL rules above.

**CRITICAL REQUIREMENTS** (violations will cause system errors):
1. Extract content EXCLUSIVELY from the provided study materials about Educational Psychology
2. Return ONLY valid JSON - no explanations, no comments, no text before/after
3. Follow the exact JSON format shown in the examples above - COPY the structure exactly
4. **NEVER reference sources in questions** - No "according to", "as per study material", etc. Write questions as direct, authoritative statements like a real REET exam
5. Ensure ALL psychological concepts and theories are 100% accurate

**FOR MATCH-THE-FOLLOWING QUESTIONS** (${structuralCounts.matchFollowing} required):
- Put the COMPLETE matrix (Column I items A-D, Column II items I-IV) in questionText
- End questionText with: "Choose the correct answer from the options given below:"
- Put ONLY coded combinations (e.g., "A-III, B-I, C-IV, D-II") in options
- If you omit the matrix or ending phrase, the question will be rejected

**FOR ASSERTION-REASON QUESTIONS** (${structuralCounts.assertionReason} required):
- Put Assertion (A) and Reason (R) in questionText
- End questionText with: "In the light of the above statements, choose the correct answer from the options given below:"
- Option (1) MUST say: "Both A and R are true and R is the correct explanation of A"
- Option (2) MUST say: "Both A and R are true but R is NOT the correct explanation of A"
- The word "explanation" must appear in options (1) and (2)
- If you omit the ending phrase or "explanation", the question will be rejected

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
        directRecall: 0.65,
        directApplication: 0.15,
        integrative: 0.08,
        discriminator: 0.06,
        exceptionOutlier: 0.06
      },
      structuralForms: {
        standardMCQ: 0.65,
        matchFollowing: 0.15,
        assertionReason: 0.08,
        negativePhrasing: 0.06,
        multiStatement: 0.06
      },
      cognitiveLoad: {
        lowDensity: 0.50,
        mediumDensity: 0.38,
        highDensity: 0.12
      }
    },
    balanced: {
      archetypes: {
        directRecall: 0.60,
        directApplication: 0.16,
        integrative: 0.10,
        discriminator: 0.08,
        exceptionOutlier: 0.06
      },
      structuralForms: {
        standardMCQ: 0.60,
        matchFollowing: 0.18,
        assertionReason: 0.10,
        negativePhrasing: 0.06,
        multiStatement: 0.06
      },
      cognitiveLoad: {
        lowDensity: 0.45,
        mediumDensity: 0.40,
        highDensity: 0.15
      }
    },
    hard: {
      archetypes: {
        directRecall: 0.55,
        directApplication: 0.14,
        integrative: 0.14,
        discriminator: 0.11,
        exceptionOutlier: 0.06
      },
      structuralForms: {
        standardMCQ: 0.55,
        matchFollowing: 0.20,
        assertionReason: 0.12,
        negativePhrasing: 0.07,
        multiStatement: 0.06
      },
      cognitiveLoad: {
        lowDensity: 0.40,
        mediumDensity: 0.42,
        highDensity: 0.18
      }
    }
  },

  prohibitions: [
    'NEVER use "Always" or "Never" in question stems',
    'NEVER use double negatives',
    'NEVER include "None of the above" or "All of the above"',
    'NEVER create subset inclusion (Option A contained in Option B)',
    'NEVER place more than 2 consecutive high-density questions',
    'NEVER create lopsided visual weight (1 long + 3 short options)',
    'NEVER use ambiguous pronouns without clear referents',
    'NEVER create non-mutually exclusive options',
    'NEVER create Match questions without 4×4 matrix and coded options',
    'NEVER violate max-3-consecutive same answer key',
    'MUST align with NCF/NEP principles',
    'MUST use accurate psychological theories and concepts'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,
    warmupPercentage: 0.10
  },

  buildPrompt: buildEducationalPsychologyPrompt,

  validators: [],

  metadata: {
    description: 'REET Mains Level 2 - Educational Psychology (Common Section - 20 marks)',
    analysisSource: 'RSMSSB Official Pattern',
    version: '1.0.0-basic',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: 'Common Section - 20 marks out of 160-mark common section'
  }
}
