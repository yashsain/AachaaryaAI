/**
 * File-Based Token Usage Logger
 * Logs token usage to debug_logs directory for cost tracking and analysis
 * No database dependencies - pure file-based logging
 */

import * as fs from 'fs'
import * as path from 'path'

// Base directory for token logs (same pattern as debug logs)
const TOKEN_LOGS_DIR = path.join(process.cwd(), 'debug_logs', 'token_usage')
const MONTHLY_LOGS_DIR = path.join(TOKEN_LOGS_DIR, 'monthly')

// Helper function to check if file logging should be disabled
function isFileLoggingDisabled(): boolean {
  // Disable file logging in Vercel production and preview environments
  const vercelEnv = process.env.VERCEL_ENV
  return vercelEnv === 'production' || vercelEnv === 'preview'
}

// Ensure directories exist
function ensureDirectoriesExist() {
  if (isFileLoggingDisabled()) return // Skip directory creation on Vercel

  if (!fs.existsSync(TOKEN_LOGS_DIR)) {
    fs.mkdirSync(TOKEN_LOGS_DIR, { recursive: true })
  }
  if (!fs.existsSync(MONTHLY_LOGS_DIR)) {
    fs.mkdirSync(MONTHLY_LOGS_DIR, { recursive: true })
  }
}

interface TokenUsageLog {
  timestamp: string
  date: string
  instituteId: string
  instituteName?: string
  teacherId?: string
  paperId?: string
  paperTitle?: string
  chapterId?: string
  chapterName?: string
  questionId?: string
  operationType: 'generate' | 'regenerate' | 'upload'
  modelUsed: string
  apiMode: 'standard' | 'batch'
  tokenUsage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    cachedTokens?: number
  }
  costs: {
    inputCostUSD: number
    outputCostUSD: number
    cacheCostUSD: number
    totalCostUSD: number
    totalCostINR: number
  }
  questionsGenerated?: number
}

interface DailySummary {
  date: string
  totalOperations: number
  totalTokens: number
  totalCostUSD: number
  totalCostINR: number
  totalQuestions: number
  byInstitute: {
    [instituteId: string]: {
      instituteName?: string
      operations: number
      tokens: number
      costINR: number
      questions: number
    }
  }
  byModel: {
    [model: string]: {
      operations: number
      tokens: number
      costINR: number
    }
  }
  byOperation: {
    [type: string]: {
      operations: number
      tokens: number
      costINR: number
    }
  }
}

interface MonthlySummary {
  month: string // YYYY-MM format
  totalOperations: number
  totalTokens: number
  totalCostUSD: number
  totalCostINR: number
  totalQuestions: number
  totalPapers: Set<string> // Using Set for unique papers
  byInstitute: {
    [instituteId: string]: {
      instituteName?: string
      operations: number
      tokens: number
      costINR: number
      questions: number
      papers: Set<string>
    }
  }
  dailyBreakdown: {
    [date: string]: {
      operations: number
      tokens: number
      costINR: number
    }
  }
}

/**
 * Log a single token usage event to daily log file
 */
