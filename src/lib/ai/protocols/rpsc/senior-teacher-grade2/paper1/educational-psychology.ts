/**
 * RPSC Senior Teacher (Grade II) - Paper 1: Educational Psychology Protocol
 *
 * UPDATED: REET 2026-Inspired Protocol (Grade 2 MORE difficult than REET Grade 3)
 * Section: Educational Psychology
 * Question Count: ~20 questions per paper
 *
 * EXAM CONTEXT:
 * - Part of Common Paper 1 for ALL RPSC Senior Teacher Grade II candidates
 * - Covers learning theories, development, personality, intelligence, motivation, attitudes
 * - Theory-heavy section requiring knowledge of psychologists and their theories
 * - All questions in Hindi (primary language)
 *
 * NEW STRUCTURAL DISTRIBUTION (2026 Pattern):
 * - Standard MCQ: 20% (REDUCED from 100%)
 * - Multi-Statement Evaluation (MSQ): 40% (NEW DOMINANT - most difficult)
 * - Match-the-Following: 25% (NEW)
 * - Arrange-in-Order: 10% (NEW)
 * - Assertion-Reason: 5% (NEW)
 *
 * DIFFICULTY: 4-6x multiplier (higher than REET's 3-5x)
 * HIGH COGNITIVE LOAD: 65% (highest in Paper 1 - theory-heavy section)
 */

import { Protocol, ProtocolConfig } from '../../../types'
import { Question } from '../../../../questionValidator'
import type { ChapterKnowledge } from '../../../../types/chapterKnowledge'

/**
 * Educational Psychology Archetype Distributions
 * Difficulty: 20% Easy, 50% Balanced, 30% Hard
 */

const edPsychArchetypes = {
  easy: {
    definitional: 0.30,              // REDUCED from 0.50 - still important but balanced
    multiStatementEvaluation: 0.30,  // INCREASED from 0.20 - more MSQ practice
    theoryIdentification: 0.20,      // REDUCED from 0.30 - basic theory matching
    matchTheFollowing: 0.15,         // NEW - basic theorist-theory pairs
    arrangeInOrder: 0.05             // NEW - simple stage sequences
  },
  balanced: {
    theoryIdentification: 0.10,      // ADJUSTED - 10% (theory identification, basic recall)
    matchTheFollowing: 0.20,         // ADJUSTED - 20% Match theorist-theory-concept
    multiStatementEvaluation: 0.35,  // ADJUSTED - 35% MSQ format (reduced from 40%)
    scenarioApplication: 0.05,       // ADJUSTED - 5% (reduced from 15%)
    arrangeInOrder: 0.15,            // ADJUSTED - 15% Arrange stages/taxonomies (increased from 10%)
    assertionReason: 0.15            // ADDED - 15% A-R (theory-application causal reasoning)
  },
  hard: {
    multiStatementEvaluation: 0.45,  // NEW DOMINANT - Complex MSQ
    matchTheFollowing: 0.30,         // Complex theorist-theory matching
    scenarioApplication: 0.15,       // Reduced but still present
    arrangeInOrder: 0.10             // Complex stage sequencing
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
    standard4OptionMCQ: 0.15,       // ADJUSTED - 15% (reduced from 20%)
    multipleSelectQuestions: 0.35,  // ADJUSTED - 35% MSQ (reduced from 40%)
    matchTheFollowing: 0.20,        // ADJUSTED - 20% Match (reduced from 25%)
    arrangeInOrder: 0.15,           // ADJUSTED - 15% Arrange (increased from 10%)
    assertionReason: 0.15           // INCREASED - 15% A-R (up from 5% - critical for theory-application reasoning)
  },
  hard: {
    standard4OptionMCQ: 0.10,       // Minimal MCQ for hard
    multipleSelectQuestions: 0.50,  // Maximum MSQ (hardest format)
    matchTheFollowing: 0.25,        // Same as balanced
    arrangeInOrder: 0.10,           // Same as balanced
    assertionReason: 0.05           // Same as balanced
  }
}

/**
 * Cognitive Load Distribution - SMOOTHED PROGRESSION
 * Grade 2 Target: High-density 65% (HIGHEST in Paper 1 - theory-heavy)
 * Smooth progression: 25% → 65% → 78% (not steep 10% → 65% → 78%)
 */
const cognitiveLoad = {
  easy: {
    lowDensity: 0.40,    // REDUCED from 0.60 - easier but progressing
    mediumDensity: 0.35, // INCREASED from 0.30 - more medium-density
    highDensity: 0.25    // 2.5x from 0.10 - smooth progression to balanced
  },
  balanced: {
    lowDensity: 0.05,    // PLAN TARGET - minimal low-density (theory-heavy)
    mediumDensity: 0.30, // PLAN TARGET
    highDensity: 0.65    // PLAN TARGET - HIGHEST load (theory demands)
  },
  hard: {
    lowDensity: 0.02,    // Minimal low-density
    mediumDensity: 0.20, // Reduced medium
    highDensity: 0.78    // Maximum difficulty
  }
}

/**
 * Difficulty Mappings - NOW WITH SEPARATE STRUCTURAL FORMS PER DIFFICULTY
 */
