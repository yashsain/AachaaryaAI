/**
 * Protocol: Mathematics Teaching Methods
 * RPSC Senior Teacher (Grade II) - Paper-II, Section 3
 * 20 Questions | 2 Marks Each | 0.33 Negative Marking
 *
 * Focus: Pedagogical approaches, curriculum knowledge, assessment strategies,
 * teaching methodologies specific to mathematics education at secondary level.
 */

import type { Protocol, ProtocolConfig } from '@/lib/ai/protocols/types'
import type { ChapterKnowledge } from '@/lib/ai/types/chapterKnowledge'

// ============================================================================
// ARCHETYPE DISTRIBUTIONS
// ============================================================================

/**
 * Mathematics Teaching Methods Archetypes (Topic-Agnostic)
 * Based on analysis of actual RPSC 2022 exam (Q131-150)
 *
 * - methodSelection: Identify which teaching method fits given scenario (40% of actual exam)
 * - directRecall: Pure memory recall of terminology, founders, history (30% of actual exam)
 * - negativeDiscrimination: Identify what is NOT correct/characteristic (15% of actual exam)
 * - propertyClassification: Classify into taxonomy categories (Bloom, objectives) (15% of actual exam)
 * - comparativeReasoning: Compare multiple pedagogical approaches (5-10% of actual exam)
 * - conceptIntegration: Synthesize pedagogy with subject content (hard difficulty only)
 */

const archetypes = {
  easy: {
    methodSelection: 0.30,
    directRecall: 0.45,
    propertyClassification: 0.15,
    negativeDiscrimination: 0.10
  },
  balanced: {
    methodSelection: 0.35,
    directRecall: 0.25,
    propertyClassification: 0.20,
    negativeDiscrimination: 0.12,
    comparativeReasoning: 0.08
  },
  hard: {
    methodSelection: 0.38,
    comparativeReasoning: 0.22,
    propertyClassification: 0.18,
    negativeDiscrimination: 0.12,
    conceptIntegration: 0.10
  }
}

// ============================================================================
// STRUCTURAL FORMS
// ============================================================================

const structuralForms = {
  easy: {
    standard4OptionMCQ: 0.50,
    multipleSelectQuestions: 0.25,
    matchTheFollowing: 0.15,
    arrangeInOrder: 0.10
  },
  balanced: {
    standard4OptionMCQ: 0.20,
    multipleSelectQuestions: 0.40,
    matchTheFollowing: 0.25,
    assertionReasoning: 0.15
  },
  hard: {
    multipleSelectQuestions: 0.45,
    assertionReasoning: 0.30,
    matchTheFollowing: 0.15,
    standard4OptionMCQ: 0.10
  }
}

// ============================================================================
// COGNITIVE LOAD
// ============================================================================

const cognitiveLoad = {
  easy: {
    lowDensity: 0.40,
    mediumDensity: 0.40,
    highDensity: 0.20
  },
  balanced: {
    lowDensity: 0.10,
    mediumDensity: 0.40,
    highDensity: 0.50
  },
  hard: {
    lowDensity: 0.05,
    mediumDensity: 0.25,
    highDensity: 0.70
  }
}

// ============================================================================
// DIFFICULTY MAPPINGS
// ============================================================================

const difficultyMappings: Protocol['difficultyMappings'] = {
  easy: {
    archetypes: archetypes.easy as any,
    structuralForms: structuralForms.easy as any,
    cognitiveLoad: cognitiveLoad.easy
  },
  balanced: {
    archetypes: archetypes.balanced as any,
    structuralForms: structuralForms.balanced as any,
    cognitiveLoad: cognitiveLoad.balanced
  },
  hard: {
    archetypes: archetypes.hard as any,
    structuralForms: structuralForms.hard as any,
    cognitiveLoad: cognitiveLoad.hard
  }
}

// ============================================================================
// PROHIBITIONS
// ============================================================================

