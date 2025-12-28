/**
 * Pricing Calculator for Coaching Institutes
 * Helps estimate costs and create pricing models based on usage patterns
 */

import { GEMINI_PRICING } from './tokenTracker'

interface UsagePattern {
  papersPerMonth: number
  avgQuestionsPerPaper: number
  avgInputTokensPerQuestion?: number // Default: 350
  avgOutputTokensPerQuestion?: number // Default: 460
}

interface CostEstimate {
  monthlyTokens: {
    input: number
    output: number
    total: number
  }
  monthlyCosts: {
    usd: number
    inr: number
  }
  annualCosts: {
    usd: number
    inr: number
  }
  costPerPaper: {
    usd: number
    inr: number
  }
  costPerQuestion: {
    usd: number
    inr: number
  }
}

/**
 * Estimate costs based on usage pattern
 */
export function estimateCosts(
  pattern: UsagePattern,
  model: keyof typeof GEMINI_PRICING = 'gemini-2.5-flash-lite',
  mode: 'standard' | 'batch' = 'standard'
): CostEstimate {
  // Default token estimates based on actual data from debug logs
  const inputTokensPerQuestion = pattern.avgInputTokensPerQuestion || 350
  const outputTokensPerQuestion = pattern.avgOutputTokensPerQuestion || 460

  // Calculate total tokens per month
  const totalQuestionsPerMonth = pattern.papersPerMonth * pattern.avgQuestionsPerPaper
  const monthlyInputTokens = totalQuestionsPerMonth * inputTokensPerQuestion
  const monthlyOutputTokens = totalQuestionsPerMonth * outputTokensPerQuestion
  const monthlyTotalTokens = monthlyInputTokens + monthlyOutputTokens

  // Get pricing
  const pricing = GEMINI_PRICING[model]
  const inputPricePerM = pricing.input[mode]
  const outputPricePerM = pricing.output[mode]

  // Calculate costs
  const monthlyInputCost = (monthlyInputTokens / 1_000_000) * inputPricePerM
  const monthlyOutputCost = (monthlyOutputTokens / 1_000_000) * outputPricePerM
  const monthlyCostUSD = monthlyInputCost + monthlyOutputCost
  const monthlyCostINR = monthlyCostUSD * 83

  const annualCostUSD = monthlyCostUSD * 12
  const annualCostINR = monthlyCostINR * 12

  const costPerPaperUSD = monthlyCostUSD / pattern.papersPerMonth
  const costPerPaperINR = monthlyCostINR / pattern.papersPerMonth

  const costPerQuestionUSD = monthlyCostUSD / totalQuestionsPerMonth
  const costPerQuestionINR = monthlyCostINR / totalQuestionsPerMonth

  return {
    monthlyTokens: {
      input: monthlyInputTokens,
      output: monthlyOutputTokens,
      total: monthlyTotalTokens,
    },
    monthlyCosts: {
      usd: monthlyCostUSD,
      inr: monthlyCostINR,
    },
    annualCosts: {
      usd: annualCostUSD,
      inr: annualCostINR,
    },
    costPerPaper: {
      usd: costPerPaperUSD,
      inr: costPerPaperINR,
    },
    costPerQuestion: {
      usd: costPerQuestionUSD,
      inr: costPerQuestionINR,
    },
  }
}

/**
 * Coaching institute pricing tiers with recommendations
 */
export interface PricingTier {
  name: string
  monthlyPrice: number
  annualPrice: number
  annualDiscount: number
  included: {
    teachers: number
    papersPerMonth: number
    questionsPerMonth: number
  }
  features: string[]
  recommendedFor: string
}

/**
 * Generate recommended pricing tiers based on operational costs
 */
