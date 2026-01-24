/**
 * RPSC Senior Teacher (Grade II) - Paper-II (Mathematics)
 * Protocol Exports
 *
 * Official Syllabus Structure:
 * ============================================================================
 * Part (i):   Mathematics (Secondary & Sr. Secondary Level)
 *             180 Marks | 90 Questions | 2 Marks Each | 0.33 Negative Marking
 *             Topics: Number System, Plane Geometry, Algebra, Surface Area & Volume,
 *                     Trigonometry, Calculus, Coordinate Geometry, Statistics, Vectors
 *
 * Part (ii):  Mathematics (Graduation Standard)
 *             80 Marks | 40 Questions | 2 Marks Each | 0.33 Negative Marking
 *             Topics: Abstract Algebra, Calculus (Advanced), Real Analysis,
 *                     Vector Analysis, Differential Equations, Statics & Dynamics,
 *                     Linear Programming, Numerical Analysis
 *
 * Part (iii): Teaching Methods of Mathematics
 *             40 Marks | 20 Questions | 2 Marks Each | 0.33 Negative Marking
 *             Topics: Nature of Mathematics, Aims & Objectives, Teaching Methods,
 *                     Lesson Planning, Instructional Materials, Evaluation,
 *                     Diagnostic & Remedial Teaching, Mathematics Laboratory,
 *                     Textbook Characteristics
 *
 * ============================================================================
 * TOTAL: 300 Marks | 150 Questions | Duration: 2.5 Hours (150 Minutes)
 * ============================================================================
 */

export { mathematicsSecondaryAndSeniorSecondary } from './secondary-senior-secondary'
export { mathematicsGraduationLevel } from './graduation-level'
export { mathematicsTeachingMethods } from './teaching-methods'

// Re-export as named collection for convenience
export const paper2MathematicsProtocols = {
  secondaryAndSeniorSecondary: require('./secondary-senior-secondary').mathematicsSecondaryAndSeniorSecondary,
  graduationLevel: require('./graduation-level').mathematicsGraduationLevel,
  teachingMethods: require('./teaching-methods').mathematicsTeachingMethods
}