const prohibitions: string[] = [
  // ===== CRITICAL OPTION RULES =====
  '❌ NEVER use "All of the above" or "None of the above" - ABSOLUTELY BANNED',
  '❌ NEVER use 5 options - MUST use exactly 4 options (A, B, C, D)',
  '❌ OPTION E ABSOLUTELY BANNED - Only A, B, C, D allowed',

  // ===== DATA INTEGRITY (CRITICAL - Zero Tolerance) =====
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

  // ===== ARCHETYPE RESTRICTIONS (TOPIC-AGNOSTIC) =====
  '🎯 ONLY use these 6 topic-agnostic archetypes:',
  '  1. methodSelection - Identify which teaching method fits scenario',
  '  2. directRecall - Pure memory recall of terminology/founders/history',
  '  3. negativeDiscrimination - Identify what is NOT correct/characteristic',
  '  4. propertyClassification - Classify into taxonomy categories',
  '  5. comparativeReasoning - Compare multiple pedagogical approaches',
  '  6. conceptIntegration - Synthesize pedagogy with subject content',
  '❌ NO OTHER archetypes allowed',
  '❌ Archetype names must be TOPIC-AGNOSTIC (no "technologyIntegration", "NCF2005", etc.)',

  // ===== STRUCTURAL FORM RESTRICTIONS =====
  '📐 ONLY use these 5 structural forms:',
  '  1. standard4OptionMCQ',
  '  2. multipleSelectQuestions',
  '  3. matchTheFollowing',
  '  4. arrangeInOrder',
  '  5. assertionReasoning',
  '❌ NO OTHER structural forms allowed',

  // ===== MSQ QUALITY PATTERNS =====
  '❌ MSQ "ALL CORRECT" ABSOLUTELY BANNED - Never make all 4 options correct',
  '❌ MSQ "ALL WRONG" ABSOLUTELY BANNED - At least 2 options must be correct',
  '✅ MSQ MUST have 2-3 correct answers (NEVER 1, NEVER 4)',
  '✅ MSQ correct answers MUST be non-obvious and require careful analysis',

  // ===== MATCH-THE-FOLLOWING PATTERNS =====
  '❌ SEQUENTIAL MATCHING ABSOLUTELY BANNED',
  '❌ Never use patterns like: 1→P, 2→Q, 3→R, 4→S',
  '✅ MUST use scrambled matching requiring genuine knowledge',
  '✅ Match-the-following MUST have at least 2 cross-matches',

  // ===== ARRANGE-IN-ORDER PATTERNS =====
  '❌ CHRONOLOGICAL SEQUENCE TRAPS BANNED',
  '❌ Never make "already in order" a correct answer',
  '✅ Arrange questions MUST require pedagogical/conceptual sequencing knowledge',

  // ===== ASSERTION-REASONING PATTERNS =====
  '❌ "Both true, R is correct explanation of A" TOO OBVIOUS - USE SPARINGLY',
  '✅ Prefer nuanced A-R relationships requiring deeper analysis',
  '✅ Use cases where both true but R does NOT explain A',

  // ===== CONTENT QUALITY =====
  '📚 Focus on NCF 2005 mathematics education principles',
  '📚 Include constructivist approaches to mathematics teaching',
  '📚 Cover assessment for learning, not just assessment of learning',
  '📚 Address common student misconceptions in mathematics',
  '📚 Include differentiated instruction and inclusive pedagogy',
  '⚠️ COMPETITIVE EXAM FOCUS: Test practical knowledge, not theoretical depth',
  '⚠️ Emphasize scenario-based method selection (40% of actual exam)',
  '⚠️ Technology integration had 0% representation in actual exam - use sparingly',

  // ===== COGNITIVE LOAD CONSTRAINTS =====
  '🧠 lowDensity: Simple recall of teaching methods/curriculum facts',
  '🧠 mediumDensity: Application of pedagogical principles to scenarios',
  '🧠 highDensity: Complex scenario analysis, multi-step pedagogical reasoning',

  // ===== LANGUAGE & FORMATTING =====
  '🌐 Questions in Hindi (primary)',
  '🌐 Professional academic language for teaching methods',
  '🌐 Scenarios must be realistic secondary mathematics classroom contexts',
  '🌐 Avoid jargon without context',

  // ===== DIFFICULTY-SPECIFIC RULES =====
  '🎚️ EASY: Direct recall, terminology, basic curriculum knowledge',
  '🎚️ BALANCED: Scenario application, method selection, assessment design',
  '🎚️ HARD: Complex pedagogical analysis, integration of multiple concepts',

  // ===== CALCULATION TRANSPARENCY (PEDAGOGICAL CONTEXT) =====
  '🔢 CALCULATION DERIVATION FOR PEDAGOGY QUESTIONS:',
  '⚠️ NOTE: Most teaching methods questions are conceptual, not calculation-heavy',
  '⚠️ However, IF a question involves ANY numerical calculation (grades, percentages, statistics, time allocation):',
  '✅ The Explanation field MUST include step-by-step derivation',
  '✅ Show ALL arithmetic operations explicitly',
  '✅ Example scenarios: calculating mean scores, grade distributions, time percentages',
  '📌 EXAMPLE (Pedagogical Calculation):',
  '  Question: "A teacher allocates 60 minutes for a lesson. If 40% is for explanation and 35% for practice, how many minutes remain for assessment?"',
  '  ❌ INVALID Explanation: "Using percentages, answer is 15 minutes"',
  '  ✅ VALID Explanation:',
  '    "Step 1: Calculate time for explanation',
  '     40% of 60 = (40/100) × 60 = 0.4 × 60 = 24 minutes',
  '     Step 2: Calculate time for practice',
  '     35% of 60 = (35/100) × 60 = 0.35 × 60 = 21 minutes',
  '     Step 3: Calculate remaining time',
  '     Total used = 24 + 21 = 45 minutes',
  '     Remaining = 60 - 45 = 15 minutes for assessment"'
]

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildPrompt(
  config: ProtocolConfig,
  chapterName: string,
  questionCount: number,
  totalQuestions: number,
  isBilingual: boolean = false,
  chapterKnowledge?: ChapterKnowledge | null
): string {
  // Use balanced difficulty for generation
  const difficulty = 'balanced'
  const languageMode = isBilingual ? 'bilingual (English primary)' : 'english'

  // Calculate archetype counts based on difficulty
  const archetypeDist = archetypes[difficulty]
  const archetypeCounts: Record<string, number> = {}
  Object.entries(archetypeDist).forEach(([archetype, percentage]) => {
    archetypeCounts[archetype] = Math.round(questionCount * percentage)
  })

  // Calculate structural form counts
  const structuralFormDist = structuralForms[difficulty]
  const structuralFormCounts: Record<string, number> = {}
  Object.entries(structuralFormDist).forEach(([form, percentage]) => {
    structuralFormCounts[form] = Math.round(questionCount * percentage)
  })

  // Calculate cognitive load counts
  const cognitiveLoadDist = cognitiveLoad[difficulty]
  const cognitiveLoadCounts: Record<string, number> = {}
  Object.entries(cognitiveLoadDist).forEach(([load, percentage]) => {
    cognitiveLoadCounts[load] = Math.round(questionCount * percentage)
  })

  const archetypeList = Object.entries(archetypeCounts)
    .map(([name, count]) => `  - ${name}: ${count} questions`)
    .join('\n')

  const structuralFormList = Object.entries(structuralFormCounts)
    .map(([name, count]) => `  - ${name}: ${count} questions`)
    .join('\n')

  const cognitiveLoadList = Object.entries(cognitiveLoadCounts)
    .map(([name, count]) => `  - ${name}: ${count} questions`)
    .join('\n')

  return `# MATHEMATICS TEACHING METHODS QUESTION GENERATION
## RPSC Senior Teacher (Grade II) - Paper-II, Section 3

**Exam Context:** RPSC Senior Teacher (Grade II) Recruitment Examination
**Subject:** Mathematics-Teaching-Methods
**Chapter:** ${chapterName}
**Target Difficulty:** ${difficulty.toUpperCase()}
**Total Questions:** ${questionCount}
**Language Mode:** ${languageMode}
**Difficulty Multiplier:** 4-6x (professional pedagogy - higher than B.Ed. level)

---

## 📚 OFFICIAL RPSC SYLLABUS - PART (iii): TEACHING METHODS (40 Marks)

- Meaning and Nature of Mathematics.
- Aims & Objectives of Mathematics Teaching.
- Methods of Mathematics Teaching (analytic, synthetic, inductive, deductive, heuristic, Project &
Laboratory).
- Using various techniques of teaching mathematics viz - Oral, written, drill, assignment, supervised - study &
programmed Learning.
- Arousing and maintaining interest in learning of Mathematics.
- Importance & meaning of planning, Preparing Lesson Plan, Unit Plan, Yearly Plan, Short Lesson Plan.
- Preparing low cost improvised teaching aids, Audio-Visual aids in Mathematics.
- Transfer of mathematics learning to various subjects and actual life situation.
- Planning & equipments of Mathematics laboratory.
- The mathematics teacher academic & professional - preparation.
- Principle of curriculum & qualities of a good text book.
- Process of obtaining feed-back and evaluation in Mathematics in terms of Cognitive, Affective and Psycho-
motor Development.
- Preparation and use of tests for evaluation such as achievement test & diagnostic test.
- Diagnostic, Remedial and enrichment programmes with respect to syllabus at Secondary and Senior Secondary
stages.
- Mathematics for gifted and retarded children

**IMPORTANT:** Questions MUST align with these official pedagogy topics. Focus on the chapter "${chapterName}" while ensuring it matches the syllabus scope.

---
${chapterKnowledge ? `
## 📚 CHAPTER KNOWLEDGE BASE (FROM ANALYZED MATERIALS)

${chapterKnowledge.scope_analysis ? `
### Scope Analysis - Topics & Depth Covered:

**Main Topics:**
${chapterKnowledge.scope_analysis.topics.map(topic => `- ${topic}`).join('\n')}

**Subtopic Details:**
${Object.entries(chapterKnowledge.scope_analysis.subtopics).map(([topic, subtopics]) =>
  `**${topic}:**\n${subtopics.map(st => `  - ${st.name} (${st.depth} level) - Keywords: ${st.keywords.join(', ')}`).join('\n')}`
).join('\n\n')}

**Depth Indicators:**
${Object.entries(chapterKnowledge.scope_analysis.depth_indicators).map(([topic, depth]) =>
  `- ${topic}: ${depth.toUpperCase()} level`
).join('\n')}

${Object.keys(chapterKnowledge.scope_analysis.terminology_mappings).length > 0 ? `
**Terminology Mappings (use institute's preferred terms):**
${Object.entries(chapterKnowledge.scope_analysis.terminology_mappings).map(([from, to]) =>
  `- "${from}" → "${to}"`
).join('\n')}
` : ''}

⚠️ **SCOPE BOUNDARY:** Generate questions ONLY from the topics and subtopics listed above. This defines the institute's curriculum coverage for "${chapterName}".
` : ''}

${chapterKnowledge.style_examples?.questions && chapterKnowledge.style_examples.questions.length > 0 ? `
### Style Examples - Sample Questions from Practice Papers:

**Reference questions showing expected format and difficulty level:**

${chapterKnowledge.style_examples.questions.slice(0, 5).map((q, i) => `
**Example ${i + 1}:**
${q.text}
${q.options ? `Options: ${q.options.join(', ')}` : ''}
Answer: ${q.answer}
${q.explanation ? `Explanation: ${q.explanation}` : ''}
(Source: ${q.source_material_title})
`).join('\n')}

⚠️ **STYLE GUIDANCE:** Use these examples as reference for question complexity, format, and difficulty level. Generate NEW questions in similar style but with different content.
` : ''}

**Materials Analyzed:** ${[
  ...(chapterKnowledge.scope_analysis?.extracted_from_materials || []),
  ...(chapterKnowledge.style_examples?.extracted_from_materials || [])
].join(', ')}

---
` : ''}

## CRITICAL QUALITY STANDARDS - READ CAREFULLY

⚠️ **EXAM POSITIONING**: This is a COMPETITIVE GOVERNMENT EXAM for SENIOR TEACHER (Grade II) positions.

**Who takes this exam:**
- Experienced educators applying for senior mathematics teaching positions
- Candidates who will teach advanced mathematics pedagogy (grades 9-12)
- Professionals expected to have deep pedagogical content knowledge
- Teachers who will mentor other mathematics educators

**What this means for questions:**
- **Pedagogically rigorous** - test deep understanding of mathematics teaching methods
- **Professionally appropriate** - suitable for evaluating experienced educators
- **Discriminating** - separate strong pedagogical practitioners from weak ones
- **Scenario-based** - test application of pedagogy in realistic classroom contexts
- **NOT simplistic** - avoid obvious questions about basic teaching terms
- **NOT theoretical only** - test practical pedagogical decision-making

---

## FORBIDDEN QUALITY FAILURES

❌ **BANNED QUESTION TYPES:**
- Questions that test only rote recall of NCF 2005 quotes
- Generic pedagogy questions without mathematics-specific context
- Trivial identification of teaching method names
- Questions any B.Ed. student could answer without mathematics teaching experience
- Purely theoretical questions without practical application

❌ **FORBIDDEN PATTERNS:**
- Overly simple "Who proposed X?" recall questions
- Generic definitions without pedagogical reasoning
- Questions divorced from actual classroom scenarios
- Surface-level NCF knowledge without depth

---

## REQUIRED QUALITY MARKERS

✅ **PROFESSIONAL-GRADE PEDAGOGY:**
- Deep understanding of mathematics-specific teaching challenges
- Scenario-based questions requiring pedagogical reasoning
- Integration of content knowledge with pedagogical knowledge
- Understanding of common student misconceptions in mathematics
- Ability to select appropriate methods for specific learning objectives

✅ **SENIOR TEACHER LEVEL INDICATORS:**
- Questions discriminate between "knows terminology" vs "can apply effectively"
- Require pedagogical sophistication beyond B.Ed. level
- Test ability to diagnose and address learning difficulties
- Demand practical classroom decision-making skills
- Challenge even experienced mathematics teachers

✅ **SPECIFIC QUALITY REQUIREMENTS:**
- Scenarios based on realistic secondary mathematics classroom contexts
- Options representing plausible pedagogical choices
- Correct answers justified by sound pedagogical reasoning
- Distractors based on common pedagogical misconceptions
- Explanations demonstrating professional teaching expertise

---

## 📋 GENERATION REQUIREMENTS

### Archetype Distribution:
${archetypeList}

### Structural Form Distribution:
${structuralFormList}

### Cognitive Load Distribution:
${cognitiveLoadList}

---

## 🎯 ARCHETYPE DEFINITIONS (TOPIC-AGNOSTIC)

### 1. methodSelection (35-45% of questions)
- **Cognitive Pattern**: Scenario → Identify which teaching method applies
- **Structure**: Present teaching scenario, ask which method is most appropriate
- **Example (Q131)**: "Teacher wants to teach through 'garden project'. Which method?"
  - Answer options: Inductive/Deductive/Synthetic/Project method
- **Example (Q139)**: "Which method correlates mathematics with real life situations?"
- **Key Feature**: Method names as options (Project method, Inductive method, etc.)

### 2. directRecall (20-30% of questions)
- **Cognitive Pattern**: Pure memory retrieval of facts
- **Structure**: "What is X?" or "Who proposed Y?" or "Define Z"
- **Example (Q141)**: "Who imagined concept of 'infinity' for division by zero?"
  - Answer options: Aryabhatta/Brahmagupta/Bhaskaracharya/Vishnugupta
- **Example (Q132)**: "Highest level of cognitive domain under Bloom taxonomy?"
- **Key Feature**: Single factual answer, no reasoning required

### 3. negativeDiscrimination (10-15% of questions)
- **Cognitive Pattern**: Identify what is NOT correct or what doesn't belong
- **Structure**: "Which of following is NOT...", "Which cannot be...", "Incorrect statement is"
- **Example (Q137)**: "Which CANNOT be characteristic of unit test in Mathematics?"
- **Example (Q149)**: "Which is NOT characteristic of supervised study method?"
- **Key Feature**: Requires knowing all options to eliminate the odd one out

### 4. propertyClassification (10-20% of questions)
- **Cognitive Pattern**: Classify into predefined categories/taxonomies
- **Structure**: Classify objective type, Bloom level, pedagogy category
- **Example (Q134)**: "Construction of pentagon question relates to: Evaluation/Understanding/Skill/Analysis?"
- **Example (Q135)**: "Empty set question based on which objective: Application/Understanding/Analysis/Knowledge?"
- **Key Feature**: Taxonomy-based classification (Bloom, objective types, etc.)

### 5. comparativeReasoning (5-10% of questions)
- **Cognitive Pattern**: Compare multiple pedagogical approaches/principles
- **Structure**: Evaluate relative merits/differences between approaches
- **Example (Q140)**: "Which method criticized for encouraging memorization: Inductive/Deductive/Problem-solving/Project?"
- **Key Feature**: Requires understanding nuances between similar methods

### 6. conceptIntegration (hard difficulty only, ~10%)
- **Cognitive Pattern**: Synthesize pedagogical knowledge with mathematical content
- **Structure**: Multi-layered scenario requiring both pedagogy AND subject understanding
- **Example**: "Design assessment that tests both procedural fluency AND conceptual understanding of derivatives"
- **Key Feature**: Cannot be solved with pedagogy knowledge alone

---

## 📐 STRUCTURAL FORM GUIDELINES

### standard4OptionMCQ
- Exactly 4 options: A, B, C, D
- One correct answer
- Distractors based on common misconceptions or partial knowledge
- NO "All of the above" or "None of the above"

### multipleSelectQuestions (MSQ)
- Exactly 4 statements: A, B, C, D
- 2-3 correct answers (NEVER 1, NEVER 4)
- Requires careful analysis of each statement
- Avoid making all correct or all wrong

### matchTheFollowing
- 4 items in Column I (1, 2, 3, 4)
- 4 items in Column II (P, Q, R, S)
- MUST have scrambled matching (NO sequential patterns)
- At least 2 cross-matches required

### arrangeInOrder
- 4 steps/stages to arrange
- Requires pedagogical or conceptual sequencing knowledge
- Must NOT be obvious chronological order
- Should test understanding of teaching progression

### assertionReasoning
- Assertion (A) and Reasoning (R) statements
- Options: (A) Both true, R explains A; (B) Both true, R does NOT explain A; (C) A true, R false; (D) A false, R true
- Prefer nuanced relationships (option B scenarios)
- Avoid overly obvious explanations

---

## 🚫 CRITICAL PROHIBITIONS

${prohibitions.map(p => `${p}`).join('\n')}

---

## 🎚️ DIFFICULTY-SPECIFIC GUIDANCE

### EASY Questions:
- Direct recall of teaching methods, terminology
- Basic NCF 2005 principles
- Simple identification of assessment types
- Straightforward technology tools recognition

### BALANCED Questions:
- Application of pedagogical principles to scenarios
- Method selection for specific learning objectives
- Assessment design for specific topics
- Integration of theory with practice

### HARD Questions:
- Complex scenario analysis requiring multiple considerations
- Addressing misconceptions with pedagogical reasoning
- Advanced assessment strategies (diagnostic, formative)
- Integration of learning theories with technology

---

## 📚 CONTENT FOCUS AREAS

### NCF 2005 Mathematics Education:
- Mathematics as a tool for logical thinking
- Constructivist approaches
- Problem-solving emphasis
- De-emphasis on rote memorization

### Teaching Methods:
- Inductive vs deductive approaches
- Problem-based learning
- Inquiry-based learning
- Collaborative learning strategies
- Differentiated instruction

### Assessment in Mathematics:
- Formative assessment techniques
- Diagnostic assessment for misconceptions
- Rubrics for problem-solving
- Portfolio assessment
- Peer assessment strategies

### Technology Integration:
- GeoGebra for geometry and algebra
- Graphing calculators
- Online math platforms (Khan Academy, BYJU'S)
- Interactive whiteboards
- Math apps and simulations

### Learning Theories:
- Piaget's stages and mathematics
- Vygotsky's ZPD in math learning
- Bruner's spiral curriculum
- Bloom's taxonomy in mathematics
- Constructivism in mathematics education

### Common Misconceptions:
- Algebraic manipulation errors
- Geometric reasoning fallacies
- Probabilistic reasoning errors
- Function concept difficulties
- Calculus conceptual gaps

---

## 🧮 CALCULATION DERIVATION REQUIREMENT (PEDAGOGICAL CONTEXT)

⚠️ **IMPORTANT NOTE**: Most mathematics teaching methods questions are CONCEPTUAL and do NOT involve calculations.

**HOWEVER**, if a question involves ANY numerical calculation, follow these rules:

### MANDATORY REQUIREMENTS FOR CALCULATION-BASED PEDAGOGY QUESTIONS:

1. **Show EVERY step explicitly in the Explanation field**
2. **Break down percentage calculations, grade averages, time allocations**
3. **Label intermediate results clearly**

### PEDAGOGICAL CALCULATION SCENARIOS:

Common calculation types in teaching methods questions:
- **Grade/Score Analysis**: Calculating mean, median, percentile
- **Time Allocation**: Distributing lesson time across activities
- **Performance Statistics**: Success rates, pass percentages
- **Assessment Weighting**: Calculating weighted scores
- **Resource Distribution**: Allocating materials, grouping students

### DERIVATION EXAMPLES FOR PEDAGOGY:

✅ **EXAMPLE 1: Time Allocation**

  Question: एक शिक्षक 90 मिनट की कक्षा में 45% समय व्याख्यान, 30% अभ्यास, और शेष मूल्यांकन में देता है। मूल्यांकन के लिए कितने मिनट उपलब्ध हैं?
  (A teacher allocates 45% of 90-minute class to lecture, 30% to practice, rest to assessment. How many minutes for assessment?)

  Explanation: Calculate time allocation step by step.
    Step 1: Calculate lecture time
      45% of 90 = (45/100) × 90 = 0.45 × 90 = 40.5 minutes
    Step 2: Calculate practice time
      30% of 90 = (30/100) × 90 = 0.30 × 90 = 27 minutes
    Step 3: Calculate assessment time
      Total allocated = 40.5 + 27 = 67.5 minutes
      Assessment time = 90 - 67.5 = 22.5 minutes

✅ **EXAMPLE 2: Grade Statistics**

  Question: 5 छात्रों के गणित में अंक हैं: 65, 78, 82, 70, 75। औसत अंक क्या है?
  (5 students scored in math: 65, 78, 82, 70, 75. What is the average?)

  Explanation: Calculate arithmetic mean.
    Step 1: Sum all scores
      Total = 65 + 78 + 82 + 70 + 75
            = 143 + 82 + 70 + 75
            = 225 + 70 + 75
            = 295 + 75
            = 370
    Step 2: Divide by number of students
      Mean = Total ÷ Number of students
           = 370 ÷ 5
           = 74

❌ **INVALID DERIVATION (DO NOT USE)**:

  "Using average formula, the answer is 74"
  "Calculate mean and you get 74"
  "370/5 = 74"  (Missing intermediate steps)

### KEY DIFFERENCE FROM PURE MATHEMATICS:

- **Mathematics protocols**: Heavy calculation focus, most questions need derivation
- **Teaching Methods protocol**: Light calculation focus, ONLY pedagogical calculations need derivation
- **When in doubt**: If ANY arithmetic operation is performed, show the steps

---

## MANDATORY SELF-VALIDATION CHECKLIST

**YOU MUST MENTALLY VERIFY EACH ITEM BEFORE GENERATING EACH QUESTION:**

### Data Integrity Validation (CRITICAL):
1. ✓ questionNumber is a positive integer (not null, not undefined, not 0)
2. ✓ questionText is a non-empty string with minimum 10 characters
3. ✓ options object exists and is not null/undefined
4. ✓ options has EXACTLY 4 keys: "1", "2", "3", "4"
5. ✓ All 4 options are non-empty strings with minimum 2 characters
6. ✓ correctAnswer is one of "1", "2", "3", "4" (string format)
7. ✓ explanation is a non-empty string with minimum 20 characters

### Content Quality Validation:
8. ✓ All 4 options are textually DIFFERENT (no duplicates)
9. ✓ No option contains "All of the above" or "None of the above"
10. ✓ archetype matches the question type actually generated
11. ✓ structuralForm matches the format actually used
12. ✓ cognitiveLoad is appropriate for question complexity

### Pedagogical Accuracy Validation (CRITICAL):
13. ✓ Pedagogical content is accurate (NCF 2005, teaching methods, etc.)
14. ✓ Scenarios are realistic for secondary mathematics classroom
15. ✓ Teaching method names and definitions are correct
16. ✓ Bloom's taxonomy levels correctly identified
17. ✓ Assessment strategies appropriately matched to objectives

### Format-Specific Validation:
18. ✓ MSQ: 2-3 correct answers (NEVER 1 or 4)
19. ✓ Match: Scrambled matching codes (NO sequential)
20. ✓ Arrange: Scrambled sequence (NO A-B-C-D pattern)
21. ✓ Assertion-Reason: Both (A) and (R) present with standard 4 options

---

## PRE-RETURN VALIDATION PROCEDURE (MANDATORY)

⚠️ **BEFORE RETURNING YOUR JSON OUTPUT, YOU MUST COMPLETE THIS 5-STEP VALIDATION**:

**STEP 1: NULL/UNDEFINED CHECK**
- Scan your entire JSON output for "null" or "undefined"
- If found: STOP and FIX with valid values

**STEP 2: EMPTY STRING CHECK**
- Check all fields (questionText, options, explanation) for empty strings
- If found: STOP and write proper content

**STEP 3: OPTION COUNT VERIFICATION**
- Count option keys: Expected 4, Actual: ___
- Keys must be exactly "1", "2", "3", "4"
- If incorrect: STOP and fix

**STEP 4: CORRECTANSWER VALIDATION**
- correctAnswer must be one of "1", "2", "3", "4" (string)
- If incorrect: STOP and fix

**STEP 5: PEDAGOGICAL ACCURACY CHECK**
- Have you verified NCF 2005 facts are correct? YES/NO: ___
- Are teaching method definitions accurate? YES/NO: ___
- Is the scenario realistic? YES/NO: ___
- If NO to any: STOP and fix

**STEP 6: CALCULATION DERIVATION CHECK (IF APPLICABLE)**
⚠️ **NOTE: Most pedagogy questions don't involve calculations - Skip this if no calculations**
- Does the question involve ANY numerical calculation? YES/NO: ___
- If YES: Does the Explanation show step-by-step derivation? YES/NO: ___
- If calculation exists but NO derivation: STOP - Add complete derivation
- Applicable scenarios: grade calculation, time allocation, statistical analysis, percentage problems

**VALIDATION COMPLETE**: Only proceed if ALL checks passed.

---

## 🎯 GENERATION INSTRUCTION

Generate exactly ${questionCount} high-quality questions following:
- The archetype distribution specified above
- The structural form distribution specified above
- The cognitive load distribution specified above
- All prohibitions and quality standards
- RPSC Senior Teacher (Grade II) difficulty level (higher than REET)

Each question must be pedagogically sound, scenario-based where applicable, and test genuine teaching method knowledge rather than mere recall.

**Remember:** You are training senior mathematics teachers who will teach grades 9-12. Questions should reflect the complexity and depth expected at that level.`
}

// ============================================================================
// PROTOCOL EXPORT
// ============================================================================

export const mathematicsTeachingMethods: Protocol = {
  id: 'rpsc-senior-teacher-grade2-paper2-mathematics-teaching-methods',
  name: 'Mathematics Teaching Methods',
  streamName: 'RPSC Senior Teacher (Grade II)',
  subjectName: 'Mathematics-Teaching-Methods',
  difficultyMappings,
  prohibitions,
  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 3,
    warmupPercentage: 0.1
  },
  buildPrompt: buildPrompt as any, // Type assertion: Maths protocols use chapterKnowledge instead of hasStudyMaterials
  validators: [],
  metadata: {
    description: 'RPSC Senior Teacher Grade II Paper 2: Mathematics Teaching Methods - ENHANCED SENIOR TEACHER LEVEL',
    analysisSource: 'Based on RPSC 2022 analysis + Paper 1 Rajasthan GK quality standards',
    version: '3.0.0',
    lastUpdated: '2025-01-23',
    examType: 'COMPETITIVE GOVERNMENT EXAM - SENIOR TEACHER (Grade II)',
    sectionWeightage: '20 questions out of 150 total in Paper-II',
    difficultyMultiplier: '4-6x (professional pedagogy - higher than B.Ed. level)',
    cognitiveLoadTarget: '50% high-density for balanced difficulty',
    note: `ENHANCED PROTOCOL (v3.0) - SENIOR TEACHER LEVEL STANDARDS:

**STRUCTURAL DISTRIBUTION (Balanced Difficulty - 20 questions):**
  - Standard MCQ: 20% (4Q)
  - Multi-Statement Evaluation (MSQ): 40% (8Q) - DOMINANT format
  - Match-the-Following: 25% (5Q)
  - Assertion-Reason: 15% (3Q)
  - Arrange-in-Order: 0% (not applicable for pedagogy)

**ARCHETYPE DISTRIBUTION (Balanced Difficulty):**
  - methodSelection: 35% (identify teaching method for scenario)
  - directRecall: 25% (terminology, founders, NCF principles)
  - propertyClassification: 20% (Bloom taxonomy, objective types)
  - negativeDiscrimination: 12% (identify what is NOT correct)
  - comparativeReasoning: 8% (compare pedagogical approaches)

**COGNITIVE LOAD TARGET (Balanced):**
  - Low-Density: 10%
  - Medium-Density: 40%
  - High-Density: 50%

**NEW QUALITY ENHANCEMENTS:**
  - Explicit difficulty multiplier: 4-6x (professional pedagogy level)
  - Comprehensive validation procedures (21-point checklist + 5-step pre-return validation)
  - Pedagogical accuracy validation (NCF 2005, teaching methods, Bloom's taxonomy)
  - Senior teacher level standards (professional-grade questions)
  - Scenario-based emphasis (realistic classroom contexts)
  - Forbidden quality failures explicitly defined

**COMPETITIVE EXAM FOCUS:**
  - Test PRACTICAL APPLICATION not just theoretical knowledge
  - Scenario-based method selection (40% of actual exam)
  - Questions discriminate between "knows terms" vs "can apply"
  - Mathematics-specific pedagogical content knowledge
  - Challenge experienced mathematics educators

**Content Focus:**
  - NCF 2005 mathematics education principles
  - Constructivist approaches to mathematics teaching
  - Assessment for learning strategies
  - Common student misconceptions in mathematics
  - Differentiated instruction and inclusive pedagogy
  - Teaching methods: Inductive, deductive, problem-based, inquiry-based
  - Learning theories: Piaget, Vygotsky, Bruner, Bloom

**Quality Characteristics:**
  - Pedagogically accurate and current
  - Scenario-based questions requiring practical reasoning
  - Appropriate for evaluating experienced mathematics educators
  - Tests pedagogical content knowledge, not just general pedagogy
  - Realistic secondary mathematics classroom contexts`
  }
}