export function logTokenUsage(log: TokenUsageLog): void {
  try {
    console.log('[TOKEN_LOGGER] logTokenUsage called')
    console.log('[TOKEN_LOGGER] VERCEL_ENV:', process.env.VERCEL_ENV)
    console.log('[TOKEN_LOGGER] isFileLoggingDisabled:', isFileLoggingDisabled())

    // Skip file logging on Vercel production/preview
    if (isFileLoggingDisabled()) {
      console.log(`[TOKEN_LOGGER] File logging disabled (VERCEL_ENV=${process.env.VERCEL_ENV})`)
      console.log(`[TOKEN_LOGGER] ${log.operationType}: ${log.tokenUsage.totalTokens} tokens, ₹${log.costs.totalCostINR.toFixed(4)} (${log.modelUsed})`)
      return
    }

    console.log('[TOKEN_LOGGER] Ensuring directories exist...')
    ensureDirectoriesExist()
    console.log('[TOKEN_LOGGER] Directories ready')

    // Create daily log file path
    const dailyLogPath = path.join(TOKEN_LOGS_DIR, `${log.date}_USAGE.jsonl`)

    // Append to daily log file (JSONL format - one JSON per line)
    const logLine = JSON.stringify(log) + '\n'
    fs.appendFileSync(dailyLogPath, logLine, 'utf-8')

    console.log(`[TOKEN_LOGGER] Logged to ${dailyLogPath}`)

    // Also create per-paper detail log if paperId exists
    if (log.paperId) {
      const paperLogPath = path.join(
        TOKEN_LOGS_DIR,
        `${log.date}_paper-${log.paperId}_COST.json`
      )

      // Read existing paper log or create new
      let paperLogs: TokenUsageLog[] = []
      if (fs.existsSync(paperLogPath)) {
        const content = fs.readFileSync(paperLogPath, 'utf-8')
        paperLogs = JSON.parse(content)
      }

      paperLogs.push(log)

      // Write updated paper log
      fs.writeFileSync(paperLogPath, JSON.stringify(paperLogs, null, 2), 'utf-8')
    }

    // Update daily summary
    updateDailySummary(log)

    // Update monthly summary
    updateMonthlySummary(log)
  } catch (error) {
    console.error('[TOKEN_LOGGER] Failed to log token usage:', error)
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Update daily summary with new log entry
 */
function updateDailySummary(log: TokenUsageLog): void {
  if (isFileLoggingDisabled()) return // Already logged in parent function

  const summaryPath = path.join(TOKEN_LOGS_DIR, `${log.date}_SUMMARY.json`)

  let summary: DailySummary = {
    date: log.date,
    totalOperations: 0,
    totalTokens: 0,
    totalCostUSD: 0,
    totalCostINR: 0,
    totalQuestions: 0,
    byInstitute: {},
    byModel: {},
    byOperation: {},
  }

  // Load existing summary if it exists
  if (fs.existsSync(summaryPath)) {
    const content = fs.readFileSync(summaryPath, 'utf-8')
    summary = JSON.parse(content)
  }

  // Update totals
  summary.totalOperations++
  summary.totalTokens += log.tokenUsage.totalTokens
  summary.totalCostUSD += log.costs.totalCostUSD
  summary.totalCostINR += log.costs.totalCostINR
  summary.totalQuestions += log.questionsGenerated || 0

  // Update institute breakdown
  if (!summary.byInstitute[log.instituteId]) {
    summary.byInstitute[log.instituteId] = {
      instituteName: log.instituteName,
      operations: 0,
      tokens: 0,
      costINR: 0,
      questions: 0,
    }
  }
  summary.byInstitute[log.instituteId].operations++
  summary.byInstitute[log.instituteId].tokens += log.tokenUsage.totalTokens
  summary.byInstitute[log.instituteId].costINR += log.costs.totalCostINR
  summary.byInstitute[log.instituteId].questions += log.questionsGenerated || 0

  // Update model breakdown
  if (!summary.byModel[log.modelUsed]) {
    summary.byModel[log.modelUsed] = { operations: 0, tokens: 0, costINR: 0 }
  }
  summary.byModel[log.modelUsed].operations++
  summary.byModel[log.modelUsed].tokens += log.tokenUsage.totalTokens
  summary.byModel[log.modelUsed].costINR += log.costs.totalCostINR

  // Update operation breakdown
  if (!summary.byOperation[log.operationType]) {
    summary.byOperation[log.operationType] = { operations: 0, tokens: 0, costINR: 0 }
  }
  summary.byOperation[log.operationType].operations++
  summary.byOperation[log.operationType].tokens += log.tokenUsage.totalTokens
  summary.byOperation[log.operationType].costINR += log.costs.totalCostINR

  // Save updated summary
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8')
}

/**
 * Update monthly summary with new log entry
 */
function updateMonthlySummary(log: TokenUsageLog): void {
  if (isFileLoggingDisabled()) return // Already logged in parent function

  const month = log.date.substring(0, 7) // YYYY-MM
  const summaryPath = path.join(MONTHLY_LOGS_DIR, `${month}_SUMMARY.json`)

  let summary: MonthlySummary = {
    month,
    totalOperations: 0,
    totalTokens: 0,
    totalCostUSD: 0,
    totalCostINR: 0,
    totalQuestions: 0,
    totalPapers: new Set(),
    byInstitute: {},
    dailyBreakdown: {},
  }

  // Load existing summary if it exists
  if (fs.existsSync(summaryPath)) {
    const content = fs.readFileSync(summaryPath, 'utf-8')
    const parsed = JSON.parse(content)
    // Convert totalPapers and institute papers arrays back to Sets
    summary = {
      ...parsed,
      totalPapers: new Set(parsed.totalPapers || []),
      byInstitute: Object.fromEntries(
        Object.entries(parsed.byInstitute || {}).map(([id, data]: [string, any]) => [
          id,
          { ...data, papers: new Set(data.papers || []) },
        ])
      ),
    }
  }

  // Update totals
  summary.totalOperations++
  summary.totalTokens += log.tokenUsage.totalTokens
  summary.totalCostUSD += log.costs.totalCostUSD
  summary.totalCostINR += log.costs.totalCostINR
  summary.totalQuestions += log.questionsGenerated || 0
  if (log.paperId) {
    summary.totalPapers.add(log.paperId)
  }

  // Update institute breakdown
  if (!summary.byInstitute[log.instituteId]) {
    summary.byInstitute[log.instituteId] = {
      instituteName: log.instituteName,
      operations: 0,
      tokens: 0,
      costINR: 0,
      questions: 0,
      papers: new Set(),
    }
  }
  summary.byInstitute[log.instituteId].operations++
  summary.byInstitute[log.instituteId].tokens += log.tokenUsage.totalTokens
  summary.byInstitute[log.instituteId].costINR += log.costs.totalCostINR
  summary.byInstitute[log.instituteId].questions += log.questionsGenerated || 0
  if (log.paperId) {
    summary.byInstitute[log.instituteId].papers.add(log.paperId)
  }

  // Update daily breakdown
  if (!summary.dailyBreakdown[log.date]) {
    summary.dailyBreakdown[log.date] = { operations: 0, tokens: 0, costINR: 0 }
  }
  summary.dailyBreakdown[log.date].operations++
  summary.dailyBreakdown[log.date].tokens += log.tokenUsage.totalTokens
  summary.dailyBreakdown[log.date].costINR += log.costs.totalCostINR

  // Convert Sets to Arrays for JSON serialization
  const serializableSummary = {
    ...summary,
    totalPapers: Array.from(summary.totalPapers),
    byInstitute: Object.fromEntries(
      Object.entries(summary.byInstitute).map(([id, data]) => [
        id,
        { ...data, papers: Array.from(data.papers) },
      ])
    ),
  }

  // Save updated summary
  fs.writeFileSync(summaryPath, JSON.stringify(serializableSummary, null, 2), 'utf-8')
}

/**
 * Get daily summary for a specific date
 */
export function getDailySummary(date: string): DailySummary | null {
  if (isFileLoggingDisabled()) {
    console.warn('[TOKEN_LOGGER] getDailySummary() not available on Vercel')
    return null
  }

  const summaryPath = path.join(TOKEN_LOGS_DIR, `${date}_SUMMARY.json`)

  if (!fs.existsSync(summaryPath)) {
    return null
  }

  const content = fs.readFileSync(summaryPath, 'utf-8')
  return JSON.parse(content)
}

/**
 * Get monthly summary for a specific month
 */
export function getMonthlySummary(month: string): MonthlySummary | null {
  if (isFileLoggingDisabled()) {
    console.warn('[TOKEN_LOGGER] getMonthlySummary() not available on Vercel')
    return null
  }

  const summaryPath = path.join(MONTHLY_LOGS_DIR, `${month}_SUMMARY.json`)

  if (!fs.existsSync(summaryPath)) {
    return null
  }

  const content = fs.readFileSync(summaryPath, 'utf-8')
  const parsed = JSON.parse(content)

  // Convert arrays back to Sets
  return {
    ...parsed,
    totalPapers: new Set(parsed.totalPapers || []),
    byInstitute: Object.fromEntries(
      Object.entries(parsed.byInstitute || {}).map(([id, data]: [string, any]) => [
        id,
        { ...data, papers: new Set(data.papers || []) },
      ])
    ),
  }
}

/**
 * Get all monthly summaries
 */
export function getAllMonthlySummaries(): { month: string; summary: MonthlySummary }[] {
  if (isFileLoggingDisabled()) {
    console.warn('[TOKEN_LOGGER] getAllMonthlySummaries() not available on Vercel')
    return []
  }

  if (!fs.existsSync(MONTHLY_LOGS_DIR)) {
    return []
  }

  const files = fs.readdirSync(MONTHLY_LOGS_DIR)
  const summaries = files
    .filter((f) => f.endsWith('_SUMMARY.json'))
    .map((f) => {
      const month = f.replace('_SUMMARY.json', '')
      const summary = getMonthlySummary(month)
      return summary ? { month, summary } : null
    })
    .filter((s) => s !== null) as { month: string; summary: MonthlySummary }[]

  return summaries.sort((a, b) => b.month.localeCompare(a.month))
}

/**
 * Format cost for display
 */
export function formatCost(costINR: number): string {
  if (costINR < 1) {
    return `₹${costINR.toFixed(4)}`
  } else if (costINR < 100) {
    return `₹${costINR.toFixed(2)}`
  } else {
    return `₹${Math.round(costINR).toLocaleString('en-IN')}`
  }
}

/**
 * Print daily summary to console
 */
export function printDailySummary(date: string): void {
  const summary = getDailySummary(date)
  if (!summary) {
    console.log(`[TOKEN_LOGGER] No summary found for ${date}`)
    return
  }

  console.log('\n' + '='.repeat(60))
  console.log(`DAILY TOKEN USAGE SUMMARY - ${date}`)
  console.log('='.repeat(60))
  console.log(`Total Operations: ${summary.totalOperations}`)
  console.log(`Total Questions Generated: ${summary.totalQuestions}`)
  console.log(`Total Tokens: ${summary.totalTokens.toLocaleString()}`)
  console.log(`Total Cost: ${formatCost(summary.totalCostINR)}`)
  console.log('\nBy Institute:')
  Object.entries(summary.byInstitute).forEach(([id, data]) => {
    console.log(
      `  ${data.instituteName || id}: ${data.operations} ops, ${data.questions} questions, ${formatCost(data.costINR)}`
    )
  })
  console.log('='.repeat(60) + '\n')
}

/**
 * Print monthly summary to console
 */
export function printMonthlySummary(month: string): void {
  const summary = getMonthlySummary(month)
  if (!summary) {
    console.log(`[TOKEN_LOGGER] No summary found for ${month}`)
    return
  }

  console.log('\n' + '='.repeat(60))
  console.log(`MONTHLY TOKEN USAGE SUMMARY - ${month}`)
  console.log('='.repeat(60))
  console.log(`Total Operations: ${summary.totalOperations}`)
  console.log(`Total Papers Generated: ${summary.totalPapers.size}`)
  console.log(`Total Questions Generated: ${summary.totalQuestions}`)
  console.log(`Total Tokens: ${summary.totalTokens.toLocaleString()}`)
  console.log(`Total Cost: ${formatCost(summary.totalCostINR)}`)
  console.log('\nBy Institute:')
  Object.entries(summary.byInstitute).forEach(([id, data]) => {
    console.log(
      `  ${data.instituteName || id}: ${data.operations} ops, ${data.papers.size} papers, ${data.questions} questions, ${formatCost(data.costINR)}`
    )
  })
  console.log('='.repeat(60) + '\n')
}
