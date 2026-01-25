/**
 * Token Tracking & Cost Calculation Utility
 * Calculates costs based on official Gemini pricing (December 2025)
 * File-based logging - no database dependencies
 */

import { logTokenUsage } from './tokenLogger'

// Gemini API Pricing (per 1M tokens) - Updated Dec 2025
export const GEMINI_PRICING = {
  'gemini-3-pro-preview': {
    input: { standard: 2.00, batch: 1.00 },
    output: { standard: 12.00, batch: 6.00 },
    contextCache: 0.20,
  },
  'gemini-3-flash-preview': {
    input: { standard: 0.50, batch: 0.25 },
    output: { standard: 3.00, batch: 1.50 },
    contextCache: 0.05,
  },
  'gemini-2.5-pro': {
    input: { standard: 1.25, batch: 0.625 },
    output: { standard: 10.00, batch: 5.00 },
    contextCache: 0.125,
  },
  'gemini-2.5-flash': {
    input: { standard: 0.30, batch: 0.15 },
    output: { standard: 2.50, batch: 1.25 },
    contextCache: 0.03,
  },
  'gemini-2.5-flash-lite': {
    input: { standard: 0.10, batch: 0.05 },
    output: { standard: 0.40, batch: 0.20 },
    contextCache: 0.01,
  },
  'gemini-2.0-flash': {
    input: { standard: 0.10, batch: 0.05 },
    output: { standard: 0.40, batch: 0.20 },
    contextCache: 0.025,
  },
  'gemini-2.0-flash-lite': {
    input: { standard: 0.075, batch: 0.0375 },
    output: { standard: 0.30, batch: 0.15 },
    contextCache: 0.019,
  },
  'gemini-2.0-flash-exp': {
    // Experimental, same as 2.0-flash
    input: { standard: 0.10, batch: 0.05 },
    output: { standard: 0.40, batch: 0.20 },
    contextCache: 0.025,
  },
} as const

type GeminiModel = keyof typeof GEMINI_PRICING
type ApiMode = 'standard' | 'batch' | 'knowledge_based'

interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cachedTokens?: number
}

interface CostBreakdown {
  inputCost: number
  outputCost: number
  cacheCost: number
  totalCost: number
  costInINR: number // Converted to Indian Rupees
}

/**
 * Calculate cost based on token usage and model
 */
export function calculateCost(
  usage: TokenUsage,
  model: string,
  mode: ApiMode = 'standard'
): CostBreakdown {
  const modelKey = model as GeminiModel
  const pricing = GEMINI_PRICING[modelKey]

  if (!pricing) {
    console.warn(`[TOKEN_TRACKER] Unknown model: ${model}, using default pricing`)
    // Default to 2.5-flash-lite pricing
    const defaultPricing = GEMINI_PRICING['gemini-2.5-flash-lite']
    return calculateCostInternal(usage, defaultPricing, mode)
  }

  return calculateCostInternal(usage, pricing, mode)
}

function calculateCostInternal(
  usage: TokenUsage,
  pricing: typeof GEMINI_PRICING[GeminiModel],
  mode: ApiMode
): CostBreakdown {
  // Map knowledge_based to standard pricing (not batched)
  const pricingMode = mode === 'knowledge_based' ? 'standard' : mode

  // Cost per 1M tokens, so divide by 1,000,000
  const inputCost = (usage.promptTokens / 1_000_000) * pricing.input[pricingMode]
  const outputCost = (usage.completionTokens / 1_000_000) * pricing.output[pricingMode]
  const cacheCost = usage.cachedTokens
    ? (usage.cachedTokens / 1_000_000) * pricing.contextCache
    : 0

  const totalCost = inputCost + outputCost + cacheCost

  // Convert to INR (approximate exchange rate: 1 USD = 83 INR)
  const USD_TO_INR = 83
  const costInINR = totalCost * USD_TO_INR

  return {
    inputCost,
    outputCost,
    cacheCost,
    totalCost,
    costInINR,
  }
}

interface ApiUsageLogParams {
  instituteId: string
  instituteName?: string
  teacherId?: string
  paperId?: string
  paperTitle?: string
  chapterId?: string
  chapterName?: string
  questionId?: string
  usage: TokenUsage
  modelUsed: string
  operationType: 'generate' | 'regenerate' | 'upload'
  questionsGenerated?: number
  mode?: ApiMode
}

/**
 * Log API usage to file-based token logs
 */
export function logApiUsage(params: ApiUsageLogParams): void {
  try {
    const costs = calculateCost(params.usage, params.modelUsed, params.mode)
    const now = new Date()
    const timestamp = now.toISOString()
    const date = now.toISOString().split('T')[0] // YYYY-MM-DD

    logTokenUsage({
      timestamp,
      date,
      instituteId: params.instituteId,
      instituteName: params.instituteName,
      teacherId: params.teacherId,
      paperId: params.paperId,
      paperTitle: params.paperTitle,
      chapterId: params.chapterId,
      chapterName: params.chapterName,
      questionId: params.questionId,
      operationType: params.operationType,
      modelUsed: params.modelUsed,
      apiMode: params.mode || 'standard',
      tokenUsage: params.usage,
      costs: {
        inputCostUSD: costs.inputCost,
        outputCostUSD: costs.outputCost,
        cacheCostUSD: costs.cacheCost,
        totalCostUSD: costs.totalCost,
        totalCostINR: costs.costInINR,
      },
      questionsGenerated: params.questionsGenerated,
    })

    console.log(
      `[TOKEN_TRACKER] Logged: ${params.usage.totalTokens} tokens, ₹${costs.costInINR.toFixed(4)} (${params.operationType})`
    )
  } catch (error) {
    console.error('[TOKEN_TRACKER] Error logging usage:', error)
    // Swallow error - logging is non-critical
  }
}

/**
 * Format cost for display
 */
export function formatCost(costUSD: number): string {
  const costINR = costUSD * 83
  if (costINR < 1) {
    return `₹${costINR.toFixed(4)}`
  } else if (costINR < 100) {
    return `₹${costINR.toFixed(2)}`
  } else {
    return `₹${Math.round(costINR).toLocaleString('en-IN')}`
  }
}

/**
 * Get recommended model based on quality/cost trade-off
 */
export function getRecommendedModel(
  priority: 'cost' | 'balanced' | 'quality'
): GeminiModel {
  switch (priority) {
    case 'cost':
      return 'gemini-2.5-flash-lite'
    case 'balanced':
      return 'gemini-2.5-flash'
    case 'quality':
      return 'gemini-3-flash-preview'
    default:
      return 'gemini-2.5-flash-lite'
  }
}