/**
 * ============================================================================
 * 📚 ACTUAL QUESTION EXAMPLES FROM RPSC-STYLE PAPERS
 * ============================================================================
 *
 * These examples demonstrate the protocol archetypes and structural forms
 * applied to mathematics teaching methods, pedagogy, and curriculum content.
 */

// ============================================================================
// BASIC EXAMPLES - DIFFERENT ARCHETYPES
// ============================================================================

/**
 * Example 1: methodSelection - Teaching Method for Scenario
 *
 * Question: एक शिक्षक अपने छात्रों को 'बाग़ परियोजना' के माध्यम से गणित सिखाना चाहता है।
 * कौन सी शिक्षण विधि सबसे उपयुक्त है?
 * (A teacher wants to teach mathematics through a 'garden project'.
 * Which teaching method is most appropriate?)
 *
 * (1) आगमन विधि (Inductive method)
 * (2) निगमन विधि (Deductive method)
 * (3) परियोजना विधि (Project method)
 * (4) विश्लेषणात्मक विधि (Analytical method)
 *
 * Archetype: methodSelection
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: mediumDensity
 * Correct Answer: (3)
 * Explanation: Project method involves learning through real-life projects where
 *              students apply mathematical concepts in practical contexts. The
 *              garden project is a perfect example of project-based learning.
 */

