/**
 * Auth Monitoring
 *
 * Tracks auth performance and errors in production.
 * Sends metrics to monitoring service (Sentry, DataDog, etc.)
 *
 * Usage:
 *   authMonitoring.trackOperation('getSession', 1250, true)
 *   authMonitoring.getSummary()
 *   authMonitoring.checkHealth()
 *
 * Auto-checks health every 5 minutes in production.
 *
 * @module lib/auth/monitoring
 */

interface AuthMetric {
  operation: string
  duration: number
  success: boolean
  error?: string
  timestamp: Date
  userAgent: string
  networkSpeed?: string
  sessionId?: string
}

interface PerformanceSummary {
  total: number
  successful: number
  failed: number
  successRate: string
  avgDuration: string
  slowOps: number
  p50: number
  p95: number
  p99: number
}

class AuthMonitoring {
  private metrics: AuthMetric[] = []
  private readonly MAX_METRICS = 100 // Keep last 100 in memory

  /**
   * Track an auth operation
   */
  trackOperation(
    operation: string,
    duration: number,
    success: boolean,
    error?: Error
  ) {
    const metric: AuthMetric = {
      operation,
      duration,
      success,
      error: error?.message,
      timestamp: new Date(),
      userAgent: this.getUserAgent(),
      networkSpeed: this.getNetworkSpeed(),
    }

    // Add to memory
    this.metrics.push(metric)
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift()
    }

    // Log if slow or error
    if (duration > 5000) {
      console.warn('[AuthMonitoring] 🐌 Slow operation:', {
        operation,
        duration: `${duration}ms`,
        networkSpeed: metric.networkSpeed
      })
    }

    if (!success) {
      console.error('[AuthMonitoring] ❌ Failed operation:', {
        operation,
        duration: `${duration}ms`,
        error: error?.message
      })
    }

