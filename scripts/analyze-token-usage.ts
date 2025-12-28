/**
 * Token Usage Analytics Script
 * Analyzes file-based token logs and generates cost reports
 *
 * Usage:
 *   npm run analyze-tokens
 *   npm run analyze-tokens -- --month 2025-12
 *   npm run analyze-tokens -- --date 2025-12-22
 *   npm run analyze-tokens -- --export-csv
 */

import * as fs from 'fs'
import * as path from 'path'
import { getDailySummary, getMonthlySummary, getAllMonthlySummaries, printDailySummary, printMonthlySummary, formatCost } from '../src/lib/ai/tokenLogger'

const TOKEN_LOGS_DIR = path.join(process.cwd(), 'debug_logs', 'token_usage')

function exportToCsv(month?: string): void {
  console.log('\n📊 Exporting token usage to CSV...\n')

  const summaries = month
    ? [{ month, summary: getMonthlySummary(month) }].filter(s => s.summary !== null)
    : getAllMonthlySummaries()

  if (summaries.length === 0) {
    console.log('No data found to export')
    return
  }

  // Create CSV header
  const csvLines: string[] = [
    'Month,Institute ID,Institute Name,Total Operations,Total Papers,Total Questions,Total Tokens,Total Cost (INR)'
  ]

  // Add data rows
  summaries.forEach(({ month, summary }) => {
    if (!summary) return

    Object.entries(summary.byInstitute).forEach(([instituteId, data]) => {
      csvLines.push(
        [
          month,
          instituteId,
          data.instituteName || 'Unknown',
          data.operations,
          data.papers.size,
          data.questions,
          data.tokens,
          data.costINR.toFixed(2)
        ].join(',')
      )
    })
  })

  // Write CSV file
  const csvPath = path.join(TOKEN_LOGS_DIR, `usage_export_${new Date().toISOString().split('T')[0]}.csv`)
  fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf-8')

  console.log(`✅ Exported to: ${csvPath}`)
  console.log(`   Total rows: ${csvLines.length - 1}`)
}

function showOverallStats(): void {
  const allSummaries = getAllMonthlySummaries()

  if (allSummaries.length === 0) {
    console.log('\n⚠️  No token usage data found')
    console.log(`   Check ${TOKEN_LOGS_DIR} for log files`)
    return
  }

  console.log('\n' + '='.repeat(70))
  console.log('📊 OVERALL TOKEN USAGE STATISTICS')
  console.log('='.repeat(70))

  let totalOperations = 0
  let totalTokens = 0
  let totalCostINR = 0
  let totalQuestions = 0
  let totalPapers = new Set<string>()
  const instituteStats: { [id: string]: { name?: string; cost: number; questions: number } } = {}

  allSummaries.forEach(({ summary }) => {
    totalOperations += summary.totalOperations
    totalTokens += summary.totalTokens
    totalCostINR += summary.totalCostINR
    totalQuestions += summary.totalQuestions
    summary.totalPapers.forEach(p => totalPapers.add(p))

    Object.entries(summary.byInstitute).forEach(([id, data]) => {
      if (!instituteStats[id]) {
        instituteStats[id] = { name: data.instituteName, cost: 0, questions: 0 }
      }
      instituteStats[id].cost += data.costINR
      instituteStats[id].questions += data.questions
    })
  })

  console.log(`\nTime Period: ${allSummaries[allSummaries.length - 1].month} to ${allSummaries[0].month}`)
  console.log(`Total Months: ${allSummaries.length}`)
  console.log(`Total Operations: ${totalOperations.toLocaleString()}`)
  console.log(`Total Papers Generated: ${totalPapers.size}`)
  console.log(`Total Questions Generated: ${totalQuestions.toLocaleString()}`)
  console.log(`Total Tokens Used: ${totalTokens.toLocaleString()}`)
  console.log(`Total Cost: ${formatCost(totalCostINR)}`)

  console.log('\n📈 Cost Breakdown by Institute:')
  Object.entries(instituteStats)
    .sort((a, b) => b[1].cost - a[1].cost)
    .forEach(([id, data]) => {
      console.log(`   ${data.name || id}:`)
      console.log(`      Cost: ${formatCost(data.cost)}`)
      console.log(`      Questions: ${data.questions.toLocaleString()}`)
    })

  console.log('\n💡 Average Costs:')
  console.log(`   Per Operation: ${formatCost(totalCostINR / totalOperations)}`)
  console.log(`   Per Paper: ${formatCost(totalCostINR / totalPapers.size)}`)
  console.log(`   Per Question: ${formatCost(totalCostINR / totalQuestions)}`)
  console.log(`   Per Month: ${formatCost(totalCostINR / allSummaries.length)}`)

  console.log('\n' + '='.repeat(70) + '\n')
}