/**
 * Example 2: directRecall - Historical Knowledge
 *
 * Question: शून्य से विभाजन के लिए 'अनंत' की अवधारणा की कल्पना किसने की?
 * (Who imagined the concept of 'infinity' for division by zero?)
 *
 * (1) आर्यभट्ट (Aryabhatta)
 * (2) ब्रह्मगुप्त (Brahmagupta)
 * (3) भास्कराचार्य (Bhaskaracharya)
 * (4) विष्णुगुप्त (Vishnugupta)
 *
 * Archetype: directRecall
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: lowDensity
 * Correct Answer: (3)
 * Explanation: Bhaskaracharya (Bhaskara II) in his work Bijaganita introduced
 *              the concept of infinity (khahara) to represent division by zero.
 */

/**
 * Example 3: negativeDiscrimination - Unit Test Characteristics
 *
 * Question: गणित में इकाई परीक्षण (Unit Test) की निम्नलिखित में से कौन सी विशेषता नहीं हो सकती?
 * (Which of the following CANNOT be a characteristic of unit test in Mathematics?)
 *
 * (1) यह विशिष्ट इकाई पर केंद्रित है
 *     (It focuses on a specific unit)
 * (2) यह अंतिम मूल्यांकन के लिए उपयोग होता है
 *     (It is used for final evaluation)
 * (3) यह नियमित अंतराल पर लिया जाता है
 *     (It is conducted at regular intervals)
 * (4) यह सीखने में सुधार के लिए फीडबैक देता है
 *     (It provides feedback for learning improvement)
 *
 * Archetype: negativeDiscrimination
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: mediumDensity
 * Correct Answer: (2)
 * Explanation: Unit tests are formative assessments conducted during the learning
 *              process to monitor progress and provide feedback. They are NOT used
 *              for final/summative evaluation. Option (2) describes summative assessment.
 */