    // Send to monitoring service
    this.sendToMonitoring(metric)
  }

  /**
   * Get user agent
   */
  private getUserAgent(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  }

  /**
   * Get network speed if available
   */
  private getNetworkSpeed(): string | undefined {
    if (typeof navigator === 'undefined') return undefined

    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection

    return connection?.effectiveType
  }

  /**
   * Send metric to monitoring service
   */
  private sendToMonitoring(metric: AuthMetric) {
    // TODO: Integrate with your monitoring service

    // Example: Sentry
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   Sentry.captureMessage('Auth Operation', {
    //     level: metric.success ? 'info' : 'error',
    //     extra: metric,
    //   })
    // }

    // Example: DataDog
    // if (typeof window !== 'undefined' && window.DD_RUM) {
    //   window.DD_RUM.addTiming(`auth.${metric.operation}`, metric.duration)
    //   if (!metric.success) {
    //     window.DD_RUM.addError(new Error(metric.error || 'Unknown error'))
    //   }
    // }

    // Example: Google Analytics
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', 'auth_operation', {
    //     event_category: 'auth',
    //     event_label: metric.operation,
    //     value: metric.duration,
    //     success: metric.success
    //   })
    // }

    // For now, just log in development
    if (process.env.NODE_ENV === 'development') {
      const icon = metric.success ? '✅' : '❌'
      console.log(`[AuthMonitoring] ${icon} ${metric.operation}: ${metric.duration}ms`)
    }
  }

  /**
   * Calculate percentile
   */
  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0

    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil(sorted.length * (p / 100)) - 1
    return sorted[Math.max(0, index)]
  }

  /**
   * Get performance summary
   */
  getSummary(): PerformanceSummary {
    const total = this.metrics.length
    const successful = this.metrics.filter(m => m.success).length
    const failed = total - successful

    const durations = this.metrics.map(m => m.duration)
    const avgDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0

    const slowOps = this.metrics.filter(m => m.duration > 5000).length

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(1) + '%' : 'N/A',
      avgDuration: avgDuration.toFixed(0) + 'ms',
      slowOps,
      p50: this.percentile(durations, 50),
      p95: this.percentile(durations, 95),
      p99: this.percentile(durations, 99),
    }
  }

  /**
   * Get detailed metrics by operation type
   */
  getMetricsByOperation(): Record<string, PerformanceSummary> {
    const byOperation: Record<string, AuthMetric[]> = {}

    // Group metrics by operation
    this.metrics.forEach(metric => {
      if (!byOperation[metric.operation]) {
        byOperation[metric.operation] = []
      }
      byOperation[metric.operation].push(metric)
    })

    // Calculate summary for each operation
    const result: Record<string, PerformanceSummary> = {}

    Object.entries(byOperation).forEach(([operation, metrics]) => {
      const successful = metrics.filter(m => m.success).length
      const durations = metrics.map(m => m.duration)
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length

      result[operation] = {
        total: metrics.length,
        successful,
        failed: metrics.length - successful,
        successRate: ((successful / metrics.length) * 100).toFixed(1) + '%',
        avgDuration: avgDuration.toFixed(0) + 'ms',
        slowOps: metrics.filter(m => m.duration > 5000).length,
        p50: this.percentile(durations, 50),
        p95: this.percentile(durations, 95),
        p99: this.percentile(durations, 99),
      }
    })

    return result
  }

  /**
   * Alert if error rate is high
   */
  checkHealth() {
    if (this.metrics.length < 10) {
      // Not enough data yet
      return
    }

    const summary = this.getSummary()
    const errorRate = (summary.failed / summary.total) * 100

    // High error rate alert
    if (errorRate > 10) {
      console.error('[AuthMonitoring] 🚨 High error rate detected:', summary)

      // TODO: Send alert to monitoring service
      // Example: Sentry
      // Sentry?.captureMessage('High auth error rate', {
      //   level: 'error',
      //   extra: summary
      // })
    }

    // Many slow operations alert
    if (summary.slowOps > 5) {
      console.warn('[AuthMonitoring] ⚠️  Many slow operations detected:', summary)

      // TODO: Send alert to monitoring service
    }

    // P95 too slow
    if (summary.p95 > 10000) {
      console.warn('[AuthMonitoring] ⚠️  P95 latency too high:', {
        p95: `${summary.p95}ms`,
        summary
      })
    }
  }

  /**
   * Print detailed report
   */
  printReport() {
    console.log('[AuthMonitoring] Performance Report')
    console.log('═'.repeat(80))

    const summary = this.getSummary()

    console.log('📊 Overall Metrics:')
    console.log(`   Total operations: ${summary.total}`)
    console.log(`   ✅ Successful: ${summary.successful}`)
    console.log(`   ❌ Failed: ${summary.failed}`)
    console.log(`   Success rate: ${summary.successRate}`)
    console.log(`   Average duration: ${summary.avgDuration}`)
    console.log(`   Slow operations (>5s): ${summary.slowOps}`)
    console.log('')

    console.log('📈 Latency Percentiles:')
    console.log(`   P50 (median): ${summary.p50}ms`)
    console.log(`   P95: ${summary.p95}ms`)
    console.log(`   P99: ${summary.p99}ms`)
    console.log('')

    console.log('🔍 By Operation Type:')
    const byOperation = this.getMetricsByOperation()
    Object.entries(byOperation).forEach(([operation, stats]) => {
      console.log(`   ${operation}:`)
      console.log(`     Total: ${stats.total}, Success rate: ${stats.successRate}`)
      console.log(`     Avg: ${stats.avgDuration}, P95: ${stats.p95}ms`)
    })

    console.log('═'.repeat(80))
  }

  /**
   * Clear metrics
   */
  clear() {
    this.metrics = []
    console.log('[AuthMonitoring] 🗑️  Metrics cleared')
  }

  /**
   * Get all metrics (for external analysis)
   */
  getMetrics(): readonly AuthMetric[] {
    return [...this.metrics]
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

/**
 * Singleton monitoring instance
 */
export const authMonitoring = new AuthMonitoring()

// Auto-check health every 5 minutes in browser
if (typeof window !== 'undefined') {
  setInterval(() => {
    authMonitoring.checkHealth()
  }, 5 * 60 * 1000) // 5 minutes

  // Make available globally for console access
  ;(window as any).authMonitoring = authMonitoring
}

// Export types
export type { AuthMetric, PerformanceSummary }