export function generatePricingTiers(
  targetMargin: number = 0.85 // 85% margin
): PricingTier[] {
  // Estimate base costs for different usage levels
  const starterUsage = estimateCosts(
    { papersPerMonth: 40, avgQuestionsPerPaper: 30 },
    'gemini-2.5-flash-lite'
  )

  const professionalUsage = estimateCosts(
    { papersPerMonth: 150, avgQuestionsPerPaper: 30 },
    'gemini-2.5-flash-lite'
  )

  const enterpriseUsage = estimateCosts(
    { papersPerMonth: 500, avgQuestionsPerPaper: 40 },
    'gemini-2.5-flash-lite'
  )

  // Add infrastructure costs (₹2,000/month base cost)
  const infraCostMonthly = 2000
  const infraCostAnnual = infraCostMonthly * 12

  // Calculate prices with target margin
  const starterMonthlyCost = starterUsage.monthlyCosts.inr + infraCostMonthly
  const starterMonthlyPrice = Math.ceil(starterMonthlyCost / (1 - targetMargin) / 1000) * 1000

  const professionalMonthlyCost = professionalUsage.monthlyCosts.inr + infraCostMonthly
  const professionalMonthlyPrice =
    Math.ceil(professionalMonthlyCost / (1 - targetMargin) / 1000) * 1000

  const enterpriseMonthlyCost = enterpriseUsage.monthlyCosts.inr + infraCostMonthly
  const enterpriseMonthlyPrice =
    Math.ceil(enterpriseMonthlyCost / (1 - targetMargin) / 1000) * 1000

  return [
    {
      name: 'Starter',
      monthlyPrice: starterMonthlyPrice,
      annualPrice: starterMonthlyPrice * 10, // 2 months free (20% discount)
      annualDiscount: 0.2,
      included: {
        teachers: 3,
        papersPerMonth: 40,
        questionsPerMonth: 1200,
      },
      features: [
        'Up to 3 teacher accounts',
        'Up to 40 test papers/month',
        'Institute branding on papers',
        'Email support',
        'Basic usage analytics',
      ],
      recommendedFor: 'Small coaching institutes or subject-specific centers',
    },
    {
      name: 'Professional',
      monthlyPrice: professionalMonthlyPrice,
      annualPrice: professionalMonthlyPrice * 10,
      annualDiscount: 0.2,
      included: {
        teachers: 10,
        papersPerMonth: 150,
        questionsPerMonth: 4500,
      },
      features: [
        'Up to 10 teacher accounts',
        'Up to 150 test papers/month',
        'Institute branding on papers',
        'Priority email & chat support',
        'Advanced usage analytics',
        'Dedicated onboarding',
        'Monthly usage reports',
      ],
      recommendedFor: 'Medium-sized NEET/JEE coaching institutes',
    },
    {
      name: 'Enterprise',
      monthlyPrice: enterpriseMonthlyPrice,
      annualPrice: enterpriseMonthlyPrice * 10,
      annualDiscount: 0.2,
      included: {
        teachers: 999,
        papersPerMonth: 500,
        questionsPerMonth: 20000,
      },
      features: [
        'Unlimited teacher accounts',
        'Unlimited test papers',
        'Institute branding on papers',
        '24/7 priority support',
        'Advanced usage analytics & reporting',
        'Dedicated account manager',
        'Custom integrations',
        'Training & workshops',
        'API access (optional)',
      ],
      recommendedFor: 'Large coaching chains or multi-branch institutes',
    },
  ]
}

/**
 * Calculate ROI for coaching institute
 */
export function calculateROI(params: {
  typewritersSaved: number
  costPerTypewriter: number
  teacherHoursSaved: number
  costPerTeacherHour: number
  subscriptionCost: number
}): {
  totalSavings: number
  netBenefit: number
  roi: number // Percentage
  breakEven: string // In months
} {
  // Monthly savings from eliminated costs
  const typewriterSavings = params.typewritersSaved * params.costPerTypewriter
  const teacherTimeSavings = params.teacherHoursSaved * params.costPerTeacherHour
  const totalSavings = typewriterSavings + teacherTimeSavings

  // Net benefit
  const netBenefit = totalSavings - params.subscriptionCost

  // ROI percentage
  const roi = (netBenefit / params.subscriptionCost) * 100

  // Break-even calculation (N/A if already profitable)
  const breakEven = netBenefit > 0 ? 'Immediate' : 'Not profitable'

  return {
    totalSavings,
    netBenefit,
    roi,
    breakEven,
  }
}