/**
 * Example 4: propertyClassification - Bloom's Taxonomy
 *
 * Question: ब्लूम वर्गीकरण के अंतर्गत संज्ञानात्मक क्षेत्र (Cognitive Domain) का सर्वोच्च स्तर है:
 * (The highest level of cognitive domain under Bloom's taxonomy is:)
 *
 * (1) विश्लेषण (Analysis)
 * (2) संश्लेषण (Synthesis)
 * (3) मूल्यांकन (Evaluation)
 * (4) ज्ञान (Knowledge)
 *
 * Archetype: propertyClassification
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: lowDensity
 * Correct Answer: (3)
 * Explanation: In Bloom's original taxonomy, Evaluation is the highest level in
 *              the cognitive domain hierarchy: Knowledge → Comprehension → Application
 *              → Analysis → Synthesis → Evaluation.
 */

/**
 * Example 5: comparativeReasoning - Teaching Method Criticism
 *
 * Question: निम्नलिखित में से किस विधि की आलोचना रटने को प्रोत्साहित करने के लिए की जाती है?
 * (Which method is criticized for encouraging memorization?)
 *
 * (1) आगमन विधि (Inductive method)
 * (2) निगमन विधि (Deductive method)
 * (3) समस्या समाधान विधि (Problem-solving method)
 * (4) परियोजना विधि (Project method)
 *
 * Archetype: comparativeReasoning
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: mediumDensity
 * Correct Answer: (2)
 * Explanation: The deductive method (rule → examples → application) is often
 *              criticized for encouraging rote memorization of formulas and rules
 *              without understanding. In contrast, inductive and problem-solving
 *              methods emphasize discovery and understanding.
 */