const difficultyMappings: Protocol['difficultyMappings'] = {
  easy: {
    archetypes: edPsychArchetypes.easy as any,
    structuralForms: structuralForms.easy as any,      // FIXED: Use easy structural forms
    cognitiveLoad: cognitiveLoad.easy
  },
  balanced: {
    archetypes: edPsychArchetypes.balanced as any,
    structuralForms: structuralForms.balanced as any,  // FIXED: Use balanced structural forms
    cognitiveLoad: cognitiveLoad.balanced
  },
  hard: {
    archetypes: edPsychArchetypes.hard as any,
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
  'NEVER use outdated psychological terminology',
  'NEVER create ambiguous scenarios where multiple theories could apply',
  'NEVER use culturally biased examples (keep Indian context)',
  'DUPLICATE OPTIONS FORBIDDEN - All 4 must be unique',
  'NEVER create questions where options are synonyms of each other',

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
  'NEVER use these archetypes: singleFactRecall, exceptionNegative, comparative, statementValidation, matching, sequencing',
  'ONLY use these 7 allowed archetypes: multiStatementEvaluation, matchTheFollowing, arrangeInOrder, assertionReason, scenarioApplication, theoryIdentification, definitional',
  'NEVER use archetypes from other protocols - use only the 7 allowed for Educational Psychology',
  'NEVER use old archetype names from previous versions - use only the 7 allowed names above',

  // ARCHETYPE DISTRIBUTION ENFORCEMENT (CRITICAL - MANDATORY COMPLIANCE):
  '🔴 ARCHETYPE COUNTS ARE MANDATORY - NOT SUGGESTIONS: You MUST generate EXACTLY the specified counts for each archetype',
  '🔴 ASSERTION-REASON MINIMUM ENFORCED: If protocol specifies N Assertion-Reason questions, generate AT LEAST N questions - DO NOT under-generate this format',
  '🔴 MSQ (Multi-Statement) MINIMUM ENFORCED: If protocol specifies N MSQ questions, generate AT LEAST N questions - This is the DOMINANT format',
  '🔴 MATCH-THE-FOLLOWING MINIMUM ENFORCED: If protocol specifies N Match questions, generate AT LEAST N questions',
  '🔴 ARRANGE-IN-ORDER MINIMUM ENFORCED: If protocol specifies N Arrange questions, generate AT LEAST N questions',
  '🔴 DO NOT over-generate basic recall at expense of complex formats - respect the percentages strictly',
  '🔴 BEFORE RETURNING: Count each archetype - if ANY archetype falls short of target by 2+, REGENERATE those missing questions',

  // QUALITY PATTERN PROHIBITIONS (CRITICAL - Zero Tolerance):
  '❌ MSQ "ALL CORRECT" ABSOLUTELY BANNED: NEVER EVER make MSQ questions where all statements (a,b,c,d) are correct - ZERO TOLERANCE - Not even 1 question',
  '❌ SEQUENTIAL MATCHING ABSOLUTELY BANNED: NEVER EVER make Match-the-Following with A-i, B-ii, C-iii, D-iv as correct answer - ZERO TOLERANCE - Not even 1 question',
  '❌ SEQUENTIAL ORDERING ABSOLUTELY BANNED: NEVER EVER make Arrange-in-Order with A-B-C-D as correct answer - ZERO TOLERANCE - Not even 1 question',
  '❌ A-R OPTION 1 DOMINANCE FORBIDDEN: NEVER make more than 60% of Assertion-Reason questions have option (1) - Distribute across all 4 options',
  '❌ SIMPLISTIC PSYCHOLOGY BANNED: NEVER make trivial questions that any layperson could answer without psychology knowledge',
  'EVERY MSQ MUST have mix of true/false statements requiring discrimination - create realistic false statements using misattributions, reversed theories, incorrect age ranges',
  'EVERY Match MUST have scrambled pattern (e.g., A-iii, B-i, C-iv, D-ii) - minimum 2 items crossed',
  'EVERY Arrange MUST scramble item order (e.g., B-D-A-C, D-A-C-B, A-D-C-B) - present items in random/shuffled order, NOT natural sequence',
  'A-R questions MUST be distributed: roughly 30% opt1, 30% opt2, 20% opt3, 20% opt4 - create variation with independent truths, false assertions, false reasons',
  'PROFESSIONAL-GRADE QUESTIONS REQUIRED: Specific theorists, stages, ages, processes, nuanced distinctions - NOT obvious/generic psychology'
]

/**
 * Calculate archetype counts
 */
function getArchetypeCounts(
  difficulty: 'easy' | 'balanced' | 'hard',
  questionCount: number
): Record<string, number> {
  const archetypes = edPsychArchetypes[difficulty]
  const counts: Record<string, number> = {}

  for (const [key, value] of Object.entries(archetypes)) {
    counts[key] = Math.round(questionCount * value)
  }

  return counts
}

/**
 * Educational Psychology Prompt Builder
 */
function buildEdPsychPrompt(
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

  return `You are an expert RPSC Senior Teacher (Grade II) Paper 1 question generator. Generate ${questionCount} high-quality RPSC-style Educational Psychology questions ${hasStudyMaterials ? `from the provided study materials for the topic: "${chapterName}"` : `using your comprehensive RPSC exam knowledge for: "${chapterName}"`}.

This is part of a ${totalQuestions}-question Paper 1 testing Educational Psychology knowledge.

${!hasStudyMaterials ? `
## CONTENT SOURCE

⚠️  **AI KNOWLEDGE MODE**: No study materials provided
- Generate questions using your training knowledge of RPSC Senior Teacher Grade II exam
- Cover learning theories, child development, personality, intelligence, and motivation
- Include major educational psychologists and their contributions
- Balance theory-based recall with application-oriented scenario questions
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

## ⚠️ CRITICAL QUALITY STANDARDS - READ CAREFULLY

This is a COMPETITIVE GOVERNMENT EXAM for SENIOR TEACHER positions. Questions MUST be:
- **Academically rigorous** - test deep psychological knowledge, not superficial definitions
- **Professionally appropriate** - suitable for evaluating experienced educators
- **Discriminating** - separate strong candidates from weak ones
- **Complex enough** to challenge senior-level candidates
- **NOT simplistic** - avoid obvious/trivial psychology that insult candidate intelligence
- **NOT generic** - use specific theories, psychologists, stages, processes with precise details
- **Theory-grounded** - every question must be rooted in established educational psychology

**FORBIDDEN QUALITY FAILURES:**
❌ Overly simple definitions that any layperson could answer
❌ Generic questions without specific theorist attribution or precise details
❌ Questions with obvious answers that don't test real psychological knowledge
❌ Lazy statement combinations that are all obviously true/false
❌ Predictable matching patterns (theorist names in same order as theories)
❌ Surface-level recall when deeper application/analysis is possible
❌ Misattributed theories or incorrect age ranges for developmental stages

**REQUIRED QUALITY MARKERS:**
✅ Specific details (theorist names, stage ages, process names, exact terminology)
✅ Nuanced distinctions requiring careful study of educational psychology
✅ Integration of multiple theories or concepts (e.g., Piaget + Vygotsky comparison)
✅ Critical thinking and analytical reasoning about psychological concepts
✅ Professional-grade difficulty appropriate for senior educators
✅ Scenario-based application questions that test understanding, not just memorization

---

## CRITICAL RPSC-SPECIFIC REQUIREMENTS

⚠️  **OPTION COUNT**: Each question MUST have exactly 4 options labeled (1), (2), (3), (4)
- NOT 5, NOT 3, EXACTLY 4 options

**EXAM CONTEXT**: Paper 1 - Educational Psychology Section (~20 questions)
- Tests knowledge of learning theories, development, personality, intelligence
- Requires understanding of major educational psychologists and their theories
- Application-oriented questions with scenarios

**LANGUAGE**: ${isBilingual
  ? `BILINGUAL MODE - Generate questions in BOTH Hindi and English
- Hindi is PRIMARY (always required) - Use Devanagari script
- English is SECONDARY (for bilingual support)
- Both languages must convey the SAME meaning and difficulty
- Generate both languages in a SINGLE response
- English names of psychologists can be used as-is in both languages: Piaget, Vygotsky, Bruner, etc.

⚠️ CRITICAL BILINGUAL RULE - MUST FOLLOW ⚠️

Hindi fields (questionText, options) MUST NEVER contain English text in parentheses.

❌ ABSOLUTELY FORBIDDEN EXAMPLES:
   - "संज्ञानात्मक विकास (Cognitive Development)"
   - "अभिप्रेरणा (Motivation)"
   - "बुद्धिमत्ता (Intelligence)"

✅ REQUIRED FORMAT:
   - questionText: "संज्ञानात्मक विकास"
   - questionText_en: "Cognitive Development"
   - options.A: "अभिप्रेरणा"
   - options_en.A: "Motivation"

**Translation Guidelines**:
- Psychologist names: Keep identical in both languages (Piaget, Vygotsky)
- Technical terms: Use standard English equivalents for psychology terms
- Numbers/Ages: Keep identical in both languages
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
- Use Devanagari script for all questions and options
- English names of psychologists can be used: Piaget, Vygotsky, Bruner, etc.`}

---

## SECTION OVERVIEW

**Educational Psychology (~20 questions out of 100 total)**

Content Domains:
- **Learning Theories** (25%): Piaget, Vygotsky, Bandura, Bruner, Gagne
- **Development** (20%): Cognitive, emotional, moral, social development theories
- **Personality & Adjustment** (15%): Traits, projective techniques, defense mechanisms
- **Intelligence & Creativity** (15%): Gardner, Sternberg, Torrance tests
- **Motivation** (10%): Maslow, achievement motivation, drives
- **Individual Differences** (10%): Gifted, slow learners, special needs, delinquency
- **Attitude & Self-Concept** (5%): Social psychology, self-views

---

## QUESTION ARCHETYPE DISTRIBUTION (Target Counts)

${archetypeList}

### Archetype Definitions:

**Multi-Statement Evaluation (MSQ) (${archetypeCounts.multiStatementEvaluation || 0} required):**
- **NEW DOMINANT FORMAT** - 4-5 statements labeled (a), (b), (c), (d), (e)
- Candidate evaluates truth of each statement about theories/concepts
- Options present combinations: "(1) केवल (a) और (b)", "(2) केवल (a), (c) और (d)"
- **4x harder than standard MCQ** - requires evaluating multiple theoretical facts simultaneously
- Tests comprehensive understanding of psychological theories and concepts
- Examples: "Which statements about Piaget's theory are correct?", "Identify correct statements about Bandura's observational learning"
- Cognitive load: HIGH - must verify 4-5 independent theoretical claims

**Match-the-Following (${archetypeCounts.matchTheFollowing || 0} required):**
- **NEW PROMINENT FORMAT** - Match 4 items from List-I with List-II
- Occasionally 5 pairs for Grade 2 difficulty
- All-or-nothing scoring (entire pattern must be correct)
- **3x harder than standard MCQ**
- Types: Theorist-Theory, Theory-Concept, Psychologist-Stage/Process, Concept-Example
- Examples: Match theorists with theories, Match stages with age ranges, Match intelligence types with definitions
- Pattern examples: Piaget→Accommodation, Bandura→Observational Learning, Gagne→Problem Solving

**Arrange-in-Order (${archetypeCounts.arrangeInOrder || 0} required):**
- **NEW FORMAT** - Arrange 4 items in correct sequence
- Occasionally 5 items for Grade 2 difficulty
- **3x harder than standard MCQ**
- Types: Developmental stages (chronological), Observational learning processes (sequential), Taxonomies (hierarchical)
- Examples: "Arrange Piaget's stages chronologically", "Arrange Bandura's observational learning processes in correct sequence"
- Options present different sequences: "(1) A-B-C-D", "(2) B-A-D-C"

**Assertion-Reason (${archetypeCounts.assertionReason || 0} required):**
- **NEW FORMAT** - Two statements: Assertion (A) and Reason (R)
- Evaluate: (1) Both true, R explains A, (2) Both true, R doesn't explain A, (3) A true, R false, (4) A false, R true
- Requires 4-dimensional logical evaluation
- Tests causal relationships in psychological theories
- Example: "A: Children learn through observation. R: Bandura proposed observational learning theory."
- Cognitive load: HIGH - requires truth verification + theoretical causal analysis

**Scenario-Based Application (${archetypeCounts.scenarioApplication || 0} required):**
- **REDUCED EMPHASIS** (15% vs old 30%)
- Present a scenario, ask which theory/concept applies
- Examples: "A child revises existing scheme... this example is related to which process?"
- Requires understanding theory deeply enough to recognize it in practice

**Theory Identification (${archetypeCounts.theoryIdentification || 0} required):**
- **REDUCED EMPHASIS** (5% vs old 35%)
- Link theory/concept to correct theorist or theoretical framework
- Examples: "According to Piaget, this process is called:"
- Used for foundational theory-to-theorist linkage

**Definitional (${archetypeCounts.definitional || 0} required):**
- **REDUCED EMPHASIS** (5% vs old 25%)
- Identify the correct technical term for a concept/process
- Examples: "This thinking process is called:", "This trait is called:"
- Used for essential terminology only

---

## CONTENT DOMAIN DETAILS

### LEARNING THEORIES (25%):

**Jean Piaget:**
- Cognitive development: Sensorimotor, Preoperational, Concrete Operational, Formal Operational
- Key concepts: Accommodation (revising existing schema), Assimilation (fitting new info into schema), Equilibrium, Disequilibrium
- Example: Child revises fashion scheme → Accommodation

**Lev Vygotsky:**
- Sociocultural theory: Adults convey cultural interpretations to children
- Zone of Proximal Development (ZPD)
- Language and social interaction in learning
- Development proceeds from general to specific

**Albert Bandura:**
- Observational learning (Social Learning Theory)
- Four processes: Attentional → Retentional → Production → Motivational
- Motivational process involves: External incentives and vicarious incentives
- Model behavior imitation

**Robert Gagne:**
- Hierarchy of learning (8 levels)
- Highest stage: Problem solving learning (NOT principle learning/multi-discrimination/stimulus-response)

**Jerome Bruner:**
- Discovery learning
- Spiral curriculum
- Scaffolding concept

**Urie Bronfenbrenner:**
- Bioecological Systems Theory
- Microsystem: Settings where child spends considerable time (family, peers, school, neighborhood)
- Mesosystem, Exosystem, Macrosystem, Chronosystem

**Constructivism:**
- Conditions: New learning based on previous knowledge, meaningful tasks, active knowledge creation, social interaction facilitation
- All four conditions (a,b,c,d) are appropriate for constructivist learning

### DEVELOPMENT (20%):

**Moral Development (Kohlberg):**
- Thinking process in right/wrong judgments: Moral Reasoning (NOT moral realism/crisis/dilemma)

**Emotional Development (Bridges):**
- Jealousy first appears: 18 months (NOT 5 years/3 years/12 months)

**Development Principles:**
- Development proceeds from general to specific (language development example)
- Development is product of heredity and environment
- Development is predictable
- Development is individualized

**Determinants of Learning:**
- Nature of Learning, Effect of Motivation, Effect of Set, Practice - ALL are determinants

### PERSONALITY & ADJUSTMENT (15%):

**Allport's Trait Theory:**
- Cardinal traits: Pervade whole life (devoted to achievement)
- Central traits: General characteristics
- Secondary dispositions: Specific to situations

**Projective Techniques:**
- Show pictures, ask to make up story: Projective technique (NOT sociometric/inventory/rating scale)
- Characteristics: Ambiguous material, multidimensionality, freedom of responses, NOT "response from consciousness" (that's NOT a characteristic)

**Defense Mechanisms:**
- Substitution: Choosing alternate goal when blocked (physician → lab technician)
- Identification, Repression, Regression (others)

**Adjustment:**
- Behaving according to environmental demand: Adjustment (NOT pressure/selection/response)
- Factors in maladjustment: Psychological (inability to satisfy motives), Physiological, Sociological

**Emotional Intelligence:**
- Effectively regulates emotion and behavior in social situations: Emotional intelligence (NOT general/fluid/logical)

### INTELLIGENCE & CREATIVITY (15%):

**Sternberg's Triarchic Theory:**
- Components: Meta Component, Performance Component, Knowledge Acquiring Component (NOT "Creative Component")

**Gardner's Multiple Intelligence:**
- Types: Linguistic, Logical-Mathematical, Musical, Spatial, Bodily-Kinesthetic, Interpersonal, Intrapersonal, Naturalist
- Fluid Intelligence is NOT part of Gardner's theory (that's Cattell)

**Torrence Tests of Creative Thinking:**
- Verbal test sub-tests: Ask and Guess, Unusual Uses, Unusual Questions (NOT "New Relationship")

**Baqer Mehdi Creativity Test:**
- Consists: Four verbal and three non-verbal sub-tests (NOT 3+3, 3+4, or 4+4)

**Thorndike's Multifactor Theory:**
- Attribute for task difficulty an individual can solve: Level (NOT range/area/speed)

### MOTIVATION (10%):

**Maslow's Hierarchy:**
- Highest need: Self-actualization (NOT esteem/cognitive/belongingness)

**Achievement Motivation:**
- Expectancy of satisfaction in mastering difficult performances: Achievement Motivation

**Drives:**
- Biogenic motives: Hunger Drive, Thirst Drive, Sexual Drive (NOT Curiosity Drive - that's psychogenic)

**Motivation Definition:**
- Best exemplifies motivation: Rita is energized, sets high goal, persists with effort, makes A grade
- (NOT just emotional/attention/positive feelings alone)

### INDIVIDUAL DIFFERENCES (10%):

**Gifted Learners:**
- Content enrichment programme for: Gifted learners (NOT slow/backward/delinquents)
- Characteristics: Precocity, Marching to own drummer, Passion to master (NOT "Ignorance")

**Slow Learners:**
- Teaching strategy: Introduce new material in small easy steps, relate to what they know

**Delinquents:**
- Remedial technique through psychotherapy/counseling: Psychodynamic (NOT behavioral/rehabilitation/judicial)

**Special Education:**
- Maladjustment factors: Child behavior deviations from inability to satisfy motives → Psychological factor

### ATTITUDE & SELF-CONCEPT (5%):

**Attitudes:**
- Characteristics: Subject-object relationship, motivational-affective, acquired (NOT inborn)
- Components: Cognitive, Affective, Behavioural
- Voting based on feelings about candidate: Affective component

**Self-Concept:**
- Independent view: Defining oneself in terms of own internal thoughts/feelings/actions
- Interdependent view: Defining oneself in terms of relationships to others

**Transfer of Learning:**
- What doesn't help positive transfer: Rote learning for own sake (NOT connecting with daily life/application/meaningfulness)

---

## STRUCTURAL FORMAT (REET 2026-Inspired - 5 Format Types)

**FORMAT 1: STANDARD 4-OPTION MCQ (20% of questions):**
\`\`\`
प्रश्न का हिंदी पाठ यहां?
(1) पहला विकल्प
(2) दूसरा विकल्प
(3) तीसरा विकल्प
(4) चौठा विकल्प
\`\`\`
Example: Gagne के सीखने की पदानुक्रम में सर्वोच्च चरण कौन सा है? (1) सिद्धांत अधिगम (2) समस्या समाधान अधिगम (3) बहु-भेदभाव (4) उद्दीपन-अनुक्रिया

**FORMAT 2: MULTI-STATEMENT EVALUATION (MSQ) (40% of questions - DOMINANT):**
\`\`\`
Piaget के संज्ञानात्मक विकास सिद्धांत के बारे में निम्नलिखित कथनों पर विचार कीजिए:
(a) समायोजन (Accommodation) में मौजूदा स्कीमा को संशोधित किया जाता है
(b) आत्मसात्करण (Assimilation) में नई जानकारी को मौजूदा स्कीमा में फिट किया जाता है
(c) मूर्त संक्रियात्मक अवस्था (Concrete Operational) 7-11 वर्ष की आयु में होती है
(d) Piaget ने चार विकास अवस्थाएं प्रस्तावित कीं
उपरोक्त में से कौन से कथन सही हैं?
(1) केवल (a) और (b)
(2) केवल (a), (b) और (c)
(3) केवल (b), (c) और (d)
(4) सभी (a), (b), (c) और (d)
\`\`\`
**MSQ GENERATION RULES:**
- Present 4-5 statements (use 5 for hard difficulty)
- Each statement must be independently verifiable theoretical claim
- Options show different combinations of true statements
- ALL options must be grammatically parallel: "केवल (a) और (b)" format
- Ensure only ONE option contains the correct combination

**⚠️ CRITICAL MSQ QUALITY RULE - ZERO TOLERANCE:**
**"ALL CORRECT" ANSWERS BANNED**: NEVER make MSQ questions where all statements are correct
- ❌ ZERO TOLERANCE: Do NOT make even 1 MSQ question with all options (a), (b), (c), (d) correct
- ✅ EVERY MSQ MUST have MIX of true/false statements requiring discrimination
- Create realistic false statements using: common misconceptions, reversed theories, misattributions, incorrect age ranges
- MAKE IT CHALLENGING - test actual psychological knowledge, not just "select all correct" laziness
- Example distribution for 10 MSQ: 3 correct (a,b), 2 correct (a,c), 3 correct (b,d), 2 correct (a,b,c) - ZERO "all correct"
- **FORBIDDEN LAZINESS**: Do NOT make all statements obviously true - this is NOT a quality question

**FORMAT 3: MATCH-THE-FOLLOWING (25% of questions):**
\`\`\`
सूची-I को सूची-II से सुमेलित कीजिए:
सूची-I (मनोवैज्ञानिक)     सूची-II (सिद्धांत/अवधारणा)
A. Piaget                 i. Observational Learning
B. Bandura                ii. Zone of Proximal Development
C. Vygotsky               iii. Cognitive Development
D. Gagne                  iv. Hierarchy of Learning
सही विकल्प चुनिए:
(1) A-i, B-ii, C-iii, D-iv
(2) A-iii, B-i, C-ii, D-iv
(3) A-iv, B-ii, C-iii, D-i
(4) A-iii, B-iv, C-i, D-ii
\`\`\`
**MATCHING GENERATION RULES:**
- Use 4 pairs (occasionally 5 for hard difficulty)
- Types: Theorist-Theory, Stage-Age, Concept-Example, Process-Definition
- Ensure all pairings are factually accurate
- Create plausible distractor options by mixing correct pairings

**⚠️ CRITICAL MATCH QUALITY RULE - RANDOMIZATION ENFORCEMENT:**
**LAZY SEQUENTIAL MATCHING FORBIDDEN**: NEVER make A-i, B-ii, C-iii, D-iv the correct answer
- This is LAZY question making and provides ZERO challenge
- Correct answer MUST have randomized matching (e.g., A-iii, B-i, C-iv, D-ii)
- Minimum 2 items must be "crossed" (not sequential) - prefer 3-4 crossed items
- Examples of ACCEPTABLE patterns: A-ii, B-iv, C-i, D-iii OR A-iii, B-i, C-iv, D-ii
- Example of FORBIDDEN pattern: A-i, B-ii, C-iii, D-iv (this will be REJECTED)
- **QUALITY TEST**: If a student can guess without reading List-II, the question is TOO EASY

**FORMAT 4: ARRANGE-IN-ORDER (10% of questions):**
\`\`\`
Bandura के अवलोकनात्मक अधिगम की प्रक्रियाओं को सही क्रम में व्यवस्थित कीजिए:
A. अवधानात्मक (Attentional)
B. प्रेरणात्मक (Motivational)
C. उत्पादक (Production)
D. अवधारणात्मक (Retentional)
सही क्रम चुनिए:
(1) A-D-C-B
(2) A-B-D-C
(3) D-A-C-B
(4) A-C-D-B
\`\`\`
**ARRANGE GENERATION RULES:**
- Use 4 items (occasionally 5 for hard difficulty)
- Types: Developmental stages (chronological), Learning processes (sequential), Taxonomies (hierarchical)
- Ensure items have clear ordering criteria
- Create distractor sequences with partial correctness

**⚠️ CRITICAL ARRANGE QUALITY RULE - RANDOMIZATION ENFORCEMENT:**
**LAZY SEQUENTIAL ORDERING FORBIDDEN**: NEVER make A-B-C-D the correct answer
- This is LAZY question making - items are already in correct order, providing ZERO challenge
- Correct answer MUST scramble the order (e.g., B-D-A-C, D-A-C-B, C-A-D-B)
- Present items in RANDOM/SHUFFLED order initially, NOT in their natural sequence
- Examples of ACCEPTABLE patterns: B-D-A-C, D-C-B-A, C-A-D-B, B-A-D-C, A-D-C-B
- Example of FORBIDDEN pattern: A-B-C-D (this will be REJECTED)
- **QUALITY TEST**: If the items are already presented in correct chronological/sequential order, you are being LAZY
- Shuffle items deliberately so students must think about the correct sequence

**FORMAT 5: ASSERTION-REASON (5% of questions):**
\`\`\`
निम्नलिखित कथनों पर विचार कीजिए:
अभिकथन (A): बच्चे अवलोकन के माध्यम से सीखते हैं।
कारण (R): Bandura ने अवलोकनात्मक अधिगम सिद्धांत प्रस्तावित किया।
सही विकल्प चुनिए:
(1) (A) और (R) दोनों सही हैं और (R), (A) की सही व्याख्या है
(2) (A) और (R) दोनों सही हैं परंतु (R), (A) की सही व्याख्या नहीं है
(3) (A) सही है परंतु (R) गलत है
(4) (A) गलत है परंतु (R) सही है
\`\`\`
**ASSERTION-REASON GENERATION RULES:**
- Present two statements: Assertion (A) and Reason (R)
- Both must be independently factual claims about psychological theories
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
- Example distribution for 10 A-R: 4 option(1), 3 option(2), 2 option(3), 1 option(4)

---

## FROZEN PROHIBITIONS

### NEVER include in options:
- ❌ "उपरोक्त सभी" (All of the above)
- ❌ "इनमें से कोई नहीं" (None of the above)
- ❌ Duplicate options or synonyms as different options
- ❌ Options where multiple could be theoretically correct

### NEVER use in question stems:
- ❌ Ambiguous scenarios where multiple theories could apply equally
- ❌ Outdated terminology (use current psychological terms)
- ❌ Culturally inappropriate examples (use Indian context)

### FORMAT RULES:
- ✅ MUST use exactly 4 options (1), (2), (3), (4)
- ✅ ALL content in Hindi (but psychologist names can be in English)
- ✅ Must have ONE clearly correct answer

### ❌ ABSOLUTELY FORBIDDEN LAZY PATTERNS (Zero Violations Allowed):

1. **MSQ "All Correct" BANNED**: NEVER EVER make MSQ questions where all statements are correct
   - ❌ FORBIDDEN: Answer where ALL options (a), (b), (c), (d) are correct
   - ❌ ZERO TOLERANCE: Not even 1 question out of 10 can have "all correct" answer
   - ✅ REQUIRED: EVERY MSQ must have mix of true/false statements requiring discrimination
   - ✅ REQUIRED: Create realistic false statements using misattributions, reversed theories, incorrect age ranges

2. **Sequential Matching BANNED**: NEVER EVER make A-i, B-ii, C-iii, D-iv the correct answer
   - ❌ FORBIDDEN: A-i, B-ii, C-iii, D-iv (sequential pattern)
   - ❌ ZERO TOLERANCE: Not even 1 Match question can have sequential pattern
   - ✅ REQUIRED: EVERY Match must have scrambled pattern (e.g., A-iii, B-i, C-iv, D-ii)
   - ✅ REQUIRED: Minimum 2 items crossed, prefer 3-4 crossed items

3. **Sequential Ordering BANNED**: NEVER EVER make A-B-C-D the correct answer
   - ❌ FORBIDDEN: A-B-C-D (items already in correct order)
   - ❌ ZERO TOLERANCE: Not even 1 Arrange question can have A-B-C-D answer
   - ✅ REQUIRED: EVERY Arrange must scramble item order (e.g., B-D-A-C, D-A-C-B, A-D-C-B)
   - ✅ REQUIRED: Present items in random/shuffled order, NOT natural sequence

4. **A-R Option 1 Dominance**: DO NOT make majority of A-R questions have option (1)
   - ❌ FORBIDDEN: Making 60%+ of A-R questions have answer "both true, R explains A"
   - ✅ REQUIRED: Distribute answers across all 4 options (roughly 30% opt1, 30% opt2, 20% opt3, 20% opt4)
   - Create variation: independent truths, false assertions, false reasons, non-causal relationships

5. **Simplistic Psychology BANNED**: NEVER make trivial questions that insult intelligence
   - ❌ FORBIDDEN: Questions any layperson could answer without psychology knowledge
   - ✅ REQUIRED: Professional-grade with specific theorists, stages, ages, processes, nuanced distinctions

**⚠️ CRITICAL: If you violate patterns #1, #2, or #3 even ONCE, the entire question set will be REJECTED**

### EXPLANATION REQUIREMENTS:
- ✅ Explain the theory/concept clearly
- ✅ Explain why correct answer is right
- ✅ Explain why other options are wrong
- ✅ Provide theorist attribution where relevant
- ❌ NO meta-commentary
- ❌ VERBOSE AI THINKING ABSOLUTELY BANNED (ZERO TOLERANCE):
  - NO internal reasoning: "Wait", "BUT wait", "Let me re-check", "I should double check"
  - NO exploratory language: "Let's try", "Let's re-evaluate", "Let's assume"
  - NO trial-and-error or self-correction dialogue in explanations
  - NO uncertainty phrases: "it seems", "appears to be", "might be"
- ✅ Explanations MUST be direct, confident, step-by-step FINAL solutions only
- ✅ Show the correct reasoning path, NOT the thinking process to find it

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
11. ✓ All 4 options are textually DIFFERENT (no duplicates, no synonyms)
12. ✓ No option contains "उपरोक्त सभी" or "All of the above"
13. ✓ No option contains "इनमें से कोई नहीं" or "None of the above"
14. ✓ questionText uses proper Hindi Devanagari script
15. ✓ All options use proper Hindi Devanagari script
16. ✓ Theorist names and theory terms are accurate
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
30. ✓ Scenario questions: Scenario is clear, options address the scenario appropriately
31. ✓ Archetype is ONLY one of the 7 allowed values (multiStatementEvaluation, matchTheFollowing, arrangeInOrder, assertionReason, scenarioApplication, theoryIdentification, definitional)
32. ✓ Archetype is NOT one of forbidden values (singleFactRecall, exceptionNegative, comparative, statementValidation, matching, sequencing)

---

## MAJOR THEORISTS COVERAGE (MUST INCLUDE)

**Essential Coverage:**
- ✓ Piaget: Accommodation, Assimilation, Stages
- ✓ Vygotsky: Sociocultural theory, ZPD
- ✓ Bandura: Observational learning, processes
- ✓ Bruner: Discovery learning
- ✓ Gagne: Hierarchy of learning
- ✓ Erikson: Psychosocial development
- ✓ Kohlberg: Moral development
- ✓ Maslow: Hierarchy of needs
- ✓ Gardner: Multiple intelligences
- ✓ Sternberg: Triarchic theory
- ✓ Bronfenbrenner: Bioecological systems
- ✓ Allport: Trait theory
- ✓ Bloom: Taxonomy (cognitive levels)

---

## VALIDATION CHECKLIST

Before finalizing questions, verify:
✓ **Theory Attribution**: Correct theorist linked to theory
✓ **Technical Terms**: Standard psychological terminology used
✓ **Scenarios**: Only ONE theory clearly applies
✓ **Stages/Hierarchies**: Correct order and names
✓ **Cultural Context**: Examples appropriate for Indian setting

---

## OPTION CONSTRUCTION RULES

- All 4 options must be distinct psychological concepts (not synonyms)
- For theorist questions: Use 4 DIFFERENT theorists
- For technique questions: Use 4 DIFFERENT techniques
- For stage questions: Use actual stages from the theory
- Make distractors plausible but clearly wrong upon verification

---

## ANSWER KEY BALANCE

- Distribute correct answers evenly across (1), (2), (3), (4)
- Avoid streaks of same answer

---

## COGNITIVE LOAD

- **Easy**: Basic definitions, famous theorists, simple concepts
- **Balanced**: Theory application, moderate scenarios, multiple concepts
- **Hard**: Complex scenarios, deep conceptual understanding, hierarchies

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
- theorist: string (optional, can be omitted)

\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "प्रश्न का हिंदी पाठ यहां",
      "questionText_en": "Full question text in English",
      "archetype": "multiStatementEvaluation" | "matchTheFollowing" | "arrangeInOrder" | "assertionReason" | "scenarioApplication" | "theoryIdentification" | "definitional",  // ONLY these 7 values allowed - NO OTHER archetypes
      "structuralForm": "multipleSelectQuestions" | "matchTheFollowing" | "arrangeInOrder" | "assertionReason" | "standard4OptionMCQ",  // ONLY these 5 values allowed
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
      "explanation_en": "Explanation in English - explain theory, cite theorist",
      "difficulty": "easy" | "medium" | "hard",
      "language": "bilingual",
      "contentDomain": "learningTheories" | "development" | "personality" | "intelligence" | "motivation" | "individualDifferences" | "attitude",
      "theorist": "Piaget" | "Vygotsky" | "Bandura" | "Bruner" // Optional: for theory-based questions
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
- theorist: string (optional, can be omitted)

\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "प्रश्न का हिंदी पाठ यहां",
      "archetype": "multiStatementEvaluation" | "matchTheFollowing" | "arrangeInOrder" | "assertionReason" | "scenarioApplication" | "theoryIdentification" | "definitional",  // ONLY these 7 values allowed - NO OTHER archetypes
      "structuralForm": "multipleSelectQuestions" | "matchTheFollowing" | "arrangeInOrder" | "assertionReason" | "standard4OptionMCQ",  // ONLY these 5 values allowed
      "cognitiveLoad": "low" | "medium" | "high",
      "correctAnswer": "1" | "2" | "3" | "4",
      "options": {
        "1": "विकल्प 1",
        "2": "विकल्प 2",
        "3": "विकल्प 3",
        "4": "विकल्प 4"
      },
      "explanation": "व्याख्या - explain theory, cite theorist, explain why others are wrong",
      "difficulty": "easy" | "medium" | "hard",
      "language": "hindi",
      "contentDomain": "learningTheories" | "development" | "personality" | "intelligence" | "motivation" | "individualDifferences" | "attitude",
      "theorist": "Piaget" | "Vygotsky" | "Bandura" | "Bruner" // Optional: for theory-based questions
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
- Allowed: multiStatementEvaluation, matchTheFollowing, arrangeInOrder, assertionReason, scenarioApplication, theoryIdentification, definitional
- FORBIDDEN: singleFactRecall, exceptionNegative, comparative, statementValidation, matching, sequencing
- If ANY question uses forbidden archetype: STOP and FIX before returning
- Check structural form matches archetype correctly: YES/NO: ___

**VALIDATION COMPLETE**: Only proceed to return JSON if ALL checks passed.

---

## FINAL INSTRUCTIONS

Generate ${questionCount} questions now following ALL rules above.

⚠️  **CRITICAL**:
- Use EXACTLY 4 options per question
- Label options as (1), (2), (3), (4)
- Ensure correct theorist-theory attribution
- Use standard psychological terminology
- Scenarios must have ONE clearly correct answer
${hasStudyMaterials ? '- Extract content from study materials but verify facts' : '- Generate authentic RPSC-quality questions from your training knowledge'}
${isBilingual
  ? `- Generate BOTH Hindi and English in SINGLE response
- Include questionText + questionText_en, options + options_en, explanation + explanation_en
- Set "language": "bilingual" in each question
- Psychologist names remain in English in both versions
- Ensure both languages convey identical meaning`
  : `- ALL content in Hindi (psychologist names can be English)
- Set "language": "hindi" in each question`}
- Return ONLY valid JSON

**QUALITY VERIFICATION**:
✓ All 4 options are distinct concepts (not synonyms)
✓ Correct theorist attribution
✓ Technical terms are accurate
✓ Scenarios are unambiguous
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
 * Complete Educational Psychology Protocol
 */
export const rpscSeniorTeacherPaper1EducationalPsychologyProtocol: Protocol = {
  id: 'rpsc-senior-teacher-paper1-educational-psychology',
  name: 'RPSC Senior Teacher Grade II - Paper 1: Educational Psychology',
  streamName: 'RPSC Senior Teacher Grade II',
  subjectName: 'Paper 1 - Educational Psychology',
  difficultyMappings,
  prohibitions,
  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,
    warmupPercentage: 0.10
  },
  buildPrompt: buildEdPsychPrompt,
  validators,
  metadata: {
    description: 'RPSC Senior Teacher Grade II Paper 1: Educational Psychology protocol - REET 2026-inspired with 5 structural formats',
    analysisSource: 'Based on REET 2026 analysis + Enhanced for Grade 2 senior position',
    version: '2.0.0',
    lastUpdated: '2025-01-18',
    examType: 'SELECTION (Merit-based) - Common Paper 1 Section',
    sectionWeightage: '~20 questions out of 100 total in Paper 1',
    note: `REET 2026-INSPIRED PROTOCOL (Grade 2 MORE difficult than REET):

**NEW STRUCTURAL DISTRIBUTION (~20 questions):**
  - Standard MCQ: 20% (4Q) - REDUCED from 100%
  - Multi-Statement Evaluation (MSQ): 40% (8Q) - NEW DOMINANT (4x difficulty)
  - Match-the-Following: 25% (5Q) - NEW (3x difficulty)
  - Arrange-in-Order: 10% (2Q) - NEW (3x difficulty)
  - Assertion-Reason: 5% (1Q) - NEW

**ARCHETYPE TRANSFORMATION (Balanced Difficulty):**
  - Theory Identification: 5% (was 35% - DRASTICALLY REDUCED)
  - Match-the-Following: 25% (NEW - Theorist-Theory matching)
  - Multi-Statement Evaluation: 40% (NEW - DOMINANT)
  - Scenario Application: 15% (was 30%)
  - Definitional: 5% (was 25%)
  - Arrange-in-Order: 10% (NEW - Stages/taxonomies)

**COGNITIVE LOAD TARGET:**
  - Low-Density: 5% (was 30% - REDUCED)
  - Medium-Density: 30% (was 60%)
  - High-Density: 65% (was 10% - HIGHEST in Paper 1)

**DIFFICULTY MULTIPLIER:** 4-6x (higher than REET's 3-5x)

**Content Distribution (Unchanged):**
  - Learning Theories: ~25% (Piaget, Vygotsky, Bandura, Bruner, Gagne)
  - Development: ~20% (Cognitive, emotional, moral, social)
  - Personality & Adjustment: ~15% (Traits, projective, defense mechanisms)
  - Intelligence & Creativity: ~15% (Gardner, Sternberg, Torrance)
  - Motivation: ~10% (Maslow, achievement motivation)
  - Individual Differences: ~10% (Gifted, slow learners, delinquency)
  - Attitude & Self-Concept: ~5%

**Theoretical Framework Coverage:**
  - Piaget: Accommodation/Assimilation, stages
  - Vygotsky: Sociocultural theory, ZPD
  - Bandura: Observational learning (4 processes)
  - Gagne: Hierarchy of learning (highest = problem solving)
  - Bronfenbrenner: Bioecological systems (microsystem)
  - Maslow: Hierarchy (highest = self-actualization)
  - Gardner: Multiple intelligences
  - Sternberg: Triarchic theory

**Quality Characteristics:**
  - Requires deep theoretical knowledge
  - Application-oriented with enhanced complexity
  - Correct theorist attribution is CRITICAL
  - All questions in Hindi (theorist names in English acceptable)
  - Senior position demands highest cognitive load (65%)`
  }
}