function listAvailableMonths(): void {
  const summaries = getAllMonthlySummaries()

  if (summaries.length === 0) {
    console.log('\n⚠️  No monthly summaries found')
    return
  }

  console.log('\n📅 Available Monthly Reports:')
  summaries.forEach(({ month, summary }) => {
    console.log(`   ${month}: ${summary.totalOperations} operations, ${formatCost(summary.totalCostINR)}`)
  })
  console.log()
}

function showRecentActivity(days: number = 7): void {
  console.log(`\n📊 Recent Activity (Last ${days} Days)\n`)

  const today = new Date()
  const recentDates: string[] = []

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    recentDates.push(date.toISOString().split('T')[0])
  }

  let totalCost = 0
  let totalQuestions = 0

  recentDates.forEach(date => {
    const summary = getDailySummary(date)
    if (summary) {
      console.log(`${date}: ${summary.totalOperations} ops, ${summary.totalQuestions} questions, ${formatCost(summary.totalCostINR)}`)
      totalCost += summary.totalCostINR
      totalQuestions += summary.totalQuestions
    }
  })

  console.log(`\n${days}-Day Total: ${formatCost(totalCost)} (${totalQuestions} questions)`)
  console.log(`Daily Average: ${formatCost(totalCost / days)}\n`)
}

// Main CLI
function main() {
  const args = process.argv.slice(2)

  // Parse arguments
  const flags = {
    month: args.find(a => a.startsWith('--month='))?.split('=')[1],
    date: args.find(a => a.startsWith('--date='))?.split('=')[1],
    exportCsv: args.includes('--export-csv'),
    listMonths: args.includes('--list-months'),
    recent: args.find(a => a.startsWith('--recent='))?.split('=')[1],
    help: args.includes('--help') || args.includes('-h'),
  }

  if (flags.help) {
    console.log(`
Token Usage Analytics Script

Usage:
  npm run analyze-tokens [options]

Options:
  --help, -h              Show this help message
  --list-months           List all available monthly reports
  --month=YYYY-MM         Show detailed report for specific month
  --date=YYYY-MM-DD       Show detailed report for specific date
  --recent=N              Show recent activity for last N days (default: 7)
  --export-csv            Export all data to CSV file

Examples:
  npm run analyze-tokens
  npm run analyze-tokens -- --month=2025-12
  npm run analyze-tokens -- --date=2025-12-22
  npm run analyze-tokens -- --recent=14
  npm run analyze-tokens -- --export-csv
  npm run analyze-tokens -- --list-months
    `)
    return
  }

  console.log('\n🔍 AachaaryaAI Token Usage Analytics\n')

  if (flags.listMonths) {
    listAvailableMonths()
    return
  }

  if (flags.date) {
    printDailySummary(flags.date)
    return
  }

  if (flags.month) {
    printMonthlySummary(flags.month)
    return
  }

  if (flags.recent) {
    showRecentActivity(parseInt(flags.recent))
    return
  }

  if (flags.exportCsv) {
    exportToCsv(flags.month)
    return
  }

  // Default: show overall stats
  showOverallStats()
  showRecentActivity(7)
}

main()