/**
 * Example 6: methodSelection - Real-Life Connection
 *
 * Question: कौन सी विधि गणित को वास्तविक जीवन की स्थितियों से जोड़ने में सबसे प्रभावी है?
 * (Which method is most effective in connecting mathematics with real-life situations?)
 *
 * (1) व्याख्यान विधि (Lecture method)
 * (2) परियोजना विधि (Project method)
 * (3) प्रश्नोत्तर विधि (Question-answer method)
 * (4) अभ्यास विधि (Practice method)
 *
 * Archetype: methodSelection
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: mediumDensity
 * Correct Answer: (2)
 * Explanation: Project method involves students working on real-world problems and
 *              projects, making it the most effective approach for connecting
 *              mathematics with real-life situations. Students apply mathematical
 *              concepts to solve authentic problems.
 */

/**
 * Example 7: propertyClassification - Learning Objective Classification
 *
 * Question: "समूह G={1,2,3,4,5,6} के जनक (generators) ज्ञात कीजिए" यह प्रश्न किस उद्देश्य पर आधारित है?
 * ("Find the generators of group G={1,2,3,4,5,6}" - This question is based on which objective?)
 *
 * (1) ज्ञान (Knowledge)
 * (2) अवबोध (Understanding)
 * (3) कौशल (Skill)
 * (4) अनुप्रयोग (Application)
 *
 * Archetype: propertyClassification
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: highDensity
 * Correct Answer: (4)
 * Explanation: This question requires applying group theory concepts to identify
 *              generators, which goes beyond simple recall (knowledge) or
 *              understanding. It involves application of mathematical concepts.
 */

/**
 * Example 8: directRecall - NCF 2005 Principle
 *
 * Question: NCF 2005 के अनुसार, गणित शिक्षण का मुख्य उद्देश्य है:
 * (According to NCF 2005, the main objective of mathematics teaching is:)
 *
 * (1) गणितीय कलन विधि सीखना (Learning computational algorithms)
 * (2) तार्किक चिंतन विकसित करना (Developing logical thinking)
 * (3) परीक्षा में अच्छे अंक प्राप्त करना (Getting good marks in exams)
 * (4) सूत्र याद करना (Memorizing formulas)
 *
 * Archetype: directRecall
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: lowDensity
 * Correct Answer: (2)
 * Explanation: NCF 2005 emphasizes mathematics as a tool for developing logical
 *              thinking and problem-solving skills, not merely computational
 *              ability or rote memorization.
 */