/**
 * Compare models for cost-benefit analysis
 */
export function compareModels(usage: UsagePattern): {
  model: string
  monthlyCostINR: number
  costPerPaper: number
  qualityTier: 'Budget' | 'Standard' | 'Premium' | 'Enterprise'
  recommended: boolean
}[] {
  const models: Array<keyof typeof GEMINI_PRICING> = [
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-pro',
    'gemini-3-pro-preview',
  ]

  const results = models.map((model) => {
    const estimate = estimateCosts(usage, model, 'standard')

    let qualityTier: 'Budget' | 'Standard' | 'Premium' | 'Enterprise'
    if (model.includes('lite')) {
      qualityTier = 'Budget'
    } else if (model.includes('flash')) {
      qualityTier = 'Standard'
    } else if (model.includes('pro') && model.includes('2.5')) {
      qualityTier = 'Premium'
    } else {
      qualityTier = 'Enterprise'
    }

    // Recommend 2.5-flash-lite as best balance
    const recommended = model === 'gemini-2.5-flash-lite'

    return {
      model,
      monthlyCostINR: estimate.monthlyCosts.inr,
      costPerPaper: estimate.costPerPaper.inr,
      qualityTier,
      recommended,
    }
  })

  return results.sort((a, b) => a.monthlyCostINR - b.monthlyCostINR)
}

/**
 * Generate pricing proposal for a specific institute
 */
export function generateProposal(params: {
  instituteName: string
  estimatedPapersPerMonth: number
  avgQuestionsPerPaper: number
  currentTypewriters: number
  typewriterCostPerMonth: number
}): {
  analysis: {
    currentMonthlyCost: number
    estimatedApiCost: number
    infraCost: number
    totalOperationalCost: number
    suggestedPrice: number
    margin: number
  }
  roi: {
    monthlySavings: number
    annualSavings: number
    roiPercentage: number
  }
  recommendation: {
    tier: string
    price: number
    interval: 'monthly' | 'annual'
  }
} {
  // Calculate their current costs
  const currentMonthlyCost = params.currentTypewriters * params.typewriterCostPerMonth

  // Calculate our operational costs
  const apiCosts = estimateCosts(
    {
      papersPerMonth: params.estimatedPapersPerMonth,
      avgQuestionsPerPaper: params.avgQuestionsPerPaper,
    },
    'gemini-2.5-flash-lite'
  )

  const infraCost = 2000 // Base infrastructure cost
  const totalOperationalCost = apiCosts.monthlyCosts.inr + infraCost

  // Suggested price: Operational cost + 85% margin, rounded to nearest 1000
  const suggestedPrice = Math.ceil((totalOperationalCost / 0.15) / 1000) * 1000
  const margin = ((suggestedPrice - totalOperationalCost) / suggestedPrice) * 100

  // ROI for the institute
  const monthlySavings = currentMonthlyCost - suggestedPrice
  const annualSavings = monthlySavings * 12
  const roiPercentage = (monthlySavings / currentMonthlyCost) * 100

  // Tier recommendation
  const tiers = generatePricingTiers()
  let recommendedTier = tiers[0]
  if (params.estimatedPapersPerMonth > 100) {
    recommendedTier = tiers[1]
  }
  if (params.estimatedPapersPerMonth > 300) {
    recommendedTier = tiers[2]
  }

  return {
    analysis: {
      currentMonthlyCost,
      estimatedApiCost: apiCosts.monthlyCosts.inr,
      infraCost,
      totalOperationalCost,
      suggestedPrice,
      margin,
    },
    roi: {
      monthlySavings,
      annualSavings,
      roiPercentage,
    },
    recommendation: {
      tier: recommendedTier.name,
      price: recommendedTier.annualPrice,
      interval: 'annual',
    },
  }
}
