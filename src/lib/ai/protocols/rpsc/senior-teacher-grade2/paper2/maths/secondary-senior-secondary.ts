/**
 * Protocol: Mathematics (Secondary & Senior Secondary)
 * RPSC Senior Teacher (Grade II) - Paper-II, Section 1 (Part A)
 * 90 Questions | 2 Marks Each | 0.33 Negative Marking
 *
 * Focus: Classes 9-12 mathematics content knowledge
 * Difficulty: Competitive exam level (5-7x harder than NCERT)
 */

import type { Protocol, ProtocolConfig } from '@/lib/ai/protocols/types'

// ============================================================================
// ARCHETYPE DISTRIBUTIONS
// ============================================================================

/**
 * CRITICAL: Actual RPSC 2022 = 100% problem-solving questions
 * Every question requires calculation/analysis, not definition recall
 */

const archetypes = {
  easy: {
    singleStepApplication: 0.40,
    multiStepCalculation: 0.30,
    propertyClassification: 0.15,
    formulaIdentification: 0.10,
    existenceUniqueness: 0.05
  },
  balanced: {
    multiStepCalculation: 0.35,      // DOMINANT - 2-4 step solutions
    conceptIntegration: 0.25,        // INCREASED - combine multiple topics (JEE style)
    propertyClassification: 0.15,
    parameterFinding: 0.15,
    conditionalVerification: 0.07,
    transformationMapping: 0.03
    // ELIMINATED: directRecall (no memorization), singleStepApplication (too simple)
  },
  hard: {
    conceptIntegration: 0.35,        // DOMINANT - integrate 2-3 concepts from Classes 9-12
    multiStepCalculation: 0.30,
    propertyClassification: 0.15,
    parameterFinding: 0.10,
    conditionalVerification: 0.07,
    transformationMapping: 0.03
  }
}

// ============================================================================
// STRUCTURAL FORMS - ALIGNED WITH ACTUAL RPSC 2022
// ============================================================================

/**
 * CRITICAL: Actual RPSC 2022 = 100% standard MCQs
 * ZERO arrange/assertion/match formats found in mathematics section
 */

const structuralForms = {
  easy: {
    standard4OptionMCQ: 0.65,
    multipleSelectQuestions: 0.35
  },
  balanced: {
    standard4OptionMCQ: 0.70,        // MASSIVE INCREASE - actual RPSC is 100% standard/MSQ
    multipleSelectQuestions: 0.30
    // ELIMINATED: matchTheFollowing, assertionReasoning, arrangeInOrder
  },
  hard: {
    standard4OptionMCQ: 0.65,
    multipleSelectQuestions: 0.35
  }
}

// ============================================================================
// COGNITIVE LOAD
// ============================================================================