/**
 * Example 9: negativeDiscrimination - Supervised Study Method
 *
 * Question: निम्नलिखित में से कौन सी पर्यवेक्षित अध्ययन विधि (Supervised Study Method) की
 * विशेषता नहीं है?
 * (Which is NOT a characteristic of supervised study method?)
 *
 * (1) छात्र अपनी गति से सीखते हैं (Students learn at their own pace)
 * (2) शिक्षक व्यक्तिगत मार्गदर्शन देता है (Teacher provides individual guidance)
 * (3) छात्र घर पर अकेले अध्ययन करते हैं (Students study alone at home)
 * (4) कक्षा में अभ्यास कार्य होता है (Practice work happens in class)
 *
 * Archetype: negativeDiscrimination
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: mediumDensity
 * Correct Answer: (3)
 * Explanation: Supervised study method involves teacher supervision and guidance
 *              during study time, typically in the classroom. Studying alone at
 *              home without supervision contradicts the core principle of this method.
 */

/**
 * Example 10: comparativeReasoning - Inductive vs Deductive
 *
 * Question: आगमन विधि (Inductive method) और निगमन विधि (Deductive method) में मुख्य अंतर है:
 * (The main difference between inductive and deductive methods is:)
 *
 * (1) आगमन विधि विशिष्ट से सामान्य की ओर जाती है
 *     (Inductive goes from specific to general)
 * (2) निगमन विधि विशिष्ट से सामान्य की ओर जाती है
 *     (Deductive goes from specific to general)
 * (3) दोनों विधियाँ समान हैं
 *     (Both methods are the same)
 * (4) दोनों विधियाँ प्रयोगशाला आधारित हैं
 *     (Both methods are laboratory-based)
 *
 * Archetype: comparativeReasoning
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: mediumDensity
 * Correct Answer: (1)
 * Explanation: Inductive method moves from specific examples to general rules
 *              (examples → pattern → rule), while deductive method moves from
 *              general rules to specific applications (rule → examples → practice).
 */

// ============================================================================
// ADVANCED STRUCTURAL FORM EXAMPLES
// ============================================================================

/**
 * Example 11: multipleSelectQuestions (MSQ) - NCF 2005 Principles
 *
 * Question: NCF 2005 में गणित शिक्षण के संदर्भ में निम्नलिखित कथनों पर विचार कीजिए:
 * (Consider the following statements regarding mathematics teaching in NCF 2005:)
 *
 * (a) गणित को डर का विषय नहीं बनाना चाहिए
 *     (Mathematics should not be made a fearful subject)
 * (b) रटने पर कम और समझने पर अधिक बल देना चाहिए
 *     (Less emphasis on rote learning, more on understanding)
 * (c) गणित केवल गणना का विषय है
 *     (Mathematics is only about computation)
 * (d) समस्या समाधान पर जोर देना चाहिए
 *     (Problem-solving should be emphasized)
 *
 * कौन से कथन सत्य हैं?
 * (Which statements are true?)
 *
 * (1) केवल (a), (b) और (d)
 * (2) केवल (a) और (b)
 * (3) केवल (b), (c) और (d)
 * (4) सभी कथन सत्य हैं
 *
 * Archetype: directRecall
 * Structural Form: multipleSelectQuestions
 * Cognitive Load: mediumDensity
 * Correct Answer: (1)
 * Explanation: NCF 2005 emphasizes making mathematics accessible and non-threatening
 *              (a), understanding over rote learning (b), and problem-solving (d).
 *              Statement (c) is false - mathematics is much more than just computation.
 */

/**
 * Example 12: matchTheFollowing - Learning Theorists and Concepts
 *
 * Question: सूची-I को सूची-II से सुमेलित कीजिए:
 * (Match List-I with List-II:)
 *
 * सूची-I (शिक्षाशास्त्री / Educationist):
 * 1. Piaget
 * 2. Vygotsky
 * 3. Bruner
 * 4. Bloom
 *
 * सूची-II (अवधारणा / Concept):
 * P. सर्पिल पाठ्यक्रम (Spiral Curriculum)
 * Q. संज्ञानात्मक विकास के चरण (Stages of Cognitive Development)
 * R. समीपस्थ विकास क्षेत्र (Zone of Proximal Development)
 * S. शैक्षिक उद्देश्यों का वर्गीकरण (Taxonomy of Educational Objectives)
 *
 * (1) 1-Q, 2-R, 3-P, 4-S
 * (2) 1-R, 2-Q, 3-P, 4-S
 * (3) 1-Q, 2-P, 3-R, 4-S
 * (4) 1-P, 2-Q, 3-R, 4-S
 *
 * Archetype: directRecall
 * Structural Form: matchTheFollowing
 * Cognitive Load: mediumDensity
 * Correct Answer: (1)
 * Explanation:
 * - Piaget: Stages of Cognitive Development (Sensorimotor, Preoperational, etc.) → Q
 * - Vygotsky: Zone of Proximal Development (ZPD) → R
 * - Bruner: Spiral Curriculum (revisiting concepts at increasing complexity) → P
 * - Bloom: Taxonomy of Educational Objectives (Knowledge to Evaluation) → S
 */

/**
 * Example 13: assertionReasoning - Constructivist Approach
 *
 * Question:
 * कथन (A): गणित में रचनावादी उपागम (Constructivist approach) छात्रों को सक्रिय शिक्षार्थी बनाता है।
 * (Assertion (A): Constructivist approach in mathematics makes students active learners.)
 *
 * कारण (R): रचनावाद में छात्र स्वयं ज्ञान का निर्माण करते हैं।
 * (Reason (R): In constructivism, students construct knowledge themselves.)
 *
 * (1) (A) और (R) दोनों सत्य हैं और (R), (A) की सही व्याख्या है
 *     (Both (A) and (R) are true and (R) is the correct explanation of (A))
 * (2) (A) और (R) दोनों सत्य हैं परन्तु (R), (A) की सही व्याख्या नहीं है
 *     (Both (A) and (R) are true but (R) is NOT the correct explanation of (A))
 * (3) (A) सत्य है परन्तु (R) असत्य है
 *     ((A) is true but (R) is false)
 * (4) (A) असत्य है परन्तु (R) सत्य है
 *     ((A) is false but (R) is true)
 *
 * Archetype: conceptIntegration
 * Structural Form: assertionReasoning
 * Cognitive Load: highDensity
 * Correct Answer: (1)
 * Explanation: Both statements are true. The constructivist approach makes students
 *              active learners BECAUSE they construct their own knowledge through
 *              exploration, inquiry, and problem-solving rather than passively
 *              receiving information. (R) correctly explains why (A) is true.
 */

