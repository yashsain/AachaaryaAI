/**
 * Protocol: Mathematics (Graduation Level)
 * RPSC Senior Teacher (Grade II) - Paper-II, Section 1 (Part B)
 * 40 Questions | 2 Marks Each | 0.33 Negative Marking
 *
 * Focus: Undergraduate mathematics (B.A./B.Sc. level)
 * Difficulty: JEE Mains level - multi-step computational problems
 */

import type { Protocol, ProtocolConfig } from '@/lib/ai/protocols/types'
import type { ChapterKnowledge } from '@/lib/ai/types/chapterKnowledge'

// ============================================================================
// ARCHETYPE DISTRIBUTIONS
// ============================================================================

/**
 * CRITICAL: RPSC 2022 had 0% proof questions - this is COMPETITIVE EXAM
 * Every question requires problem-solving, not definition recall
 */

const archetypes = {
  easy: {
    singleStepApplication: 0.35,
    multiStepCalculation: 0.25,
    formulaIdentification: 0.15,
    propertyClassification: 0.15,
    conditionalVerification: 0.10
  },
  balanced: {
    multiStepCalculation: 0.35,      // DOMINANT - 2-4 step solutions
    conceptIntegration: 0.25,        // INCREASED - synthesize multiple concepts
    propertyClassification: 0.15,
    parameterFinding: 0.12,
    conditionalVerification: 0.08,
    transformationMapping: 0.05
    // ELIMINATED: directRecall, singleStepApplication (too simple for balanced)
  },
  hard: {
    conceptIntegration: 0.35,        // DOMINANT - integrate 3+ concepts
    multiStepCalculation: 0.25,
    propertyClassification: 0.15,
    conditionalVerification: 0.10,
    transformationMapping: 0.08,
    parameterFinding: 0.04,
    mechanicsApplication: 0.02,
    algorithmicApplication: 0.01
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
    standard4OptionMCQ: 0.70,        // MASSIVE INCREASE - matches RPSC reality
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
    lowDensity: 0.15,
    mediumDensity: 0.50,
    highDensity: 0.35
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

  // ===== MSQ FORMAT RULES (RPSC COMBINATION FORMAT) =====
  '✅ MSQ uses RPSC COMBINATION format - NOT checkbox selection',
  '✅ MSQ presents 4 statements (a), (b), (c), (d) - student picks which COMBINATION is correct',
  '✅ MSQ options show combinations: "(1) केवल (a) और (b)", "(2) केवल (a), (b) और (c)"',
  '✅ correctAnswer MUST be single value "1", "2", "3", or "4" - NOT "1, 3, 4"',
  '❌ MSQ "ALL CORRECT" BANNED - NEVER make all statements (a,b,c,d) true',
  '❌ MSQ CHECKBOX FORMAT BANNED - NOT "select all that apply", use COMBINATION options',
  '✅ Mix true/false statements requiring discrimination',

  // ===== QUALITY STANDARDS =====
  '🎯 EVERY question requires 2-4 analytical steps (JEE Mains level)',
  '🎯 EVERY question tests problem-solving, NOT definition recall',
  '🎯 EVERY question has numerical calculation with specific values',
  '🎯 EVERY question integrates 2-3 concepts seamlessly',

  // ===== CALCULATION DERIVATION (CRITICAL) =====
  '🔢 LLMs hallucinate - SHOW ALL WORK in Explanation field',
  '✅ Show arithmetic: "8×7×6 = 56×6 = 336, then 336/6 = 56"',
  '✅ Show substitutions: "C(8,3) = 8!/(3!×5!) = (8×7×6)/(3×2×1)"',
  '❌ NEVER write "By calculation, answer is X" without derivation',

  // ===== VERBOSE AI THINKING PROHIBITION (CRITICAL - Zero Tolerance) =====
  '❌ VERBOSE AI THINKING ABSOLUTELY BANNED (ZERO TOLERANCE):',
  '  - NO internal reasoning: "Wait", "BUT wait", "Let me re-check", "I should double check"',
  '  - NO exploratory language: "Let\'s try", "Let\'s re-evaluate", "Let\'s assume"',
  '  - NO trial-and-error or self-correction dialogue in explanations',
  '  - NO uncertainty phrases: "it seems", "appears to be", "might be"',
  '✅ Explanations MUST be direct, confident, step-by-step FINAL solutions only',
  '✅ Show the correct reasoning path, NOT the thinking process to find it',

  // ===== CORRECTNESS =====
  '🔬 Verify all calculations, formulas, theorems, notation',
  '❌ NO theoremProof questions - test APPLICATION not proof-writing'
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
  const languageMode = isBilingual ? 'bilingual (English primary)' : 'english'

  // Use config values directly (passed from difficultyMapper based on paper difficulty)
  const archetypeCounts: Record<string, number> = {}
  Object.entries(config.archetypeDistribution).forEach(([archetype, percentage]) => {
    archetypeCounts[archetype] = Math.round(questionCount * percentage)
  })

  const structuralFormCounts: Record<string, number> = {}
  Object.entries(config.structuralForms).forEach(([form, percentage]) => {
    structuralFormCounts[form] = Math.round(questionCount * percentage)
  })

  const cognitiveLoadCounts: Record<string, number> = {}
  Object.entries(config.cognitiveLoad).forEach(([load, percentage]) => {
    // Skip metadata fields (not percentages)
    if (load !== 'maxConsecutiveHigh' && load !== 'warmupCount') {
      cognitiveLoadCounts[load] = Math.round(questionCount * percentage)
    }
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

  return `# MATHEMATICS (GRADUATION LEVEL) QUESTION GENERATION
## RPSC Senior Teacher (Grade II) - Paper-II, Section 1 (Part B)

**Exam Context:** RPSC Senior Teacher (Grade II) - Competitive Government Exam
**Subject:** Mathematics (Graduation)
**Chapter:** ${chapterName}
**Difficulty:** ${config.cognitiveLoad.highDensity > 0.70 ? 'HARD' : config.cognitiveLoad.highDensity < 0.40 ? 'EASY' : 'BALANCED'}
**Questions:** ${questionCount}
**Language:** ${languageMode}
**Level:** JEE Mains difficulty (6-8x harder than standard B.Sc.)

---

## 📚 OFFICIAL RPSC SYLLABUS - PART (ii): GRADUATION STANDARD (80 Marks)

1. Abstract Algebra - Group, Normal subgroup, permutation group, Quotient group, Homomorphism &
groups, Isomorphism theorems, Calay and Lagrange's theorems, Automorphism.

2. Calculus - Partial derivatives, Maxima and Minima of functions of two variables, Asymptotes, double
and triple integrals, Beta and Gamma functions. Mean Value Theorems.

3.  Real Analysis - Real numbers as a complete ordered field, linear sets, lower and upper bounds, limit
points, closed and open sets, Real sequence, limit and convergence of a sequence, Riemann
integration, convergence of series, absolute convergence, uniform convergence of sequence and series
of functions.

4. Vector Analysis - Differentiation of a vector functions of scalar variable, Gradient, divergence and
curl (rectangular co-ordinates), vector identities, Gauss's Stoke's and Green's theorems.

5. Differential Equations - Ordinary differential equations of first order and first degree, differential
equations of first order but not of first degree, Clairaut's equations, general and singular solutions,
linear differential equations with constant coefficients, homogeneous differential equation, second
order linear differential equations, simultaneous linear differential equations of first order.

6. Statics and Dynamics : Composition and resolution of co-planer forces, component of a force in two
given directions, equilibrium of concurrent forces, parallel forces and moment, velocity and
acceleration, simple linear motion under constant acceleration, Laws of motion, projectile.

7. Linear Programming - Graphical method of solution of linear programming in two variables, convex
sets and their properties, simplex method, Assignment problems, Transportation problems.

8. Numerical Analysis and Difference Equation - Polynomial interpolation with equal or unequal
stepsize, Lagrange's interpolation formula, Truncation error, Numerical differentiation, Numerical
integration, Newton-Cotes quadrature formula, Gauss's quadrature formulae, convergence, Estimation
of errors, Transcendental and polynomical equations, bisection method, Regula-falsi method, method
of interation, Newton - Raphson method, Convergence, First and higher order homogeneous linear
difference equations, non homogenous linear difference equations, Complementary functions,
Particular integral.


**IMPORTANT:** Questions MUST align with these official topics. Focus on the chapter "${chapterName}" while ensuring it matches the syllabus scope.

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
- **Who:** Senior mathematics teachers (B.A./B.Sc. graduates)
- **What:** Test APPLICATION not theory
- **How:** Multi-step problem-solving (JEE Mains level)
- **NOT:** Textbook definitions or rote memorization

### MANDATORY CHARACTERISTICS:
✅ Every question requires 2-4 analytical steps
✅ Every question tests problem-solving ability
✅ Every question has numerical calculation
✅ Every question integrates multiple concepts
✅ Every question challenges experienced mathematics teachers

❌ NO definition recall ("Define reflexive relation")
❌ NO symbol matching ("Match ∪, ∩, φ with meanings")
❌ NO procedure sequencing ("Arrange steps of proof")
❌ NO trivial one-step applications

---

## JEE ADVANCED LEVEL EXAMPLES (MULTI-CONCEPT INTEGRATION)

### Example 1: Complex Numbers + Algebra (multiStepCalculation)
**Source:** JEE Advanced 2022 Paper 1
**Q:** Let z be a complex number with non-zero imaginary part. If (2+3z+4z²)/(2-3z+4z²) is a real number, then find the value of |z|².
**Solution:**
Step 1: For fraction to be real, it must equal its conjugate
Step 2: (2+3z+4z²)/(2-3z+4z²) = (2+3z̄+4z̄²)/(2-3z̄+4z̄²)
Step 3: Cross-multiply: (2+3z+4z²)(2-3z̄+4z̄²) = (2-3z+4z²)(2+3z̄+4z̄²)
Step 4: Expand and use z·z̄ = |z|², simplify to get |z|² = 1/2
**Answer:** 0.5
**Concepts:** Complex Numbers, Conjugates, Algebraic Manipulation

### Example 2: Linear Algebra + Real Analysis (parameterFinding)
**Source:** JEE Advanced 2020 Paper 2
**Q:** The trace of a square matrix is defined as the sum of its diagonal entries. If A is a 2×2 matrix such that trace of A is 3 and trace of A³ is -18, find the determinant of A.
**Solution:**
Step 1: Let eigenvalues be λ₁, λ₂. Then tr(A) = λ₁ + λ₂ = 3
Step 2: tr(A³) = λ₁³ + λ₂³ = -18
Step 3: Use identity: λ₁³ + λ₂³ = (λ₁+λ₂)³ - 3λ₁λ₂(λ₁+λ₂)
Step 4: Substitute: -18 = 27 - 3λ₁λ₂(3) → -18 = 27 - 9λ₁λ₂ → λ₁λ₂ = 5
**Answer:** det(A) = 5
**Concepts:** Eigenvalues, Trace, Determinant, Polynomial Identities

### Example 3: Vector Calculus + 3D Geometry + Algebra (conceptIntegration)
**Source:** JEE Advanced 2023 Paper 1
**Q:** Let P be the plane √3x + 2y + 3z = 16. Let S = {αî + βĵ + γk̂: α²+β²+γ²=1 and distance from (α,β,γ) to plane P is 7/2}. If u,v,w are three distinct vectors in S forming equilateral triangle, find volume V of parallelepiped. Then find (80/√3)V.
**Solution:**
Step 1: Distance from origin to plane P is p = 16/√(3+4+9) = 4. Points in S are at distance 7/2 from P
Step 2: Plane containing circle is at height h = 4 - 3.5 = 0.5 from origin
Step 3: Radius of circle: r = √(1² - 0.5²) = √0.75 = √3/2
Step 4: Area of equilateral triangle = (3√3/4)r² = (3√3/4)(3/4) = 9√3/16
Step 5: Volume V = 2 × Area × h = 2 × (9√3/16) × (1/2) = 9√3/16
Step 6: (80/√3)V = (80/√3) × (9√3/16) = 45
**Answer:** 45
**Concepts:** Vector Algebra, 3D Geometry, Circle on Sphere, Volume Calculation

### Example 4: Calculus + Analysis + Extrema (multiStepCalculation)
**Source:** JEE Advanced 2022 Paper 2
**Q:** Consider f₁(x) = ∫₀ˣ ∏ⱼ₌₁²¹(t-j)ʲ dt and f₂(x) = 98(x-1)⁵⁰ - 600(x-1)⁴⁹ + 2450. Let m₁ = number of local minima of f₁, n₁ = number of local maxima of f₁. Find 2m₁ + 3n₁ + m₁n₁.
**Solution:**
Step 1: Find f₁'(x) = ∏ⱼ₌₁²¹(x-j)ʲ, critical points at x = 1,2,3,...,21
Step 2: Sign changes only at odd powers: 1,3,5,7,9,11,13,15,17,19,21
Step 3: For x > 21, f' > 0. At x=21 sign flips → Maxima. Pattern alternates down to x=1
Step 4: Maxima (n₁): {21,17,13,9,5,1} = 6. Minima (m₁): {19,15,11,7,3} = 5
Step 5: Calculate: 2(5) + 3(6) + (5)(6) = 10 + 18 + 30 = 58
**Answer:** 58
**Concepts:** Definite Integration, Differentiation, Critical Points, Sign Analysis

### Example 5: Differential Equations + Trigonometry (conceptIntegration)
**Source:** JEE Main 2024 April Morning Shift
**Q:** Solve the differential equation sec²x dx + (e²ʸtan²x + tanx)dy = 0 with initial condition y(π/4) = 0.
**Solution:**
Step 1: Let u = tan x, so du = sec²x dx. Equation becomes: du + (e²ʸu² + u)dy = 0
Step 2: Rearrange: du/dy + u = -e²ʸu². This is a Bernoulli equation
Step 3: Divide by u²: u⁻²(du/dy) + u⁻¹ = -e²ʸ. Let v = u⁻¹ = cot x, then dv/dy = -u⁻²(du/dy)
Step 4: Equation becomes: dv/dy - v = e²ʸ. Integrating factor e⁻ʸ: v·e⁻ʸ = ∫eʸ dy = eʸ + C
Step 5: cot x = e²ʸ + C·eʸ. At y(π/4)=0: cot(π/4)=1, so 1=1+C → C=0
**Answer:** cot x = e²ʸ or y = (1/2)ln(cot x)
**Concepts:** Bernoulli Differential Equation, Substitution, Integrating Factor

### Example 6: Complex Analysis + Geometry (transformationMapping)
**Source:** JEE Advanced 2022
**Q:** In the complex plane, find the number of distinct roots of the equation z̄² + z² + 2|z|² = 0 where z̄ is the complex conjugate of z.
**Solution:**
Step 1: Let z = x + iy, then z̄ = x - iy, |z|² = x² + y²
Step 2: z̄² = (x-iy)² = x² - y² - 2ixy, z² = x² - y² + 2ixy
Step 3: Substitute: (x² - y² - 2ixy) + (x² - y² + 2ixy) + 2(x² + y²) = 0
Step 4: Simplify: 2x² - 2y² + 2x² + 2y² = 0 → 4x² = 0 → x = 0
Step 5: The y² terms cancel. Thus x = 0, but y is unconstrained (can be any real number)
**Answer:** Infinite roots (entire imaginary axis: z = iy for all y ∈ ℝ)
**Concepts:** Complex Conjugates, Complex Equations, Solution Sets

### Example 7: Calculus + Coordinate Geometry (multiStepCalculation)
**Source:** JEE Advanced 2022 Paper 2
**Q:** Given f(x) = x² + 5/12 and g(x) = 2(1 - 4|x|/3) for |x| ≤ 3/4, g(x) = 0 for |x| > 3/4. Find area α where |x| ≤ 3/4 and 0 ≤ y ≤ min{f(x), g(x)}. Then find 9α.
**Solution:**
Step 1: Intersection at x = ±1/2 (verified by solving x² + 5/12 = 2 - 8x/3)
Step 2: Area α = 2[∫₀^(1/2) (x² + 5/12)dx + ∫_(1/2)^(3/4) 2(1 - 4x/3)dx]
Step 3: First integral: [x³/3 + 5x/12]₀^(1/2) = 1/24 + 5/24 = 6/24 = 1/4
Step 4: Second integral (triangle): base = 1/4, height = 2/3, area = (1/2)(1/4)(2/3) = 1/12
Step 5: Total: α = 2(1/4 + 1/12) = 2(3/12 + 1/12) = 2(4/12) = 2/3
**Answer:** 9α = 9(2/3) = 6
**Concepts:** Piecewise Functions, Definite Integration, Area Calculation, Min Function

### Example 8: Conic Sections + Calculus (propertyClassification)
**Source:** JEE Advanced 2009
**Q:** An ellipse intersects the hyperbola 2x² - 2y² = 1 orthogonally. The eccentricity of the ellipse is reciprocal of the hyperbola's eccentricity. If the ellipse axes are along coordinate axes, verify the orthogonality.
**Solution:**
Step 1: Hyperbola: x² - y² = 1/2 → e_h = √(1 + b²/a²) = √2, foci at (±1, 0)
Step 2: Ellipse: e_e = 1/√2. For ellipse x²/a² + y²/b² = 1, we have b² = a²(1 - e²) = a²/2
Step 3: Thus a² = 2b², giving ellipse: x² + 2y² = 2b². Foci: (±ae, 0) where ae = a(1/√2)
Step 4: For ellipse to have foci at (±1, 0): a/√2 = 1 → a = √2, b = 1
Step 5: Confocal conics (sharing foci) automatically intersect orthogonally
**Answer:** Ellipse x² + 2y² = 2 and hyperbola are confocal, therefore orthogonal
**Concepts:** Conic Sections, Eccentricity, Confocal Conics, Orthogonality

### Example 9: Probability + Discrete Mathematics (parameterFinding)
**Source:** JEE Main 2023 February Morning Shift
**Q:** In a binomial distribution B(n,p), the sum of the mean and variance is 5, and their product is 6. Find the value of 6(n+p-q) where q = 1-p.
**Solution:**
Step 1: Mean = np, Variance = npq where q = 1-p
Step 2: Given: np + npq = 5 → np(1+q) = 5
Step 3: Given: np·npq = 6 → n²p²q = 6
Step 4: From eq 1: npq = 5 - np. Substitute in eq 2: np(5-np) = 6 → 5np - n²p² = 6
Step 5: Solving the system: p = 1/3, q = 2/3, n = 9
Step 6: Calculate: 6(n+p-q) = 6(9 + 1/3 - 2/3) = 6(9 - 1/3) = 6(26/3) = 52
**Answer:** 52
**Concepts:** Binomial Distribution, Mean, Variance, System of Equations

---

## 📐 STRUCTURAL FORMAT EXAMPLES

### FORMAT 1: STANDARD 4-OPTION MCQ (70% of questions):

**REAL RPSC EXAMPLE:**
\`\`\`
Question: If A = {x ∈ ℝ : x² - 5x + 6 = 0} and B = {x ∈ ℝ : x² - 7x + 12 = 0}, find the symmetric difference A∆B.
(1) {2, 3, 4}
(2) {3}
(3) {2, 4}
(4) {2, 3}

Correct Answer: (3) {2, 4}

Explanation:
Step 1: Solve for A.
x² - 5x + 6 = 0 ⟹ (x - 2)(x - 3) = 0 ⟹ A = {2, 3}.
Step 2: Solve for B.
x² - 7x + 12 = 0 ⟹ (x - 3)(x - 4) = 0 ⟹ B = {3, 4}.
Step 3: Calculate Symmetric Difference A∆B = (A - B) ∪ (B - A).
A - B = {2} (remove elements of B from A).
B - A = {4} (remove elements of A from B).
A∆B = {2} ∪ {4} = {2, 4}.
\`\`\`
- One question, 4 options, one correct answer
- Standard mathematics MCQ format

### FORMAT 2: MULTI-STATEMENT EVALUATION (MSQ) (30% of questions - RPSC COMBINATION FORMAT):

**CRITICAL MSQ FORMAT RULE - READ CAREFULLY:**

MSQ in RPSC uses **COMBINATION format**, NOT checkbox selection.

**REAL RPSC EXAMPLE:**
\`\`\`json
{
  "questionNumber": 15,
  "questionText": "Which of the following relations are Anti-Symmetric?\\n1. Relation R on ℝ defined by aRb ⟺ a ≤ b\\n2. Relation R on power set P(S) defined by ARB ⟺ A ⊆ B\\n3. Relation R on ℕ defined by aRb ⟺ a divides b\\n4. Relation R on ℤ defined by aRb ⟺ a² = b²\\n\\nSelect the correct answer using the codes given below:",
  "options": {
    "1": "1 and 2 only",
    "2": "2 and 3 only",
    "3": "1, 2 and 3",
    "4": "1, 3 and 4"
  },
  "correctAnswer": "3",
  "explanation": "Anti-symmetric: If aRb and bRa, then a = b.\\n\\nRelation 1: a ≤ b and b ≤ a ⟹ a = b. TRUE (anti-symmetric)\\nRelation 2: A ⊆ B and B ⊆ A ⟹ A = B. TRUE (anti-symmetric)\\nRelation 3: a divides b and b divides a ⟹ a = b (for natural numbers). TRUE (anti-symmetric)\\nRelation 4: a² = b² and b² = a² does NOT imply a = b. Example: 2² = (-2)², but 2 ≠ -2. FALSE (NOT anti-symmetric)\\n\\nTherefore relations 1, 2, and 3 are anti-symmetric → Answer is option (3)",
  "archetype": "propertyClassification",
  "structuralForm": "multipleSelectQuestions",
  "cognitiveLoad": "mediumDensity",
  "difficulty": "BALANCED"
}
\`\`\`

**MSQ GENERATION RULES:**
- Present 4 statements labeled 1, 2, 3, 4 in ENGLISH
- Each statement is independently verifiable (true or false)
- Options show different COMBINATIONS of correct statements
- Student selects WHICH COMBINATION option is correct
- correctAnswer is SINGLE value: "1", "2", "3", or "4"

**❌ FORBIDDEN MSQ PATTERNS:**
- "All statements correct" answer - BANNED
- Checkbox format \`correctAnswer: "1, 3, 4"\` - BANNED
- Making all 4 statements obviously true - BANNED

**✅ REQUIRED MSQ PATTERNS:**
- Mix of true/false statements (2-3 true, 1-2 false)
- Realistic false statements (common misconceptions, partial truths)
- **Options format**: "1 and 2 only", "1, 2 and 3", "2 and 3 only", "1, 3 and 4 only"
- correctAnswer as single string: "1", "2", "3", or "4"

---

## 🧮 CALCULATION DERIVATION REQUIREMENT

**CRITICAL:** Show EVERY arithmetic step in Explanation field.

### VALID DERIVATION:
\`\`\`
C(8,3) = n!/(r!(n-r)!)
      = 8!/(3!×5!)
      = (8×7×6×5!)/(3!×5!)
      = (8×7×6)/(3×2×1)
      = 336/6
      = 56
\`\`\`

### INVALID (WILL BE REJECTED):
\`\`\`
C(8,3) = 56
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
□ Can a human follow without calculator?
□ If NO to any: STOP and add derivation

---

## 📤 JSON OUTPUT FORMAT

**CRITICAL:** Double-escape ALL LaTeX backslashes in JSON strings.

**WRONG:** "questionText": "$A = \\{x | x \\in \\mathbb{R}\\}$"
**CORRECT:** "questionText": "$A = \\\\{x | x \\\\in \\\\mathbb{R}\\\\}$"

Common LaTeX commands to escape:
- \\\\{, \\\\}, \\\\in, \\\\mathbb{R}, \\\\frac{}{}, \\\\sqrt{x}
- \\\\alpha, \\\\beta, \\\\theta, \\\\Delta, \\\\implies
- \\\\leq, \\\\geq, \\\\neq, \\\\times, \\\\cdot

### JSON Schema:
\`\`\`json
{
  "questions": [{
    "questionNumber": 1,
    "questionText": "Full question with DOUBLE-ESCAPED LaTeX: $x \\\\in \\\\mathbb{R}$",
    "options": {
      "1": "Option 1",
      "2": "Option 2",
      "3": "Option 3",
      "4": "Option 4"
    },
    "correctAnswer": "1",
    "explanation": "Complete step-by-step derivation with DOUBLE-ESCAPED LaTeX",
    "archetype": "multiStepCalculation",
    "structuralForm": "standard4OptionMCQ",
    "cognitiveLoad": "highDensity",
    "difficulty": "BALANCED"
  }]
}
\`\`\`

---

## 🚫 PROHIBITIONS

${config.prohibitions.map(p => `${p}`).join('\n')}

---

## 🎯 GENERATION INSTRUCTION

Generate exactly ${questionCount} questions following:
- Archetype distribution specified above
- Structural form distribution (70% standard MCQ, 30% MSQ)
- Cognitive load distribution (65% high-density)
- JEE Mains difficulty level (multi-step problem-solving)
- Complete calculation derivations in all explanations

Each question must:
1. Test deep undergraduate mathematics knowledge
2. Require multi-step reasoning (2-4 steps minimum)
3. Challenge experienced mathematics teachers
4. Include complete step-by-step derivation in explanation
5. Be appropriate for competitive government exam

**Remember:** These assess senior mathematics teachers. Questions must be rigorous, computational, and professionally challenging.`
}

// ============================================================================
// PROTOCOL EXPORT
// ============================================================================

export const mathematicsGraduationLevel: Protocol = {
  id: 'rpsc-senior-teacher-grade2-paper2-mathematics-graduation-level',
  name: 'Mathematics (Graduation Level)',
  streamName: 'RPSC Senior Teacher (Grade II)',
  subjectName: 'Mathematics (Graduation)',
  difficultyMappings,
  prohibitions,
  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 3,
    warmupPercentage: 0.08
  },
  buildPrompt: buildPrompt as any, // Type assertion: Maths protocols use chapterKnowledge instead of hasStudyMaterials
  validators: [],
  metadata: {
    description: 'RPSC Senior Teacher Grade II Paper 2: Graduation Level Mathematics - JEE Mains Level',
    analysisSource: 'Based on RPSC 2022 analysis + JEE Mains difficulty standards',
    version: '4.0.0',
    lastUpdated: '2025-01-24',
    examType: 'COMPETITIVE GOVERNMENT EXAM - SENIOR TEACHER (Grade II)',
    sectionWeightage: '40 questions out of 150 total in Paper-II',
    difficultyMultiplier: '6-8x (JEE Mains level - significantly harder than standard B.Sc.)',
    cognitiveLoadTarget: '65% high-density for balanced difficulty',
    note: `REFACTORED PROTOCOL (v4.0) - RAZOR-SHARP & CONCRETE:

**STRUCTURAL DISTRIBUTION (Balanced - 40 questions):**
  - Standard MCQ: 70% (28Q) - MASSIVE INCREASE (matches RPSC 2022 reality)
  - Multi-Statement MSQ: 30% (12Q) - Property verification only
  - arrangeInOrder: 0% - ELIMINATED (tests procedure memory, not math)
  - assertionReasoning: 0% - ELIMINATED (not in RPSC 2022)
  - matchTheFollowing: 0% - ELIMINATED (trivial definition matching)

**ARCHETYPE DISTRIBUTION (Balanced):**
  - multiStepCalculation: 35% (14Q) - DOMINANT - every question 2-4 steps
  - conceptIntegration: 25% (10Q) - INCREASED - synthesize multiple concepts
  - propertyClassification: 15% (6Q) - Deep property analysis
  - parameterFinding: 12% (5Q) - Solve for unknowns in constraints
  - conditionalVerification: 8% (3Q) - Verify conditions hold
  - transformationMapping: 5% (2Q) - Advanced transformations
  - directRecall: 0% - ELIMINATED from balanced (too simple)

**COGNITIVE LOAD (Balanced):**
  - Low-Density: 8% (warm-up only)
  - Medium-Density: 27%
  - High-Density: 65% - SENIOR TEACHER DEMANDS

**JEE MAINS LEVEL EXAMPLES (10 concrete examples):**
  - Nested power sets: |P(P(A))| where |A|=2
  - Complex relation: (z₁-z₂)/(z₁+z₂) is real → prove symmetric
  - Diophantine + sets: 2^m - 2^n = 56 where m,n are cardinalities
  - Equivalence classes: (a,b)~(c,d) ⟺ ad=bc, count classes
  - Möbius transformations, vector triple products, combinatorics with constraints

**QUALITY CHARACTERISTICS:**
  - Every question requires problem-solving (not definition recall)
  - Every question has multi-step derivation shown
  - Every question tests mathematical maturity
  - Appropriate for competitive exam targeting B.Sc. graduates
  - Challenges experienced mathematics educators`
  }
}

export default mathematicsGraduationLevel