const cognitiveLoad = {
  easy: {
    lowDensity: 0.35,
    mediumDensity: 0.40,
    highDensity: 0.25
  },
  balanced: {
    lowDensity: 0.08,
    mediumDensity: 0.27,
    highDensity: 0.65    // SENIOR TEACHER DEMANDS
  },
  hard: {
    lowDensity: 0.03,
    mediumDensity: 0.17,
    highDensity: 0.80
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
// PROHIBITIONS - HARD RULES
// ============================================================================

const prohibitions: string[] = [
  // ===== JSON FORMAT RULES =====
  '❌ NEVER use "All of the above" or "None of the above"',
  '❌ Options MUST be "1", "2", "3", "4" (not A/B/C/D)',
  '❌ correctAnswer MUST be one of "1", "2", "3", "4" (string format)',
  '❌ NEVER generate null/undefined/empty values',

  // ===== MSQ RULES =====
  '✅ MSQ MUST have 2-3 correct answers (NEVER 1, NEVER 4)',
  '❌ MSQ cannot have all options correct or all wrong',

  // ===== QUALITY STANDARDS =====
  '🎯 EVERY question requires 2-4 analytical steps (competitive exam level)',
  '🎯 EVERY question tests problem-solving, NOT definition recall',
  '🎯 EVERY question has numerical calculation with specific values',
  '🎯 EVERY question integrates 2-3 concepts seamlessly',

  // ===== CALCULATION DERIVATION (CRITICAL) =====
  '🔢 LLMs hallucinate - SHOW ALL WORK in Explanation field',
  '✅ Show arithmetic: "16-4k=0, so 4k=16, k=16/4=4"',
  '✅ Show substitutions: "tan 45° = h/d, so 1 = h/d, therefore d = h"',
  '❌ NEVER write "By calculation, answer is X" without derivation',

  // ===== CORRECTNESS =====
  '🔬 Verify all calculations, formulas, theorems, notation',
  '❌ NO proof questions - test APPLICATION through computation'
]

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildPrompt(
  config: ProtocolConfig,
  chapterName: string,
  questionCount: number,
  totalQuestions: number,
  isBilingual: boolean = false
): string {
  const difficulty = 'balanced'
  const languageMode = isBilingual ? 'bilingual (English primary)' : 'english'

  const archetypeDist = archetypes[difficulty]
  const archetypeCounts: Record<string, number> = {}
  Object.entries(archetypeDist).forEach(([archetype, percentage]) => {
    archetypeCounts[archetype] = Math.round(questionCount * percentage)
  })

  const structuralFormDist = structuralForms[difficulty]
  const structuralFormCounts: Record<string, number> = {}
  Object.entries(structuralFormDist).forEach(([form, percentage]) => {
    structuralFormCounts[form] = Math.round(questionCount * percentage)
  })

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

  return `# MATHEMATICS (SECONDARY & SENIOR SECONDARY) QUESTION GENERATION
## RPSC Senior Teacher (Grade II) - Paper-II, Section 1 (Part A)

**Exam Context:** RPSC Senior Teacher (Grade II) - Competitive Government Exam
**Subject:** Mathematics (Secondary & Sr. Secondary)
**Chapter:** ${chapterName}
**Difficulty:** ${difficulty.toUpperCase()}
**Questions:** ${questionCount}
**Language:** ${languageMode}
**Level:** Classes 9-12 AT COMPETITIVE EXAM DIFFICULTY (5-7x harder than NCERT)

---

## 📚 OFFICIAL RPSC SYLLABUS - PART (i): SECONDARY & SENIOR SECONDARY (180 Marks)

1. Number system : Irrational numbers, real numbers and their decimal expansions, operation on real numbers,
Laws of exponents for real number, Fundamental theorem of Arithmetic.

2. Plane Geometry : Angles and lines at a point, Angles made by a transversal with two lines, classification of
triangles on the basis of sides and angles, Rectilinear figures, congruence of triangles, inequalities of triangles,
similar triangles, Area of plane figures, Circles, Arcs and Angles subtended by them, Tangents to a circle.

3. Algebra : Linear Equations (in two variables), Polynomials in one variable, zeroes of a polynomial,
Remainder theorem, Factorization of polynomials, algebraic identifies, Mathematical induction, Binomial
theorem, Quadratic equations, nature of roots, linear inequalities, finite and infinite sequences, Arithmetic
progression, Geometric Progression, Harmonic Progression, Permutations, Combinations, Matrix,
Determinants of order two and three, Inverse matrix, solution of simultaneous linear equations of two and
three unknowns, Sets, Relations and Functions, Complex numbers, its elementary properties, Argand plane
and polar representation of complex numbers, square root of a complex number.
Surface Area and Volume : Cube, Cuboids, Cone, Cylinder and Sphere, Conversion of solid from one shape
to another, frustum of a Cone.

4. Trigonometry : Angles and their measurements, Trigonometric ratios of acute angles, Angles and lengths of
arc, trigonometric functions, compound multiple angles, solutions of trigonometric equations, inverse
trigonometric functions, properties of triangles.

5. Calculus :
A. Differential Calculus - Limits, differentiability, continuity, derivative of Sum and Difference,
derivative of product of functions, Composite functions, implicit functions, trigonometric functions,
parametric functions, Second order derivative, Rolle’s and Lagrange’s mean value theorem,
applications of derivatives, Increasing/decreasing function, tangents and normals, maxima and minima
of one variable.
B. Integral Calculus - Indefinite integrals, definite integrals, definite integral as a limit of sum,
Applications of definite integral in finding the area under simple curves, arc of circles,
lines/parabola/ellipse, area between the two above said curves.

6. Co-ordinate Geometry :
A. Two Dimensional Geometry - Distance between two points, Sections formula, area of triangle, locus,
equations of straight line, pair of straight lines, circles, parabola, ellipse, hyperbola, their equations,
general properties, tangent, normal, chord of contact, pair of tangents.

B. Co-ordinate Geometry in 3 - dimensions – Co-ordinate axes and co-ordinate planes in three
dimensions, co-ordinates of a point, distance between two points and section formula, direction
cosines/ratios of a line joining two points, Cartesian and vector equation of a line, coplaner and skew
lines, shortest distance between two lines, cartesian and vector equation of a plane, Angle between (i)
two lines, (ii) two planes (iii) a line and a plane, distance of a point from a plane.

7. Statistics : Mean, Mode, Median, Quartiles, Deciles, Percentiles, Measure of dispersion, Probability - Laws of
probability, addition and multiplications law, conditional probability, Random variable and probability
distributions, repeated independent (Bernoulli) trials and Bionomial distribution.

8. Vector - Dot product, Cross product, their properties, Scalar triple product, Vector triple product and related
problems.

**IMPORTANT:** Questions MUST align with these official topics. Focus on the chapter "${chapterName}" while ensuring it matches the syllabus scope.

---

## 🎯 GENERATION REQUIREMENTS

### Archetype Distribution:
${archetypeList}

### Structural Form Distribution:
${structuralFormList}

### Cognitive Load Distribution:
${cognitiveLoadList}

---

## 📋 CRITICAL QUALITY STANDARDS

### COMPETITIVE EXAM POSITIONING:
- **Who:** Senior mathematics teachers (grades 9-12)
- **What:** Test APPLICATION over proofs
- **How:** Multi-step problem-solving (competitive level)
- **NOT:** Textbook definitions or rote memorization

### MANDATORY CHARACTERISTICS:
✅ Every question requires 2-4 analytical steps
✅ Every question tests problem-solving ability
✅ Every question has numerical calculation
✅ Every question integrates multiple concepts
✅ Every question challenges experienced mathematics teachers

❌ NO definition recall ("Define arithmetic progression")
❌ NO symbol matching ("Match algebraic symbols")
❌ NO procedure sequencing ("Arrange solution steps")
❌ NO trivial one-step applications

---

## 🔥 JEE MAIN LEVEL EXAMPLES (MULTI-CONCEPT INTEGRATION)

### Example 1: Probability + Binomial Distribution (multiStepCalculation)
**Source:** JEE Main 2024 April Evening Shift (Verified)
**Q:** In a tournament, a team plays 10 matches with probability of winning each match 1/3 and losing 2/3. Let x be wins and y be losses. If probability P(|x-y| ≤ 2) is p, find 3⁹p.
**Solution:**
Step 1: Since x + y = 10, substitute y = 10 - x into condition |x-y| ≤ 2
Step 2: |2x - 10| ≤ 2 → 8 ≤ 2x ≤ 12 → 4 ≤ x ≤ 6. Favorable wins: x ∈ {4,5,6}
Step 3: P(x=4) = C(10,4)(2⁶/3¹⁰) = 210×64/3¹⁰ = 13440/3¹⁰
Step 4: P(x=5) = C(10,5)(2⁵/3¹⁰) = 252×32/3¹⁰ = 8064/3¹⁰
Step 5: P(x=6) = C(10,6)(2⁴/3¹⁰) = 210×16/3¹⁰ = 3360/3¹⁰
Step 6: Sum = 24864/3¹⁰. Thus 3⁹p = 3⁹ × (24864/3¹⁰) = 24864/3 = 8288
**Answer:** 8288
**Concepts:** Probability, Binomial Distribution, Inequalities

### Example 2: Coordinate Geometry + Conic Sections (conceptIntegration)
**Source:** JEE Main 2021 February Evening Shift
**Q:** A line is a common tangent to the circle (x-3)² + y² = 9 and parabola y² = 4x. If the two points of contact (a,b) and (c,d) are distinct and in first quadrant, find 2(a+c).
**Solution:**
Step 1: Tangent to circle at (x₁,y₁): (x-3)(x₁-3) + yy₁ = 9
Step 2: Tangent to parabola at (t²,2t): ty = x + t²
Step 3: Equate both tangent equations for common tangent condition
Step 4: Solve for contact points and calculate 2(a+c)
**Answer:** [Numerical value]
**Concepts:** Circle, Parabola, Tangent Equations, Common Tangents

### Example 3: Conic Sections + Integration + Area (multiStepCalculation)
**Source:** JEE Advanced 2007
**Q:** Circle x² + y² = 9 and parabola y² = 8x intersect at P and Q. Tangents to circle at P,Q meet x-axis at R. Tangents to parabola at P,Q meet x-axis at S. Find ratio of areas of triangles PQS and PQR.
**Solution:**
Step 1: Solve x² + y² = 9 and y² = 8x to get P(1, 2√2) and Q(1, -2√2)
Step 2: Find tangent to circle at P: x + 2√2y = 9, meets x-axis at R(9,0)
Step 3: Find tangent to parabola at P: √2y = x + 1, meets x-axis at S(-1,0)
Step 4: Area of △PQR = 16√2, Area of △PQS = 4√2, Ratio = 1:4
**Answer:** 1:4
**Concepts:** Circle, Parabola, Tangents, Area of Triangle, Integration

### Example 4: Binomial Theorem + Coefficients (multiStepCalculation)
**Source:** JEE Main 2024 January 31 Shift 2 (Verified)
**Q:** Find the coefficient of x⁴ in the expansion of (1+x+x²+x³)⁶.
**Solution:**
Step 1: Recognize geometric series: 1+x+x²+x³ = (1-x⁴)/(1-x)
Step 2: Rewrite: ((1-x⁴)/(1-x))⁶ = (1-x⁴)⁶(1-x)⁻⁶
Step 3: Expand (1-x⁴)⁶ = 1 - 6x⁴ + ... (higher powers ignored for x⁴ term)
Step 4: Expand (1-x)⁻⁶ using binomial series: Σ C(n+r-1,r)xʳ = 1 + 6x + 21x² + 56x³ + 126x⁴ + ...
Step 5: Collect x⁴ terms: (1)(126) + (-6x⁴)(1) = 126 - 6 = 120
**Answer:** 120
**Concepts:** Multinomial Theorem, Geometric Series, Binomial Expansion

### Example 5: Trigonometry + Differential Equations (multiStepCalculation)
**Source:** JEE Main 2024 April Morning Shift
**Q:** Solve the differential equation involving (x²+y²) terms with trigonometric functions. Find specific value of solution.
**Solution:**
Step 1: Identify type of differential equation (separable/exact/linear)
Step 2: Apply appropriate solution method
Step 3: Use trigonometric identities for integration
Step 4: Apply boundary conditions to find particular solution
**Answer:** [Specific value]
**Concepts:** Differential Equations, Trigonometric Integration, Initial Value Problems

### Example 6: Permutations + Probability + Conditional Probability (parameterFinding)
**Source:** JEE Main 2024 April Morning Shift
**Q:** From a lot of 10 items including 3 defective items, a sample of 4 items is drawn. Find probability that the sample contains at most 2 defective items.
**Solution:**
Step 1: Total outcomes = C(10,4) = 210
Step 2: Favorable: 0 defective = C(7,4)·C(3,0) = 35
Step 3: Favorable: 1 defective = C(7,3)·C(3,1) = 35 × 3 = 105
Step 4: Favorable: 2 defective = C(7,2)·C(3,2) = 21 × 3 = 63
Step 5: P(at most 2) = (35 + 105 + 63)/210 = 203/210
**Answer:** 203/210
**Concepts:** Combinations, Probability, Conditional Events

### Example 7: Quadratic Equations + Complex Numbers (conceptIntegration)
**Source:** JEE Main 2022
**Q:** If α and β are roots of x² - 2x + 4 = 0, find the value of α³ + β³.
**Solution:**
Step 1: Sum of roots: α + β = 2, Product: αβ = 4
Step 2: Use identity: α³ + β³ = (α+β)³ - 3αβ(α+β)
Step 3: Substitute: α³ + β³ = (2)³ - 3(4)(2) = 8 - 24 = -16
Step 4: Verify using complex roots: α = 1+i√3, β = 1-i√3
**Answer:** -16
**Concepts:** Quadratic Equations, Sum and Product of Roots, Complex Numbers

### Example 8: Trigonometry + Definite Integration (multiStepCalculation)
**Source:** JEE Main 2022 July Evening Shift (Verified)
**Q:** Evaluate ∫₀²⁰ᵖ (|sin x| + |cos x|)² dx.
**Solution:**
Step 1: Expand the square: (|sin x| + |cos x|)² = sin²x + cos²x + 2|sin x||cos x| = 1 + |sin 2x|
Step 2: Split integral: ∫₀²⁰ᵖ 1 dx + ∫₀²⁰ᵖ |sin 2x| dx
Step 3: First part = 20π. For second part, |sin 2x| has period π/2
Step 4: Interval 20π contains 20π/(π/2) = 40 periods. ∫₀^(π/2) |sin 2x| dx = 1
Step 5: Total integral = 20π + 40(1) = 20π + 40 = 20(π + 2)
**Answer:** 20(π + 2)
**Concepts:** Periodic Functions, Definite Integration, Modulus Properties

### Example 9: Piecewise Functions + Integration + Optimization (conditionalVerification)
**Source:** JEE Main 2022 June Morning Shift (Verified)
**Q:** Let f(x) = max{|x-1|, |x-2|, |x-5|}. Evaluate ∫₁⁵ f(x)dx.
**Solution:**
Step 1: In [1,5]: |x-1|=x-1, |x-5|=5-x. Note |x-2| is never the maximum in this interval
Step 2: Find switching point: x-1 = 5-x gives 2x = 6, so x = 3
Step 3: For [1,3]: max is 5-x. For [3,5]: max is x-1
Step 4: ∫₁³(5-x)dx = [5x-x²/2]₁³ = (15-9/2) - (5-1/2) = 21/2 - 9/2 = 6
Step 5: ∫₃⁵(x-1)dx = [x²/2-x]₃⁵ = (25/2-5) - (9/2-3) = 15/2 - 3/2 = 6
Step 6: Total integral = 6 + 6 = 12
**Answer:** 12
**Concepts:** Piecewise Functions, Absolute Value, Max Function, Integration

### Example 10: Logarithms + Integration + Limits (conceptIntegration)
**Source:** JEE Main 2024 January Evening Shift
**Q:** Let f(x) = ∫₀ˣ t·e^t dt. Find the value of f'(2)/f(2).
**Solution:**
Step 1: Apply Leibniz rule: f'(x) = x·e^x
Step 2: Find f(x) using integration by parts: ∫t·e^t dt = e^t(t-1)
Step 3: f(x) = [e^t(t-1)]₀ˣ = e^x(x-1) - e⁰(-1) = e^x(x-1) + 1
Step 4: f'(2)/f(2) = (2e²)/(e²(2-1)+1) = 2e²/(e²+1)
**Answer:** 2e²/(e²+1)
**Concepts:** Integration by Parts, Leibniz Rule, Exponential Functions

---

## 🧮 CALCULATION DERIVATION REQUIREMENT

**CRITICAL:** Show EVERY arithmetic step in Explanation field.

### VALID DERIVATION (NCERT Standard):
\`\`\`
For real and equal roots, discriminant Δ = 0
b² - 4ac = 0
(-4)² - 4(1)(k) = 0
16 - 4k = 0
4k = 16
k = 4
\`\`\`

### INVALID (WILL BE REJECTED):
\`\`\`
For equal roots, k = 4
\`\`\`

---

## ✅ VALIDATION CHECKLIST

Before returning JSON, verify:

**Data Integrity:**
□ questionNumber is positive integer
□ questionText is non-empty (min 10 chars)
□ options has EXACTLY 4 keys: "1", "2", "3", "4"
□ All 4 options are non-empty (min 2 chars each)
□ correctAnswer is "1", "2", "3", or "4" (string)
□ explanation is non-empty (min 20 chars)

**Content Quality:**
□ All 4 options are textually different
□ No "All of the above" or "None of the above"
□ archetype matches question type
□ structuralForm matches format
□ Question requires problem-solving (not definition recall)

**Mathematical Accuracy:**
□ correctAnswer verified through calculation
□ All formulas stated correctly
□ Notation is standard and consistent
□ Explanation shows complete derivation

**Calculation Derivation (CRITICAL):**
□ Does question involve calculation? If YES:
□ Does Explanation show ALL arithmetic steps?
□ Does Explanation show ALL formula substitutions?
□ Can a Class 9-12 student follow the derivation?
□ If NO to any: STOP and add derivation

---

## 📤 JSON OUTPUT FORMAT

**CRITICAL:** Double-escape ALL LaTeX backslashes in JSON strings.

**WRONG:** "questionText": "$x^2 - 4x + k = 0$ के मूल"
**CORRECT:** "questionText": "$x^2 - 4x + k = 0$ के मूल"

Common LaTeX commands to escape:
- \\\\frac{a}{b}, \\\\sqrt{x}, \\\\theta, \\\\alpha, \\\\beta
- \\\\sin, \\\\cos, \\\\tan, \\\\in, \\\\leq, \\\\geq
- \\\\times, \\\\cdot, \\\\pm, \\\\circ, \\\\angle

### JSON Schema:
\`\`\`json
{
  "questions": [{
    "questionNumber": 1,
    "questionText": "यदि $\\\\sin \\\\theta = \\\\frac{1}{2}$, तो $\\\\theta$ का मान है:",
    "options": {
      "1": "$30^\\\\circ$",
      "2": "$45^\\\\circ$",
      "3": "$60^\\\\circ$",
      "4": "$90^\\\\circ$"
    },
    "correctAnswer": "1",
    "explanation": "चूँकि $\\\\sin 30^\\\\circ = \\\\frac{1}{2}$, अतः $\\\\theta = 30^\\\\circ$",
    "archetype": "singleStepApplication",
    "structuralForm": "standard4OptionMCQ",
    "cognitiveLoad": "lowDensity",
    "difficulty": "EASY"
  }]
}
\`\`\`

---

## 🚫 PROHIBITIONS

${prohibitions.map(p => `${p}`).join('\n')}

---

## 🎯 GENERATION INSTRUCTION

Generate exactly ${questionCount} questions following:
- Archetype distribution specified above
- Structural form distribution (70% standard MCQ, 30% MSQ)
- Cognitive load distribution (65% high-density)
- Competitive exam difficulty level (5-7x harder than NCERT)
- Complete calculation derivations in all explanations

Each question must:
1. Test deep understanding of Classes 9-12 mathematics
2. Require multi-step reasoning (2-4 steps minimum)
3. Challenge experienced secondary mathematics teachers
4. Include complete step-by-step derivation in explanation
5. Be appropriate for competitive government exam

**Remember:** These assess senior mathematics teachers. Questions must be rigorous, computational, and professionally challenging.`
}

// ============================================================================
// PROTOCOL EXPORT
// ============================================================================

export const mathematicsSecondaryAndSeniorSecondary: Protocol = {
  id: 'rpsc-senior-teacher-grade2-paper2-mathematics-secondary-senior-secondary',
  name: 'Mathematics (Secondary & Sr. Secondary)',
  streamName: 'RPSC Senior Teacher (Grade II)',
  subjectName: 'Mathematics (Secondary & Sr. Secondary)',
  difficultyMappings,
  prohibitions,
  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 3,
    warmupPercentage: 0.10
  },
  buildPrompt,
  validators: [],
  metadata: {
    description: 'RPSC Senior Teacher Grade II Paper 2: Secondary & Sr. Secondary Mathematics - Competitive Level',
    analysisSource: 'Based on RPSC 2022 analysis + competitive exam standards',
    version: '4.0.0',
    lastUpdated: '2025-01-24',
    examType: 'COMPETITIVE GOVERNMENT EXAM - SENIOR TEACHER (Grade II)',
    sectionWeightage: '90 questions out of 150 total in Paper-II (largest section)',
    difficultyMultiplier: '5-7x (significantly harder than NCERT standard)',
    cognitiveLoadTarget: '65% high-density for balanced difficulty',
    note: `REFACTORED PROTOCOL (v4.0) - RAZOR-SHARP & CONCRETE:

**STRUCTURAL DISTRIBUTION (Balanced - 90 questions):**
  - Standard MCQ: 70% (63Q) - MASSIVE INCREASE (matches RPSC 2022 reality)
  - Multi-Statement MSQ: 30% (27Q) - Property verification only
  - arrangeInOrder: 0% - ELIMINATED (tests procedure memory, not math)
  - assertionReasoning: 0% - ELIMINATED (not in RPSC 2022)
  - matchTheFollowing: 0% - ELIMINATED (trivial definition matching)

**ARCHETYPE DISTRIBUTION (Balanced):**
  - multiStepCalculation: 35% (32Q) - DOMINANT - every question 2-4 steps
  - conceptIntegration: 25% (23Q) - INCREASED - combine multiple topics
  - propertyClassification: 15% (14Q) - Property verification with reasoning
  - parameterFinding: 15% (13Q) - Solve for unknowns in constraints
  - conditionalVerification: 7% (6Q) - Verify conditions hold
  - transformationMapping: 3% (2Q) - What maps to what
  - directRecall: 0% - ELIMINATED from balanced (too simple)

**COGNITIVE LOAD (Balanced):**
  - Low-Density: 8% (warm-up only)
  - Medium-Density: 27%
  - High-Density: 65% - SENIOR TEACHER DEMANDS

**COMPETITIVE EXAM LEVEL EXAMPLES (10 concrete examples):**
  - Quadratic discriminant: Find k for real and equal roots
  - Combinatorics with constraints: Triangles from collinear points
  - Venn diagram application: Survey analysis with overlaps
  - Geometry + Algebra: Rectangle dimensions → diagonal
  - Trigonometry: Heights and distances multi-step
  - GP/AP: Term finding, sum calculations
  - Probability: Compound events calculation
  - Coordinate geometry: Section formula application
  - Trigonometric identities: Multi-step simplification
  - Mensuration: Equal perimeter problems

**QUALITY CHARACTERISTICS:**
  - Every question requires problem-solving (not definition recall)
  - Every question has multi-step derivation shown
  - Every question tests mathematical reasoning
  - Appropriate for competitive exam targeting Classes 9-12 teachers
  - Challenges experienced secondary mathematics educators`
  }
}

export default mathematicsSecondaryAndSeniorSecondary