/**
 * Example 14: multipleSelectQuestions - Formative Assessment Techniques
 *
 * Question: निम्नलिखित में से कौन सी रचनात्मक मूल्यांकन (Formative Assessment) की तकनीकें हैं?
 * (Which of the following are formative assessment techniques?)
 *
 * (a) कक्षा में मौखिक प्रश्न पूछना (Asking oral questions in class)
 * (b) वार्षिक परीक्षा (Annual examination)
 * (c) दैनिक गृहकार्य की जांच (Daily homework checking)
 * (d) बोर्ड परीक्षा (Board examination)
 *
 * (1) केवल (a) और (c)
 * (2) केवल (b) और (d)
 * (3) केवल (a), (b) और (c)
 * (4) सभी विकल्प
 *
 * Archetype: propertyClassification
 * Structural Form: multipleSelectQuestions
 * Cognitive Load: mediumDensity
 * Correct Answer: (1)
 * Explanation: Formative assessment is ongoing assessment during the learning process
 *              to provide feedback and improve learning. Oral questions (a) and
 *              homework checking (c) are formative. Annual exam (b) and board exam (d)
 *              are summative assessments conducted at the end.
 */

/**
 * Example 15: conceptIntegration - Addressing Misconceptions
 *
 * Question: एक छात्र मानता है कि "0.5 < 0.25 क्योंकि 5 < 25"। इस भ्रांति को दूर करने के लिए
 * सबसे उपयुक्त रणनीति है:
 * (A student believes "0.5 < 0.25 because 5 < 25". The most appropriate strategy
 * to address this misconception is:)
 *
 * (1) छात्र को सही उत्तर बता देना
 *     (Tell the student the correct answer)
 * (2) संख्या रेखा पर दशमलव संख्याओं को दर्शाना
 *     (Represent decimal numbers on number line)
 * (3) छात्र को दंडित करना
 *     (Punish the student)
 * (4) इस प्रश्न को छोड़ देना
 *     (Skip this question)
 *
 * Archetype: conceptIntegration
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: highDensity
 * Correct Answer: (2)
 * Explanation: Using a number line to visually represent 0.5 and 0.25 helps students
 *              understand that 0.5 is actually greater than 0.25. This visual
 *              representation addresses the misconception that arose from comparing
 *              digits after decimal point as whole numbers. It's a constructivist
 *              approach that builds conceptual understanding.
 */

/**
 * Example 16: methodSelection - Differentiated Instruction
 *
 * Question: एक कक्षा में विभिन्न योग्यता स्तर के छात्र हैं। शिक्षक को किस रणनीति का उपयोग करना चाहिए?
 * (A class has students of different ability levels. Which strategy should the teacher use?)
 *
 * (1) सभी छात्रों को एक समान कार्य देना
 *     (Give all students the same task)
 * (2) विभेदित अनुदेशन (Differentiated instruction)
 * (3) केवल तेज छात्रों पर ध्यान देना
 *     (Focus only on bright students)
 * (4) कमजोर छात्रों को अनदेखा करना
 *     (Ignore weak students)
 *
 * Archetype: methodSelection
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: mediumDensity
 * Correct Answer: (2)
 * Explanation: Differentiated instruction tailors teaching methods, materials, and
 *              assessments to meet individual student needs and ability levels.
 *              This inclusive approach ensures all students can learn effectively
 *              at their own level and pace.
 */

/**
 * Example 17: propertyClassification - Bloom's Revised Taxonomy
 *
 * Question: "त्रिभुज की रचना कीजिए" यह प्रश्न ब्लूम के संशोधित वर्गीकरण के किस स्तर से संबंधित है?
 * ("Construct a triangle" - This question relates to which level of Bloom's revised taxonomy?)
 *
 * (1) याद करना (Remember)
 * (2) समझना (Understand)
 * (3) लागू करना (Apply)
 * (4) मूल्यांकन करना (Evaluate)
 *
 * Archetype: propertyClassification
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: mediumDensity
 * Correct Answer: (3)
 * Explanation: Constructing a triangle requires applying geometric principles and
 *              procedures, which corresponds to the "Apply" level in Bloom's
 *              revised taxonomy. It goes beyond mere recall or understanding to
 *              actual application of knowledge.
 */

/**
 * Example 18: directRecall - Technology in Mathematics
 *
 * Question: GeoGebra software का उपयोग किस गणितीय विषय के शिक्षण में सबसे प्रभावी है?
 * (GeoGebra software is most effective for teaching which mathematical topic?)
 *
 * (1) संख्या प्रणाली (Number system)
 * (2) ज्यामिति और बीजगणित (Geometry and Algebra)
 * (3) केवल सांख्यिकी (Only Statistics)
 * (4) केवल संभाव्यता (Only Probability)
 *
 * Archetype: directRecall
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: lowDensity
 * Correct Answer: (2)
 * Explanation: GeoGebra is an interactive geometry, algebra, and calculus software
 *              that is particularly effective for teaching geometry and algebra
 *              through dynamic visualizations and manipulations.
 */

/**
 * Example 19: negativeDiscrimination - Assessment Strategy
 *
 * Question: निम्नलिखित में से कौन सा सहकर्मी मूल्यांकन (Peer Assessment) का लाभ नहीं है?
 * (Which is NOT a benefit of peer assessment?)
 *
 * (1) छात्रों में आत्म-मूल्यांकन कौशल विकसित होता है
 *     (Develops self-assessment skills in students)
 * (2) सहयोगात्मक शिक्षण को बढ़ावा मिलता है
 *     (Promotes collaborative learning)
 * (3) शिक्षक का समय बचता है
 *     (Saves teacher's time)
 * (4) हमेशा 100% सटीक मूल्यांकन मिलता है
 *     (Always provides 100% accurate assessment)
 *
 * Archetype: negativeDiscrimination
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: mediumDensity
 * Correct Answer: (4)
 * Explanation: While peer assessment has many benefits like developing self-assessment
 *              skills, promoting collaboration, and saving teacher time, it does NOT
 *              guarantee 100% accuracy as students may lack expertise or be biased.
 *              This is a limitation, not a benefit.
 */

/**
 * Example 20: comparativeReasoning - Assessment Types
 *
 * Question: निदानात्मक मूल्यांकन (Diagnostic Assessment) और रचनात्मक मूल्यांकन (Formative Assessment)
 * में मुख्य अंतर है:
 * (The main difference between diagnostic and formative assessment is:)
 *
 * (1) निदानात्मक मूल्यांकन सीखने से पहले, रचनात्मक मूल्यांकन सीखने के दौरान
 *     (Diagnostic before learning, formative during learning)
 * (2) दोनों समान हैं
 *     (Both are the same)
 * (3) निदानात्मक मूल्यांकन अंत में, रचनात्मक मूल्यांकन शुरुआत में
 *     (Diagnostic at end, formative at beginning)
 * (4) दोनों केवल परीक्षा के लिए हैं
 *     (Both are only for examinations)
 *
 * Archetype: comparativeReasoning
 * Structural Form: standard4OptionMCQ
 * Cognitive Load: highDensity
 * Correct Answer: (1)
 * Explanation: Diagnostic assessment is conducted BEFORE instruction to identify
 *              students' prior knowledge, strengths, and weaknesses. Formative
 *              assessment is conducted DURING instruction to monitor progress and
 *              provide ongoing feedback. This timing difference is fundamental.
 */

export default mathematicsTeachingMethods
