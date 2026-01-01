/**
 * Auth State Debugger
 *
 * Development-only tool for visualizing auth operations.
 * Helps detect race conditions, performance issues, and operation flow.
 *
 * Usage:
 *   authDebugger.enable()           // Enable debugging
 *   authDebugger.printTimeline()    // Visual timeline of operations
 *   authDebugger.detectRaces()      // Find concurrent operations
 *   authDebugger.clear()             // Reset operation history
 *
 * Auto-enabled in development mode.
 * Available globally as window.authDebugger
 *
 * @module lib/auth/debugger
 */

interface Operation {
  name: string
  startTime: number
  endTime?: number
  status: 'pending' | 'complete' | 'error'
  error?: Error
  duration?: number
}

class AuthDebugger {
  private enabled = false
  private operations: Operation[] = []
  private readonly MAX_OPERATIONS = 100 // Keep last 100 operations

  /**
   * Enable debugging
   */
  enable() {
    if (typeof window === 'undefined') {
      return // Server-side, can't enable
    }

    this.enabled = true
    console.log('[AuthDebugger] ✅ Debugging enabled')
    console.log('[AuthDebugger] Available methods:')
    console.log('  - authDebugger.printTimeline()  // Show operation timeline')
    console.log('  - authDebugger.detectRaces()    // Find concurrent operations')
    console.log('  - authDebugger.clear()          // Clear history')
    console.log('  - authDebugger.disable()        // Disable debugging')
  }

  /**
   * Disable debugging
   */
  disable() {
    this.enabled = false
    console.log('[AuthDebugger] ❌ Debugging disabled')
  }

  /**
   * Log an auth operation
   */
  logOperation(name: string, event: 'start' | 'complete' | 'error', error?: Error) {
    if (!this.enabled) return

    const now = Date.now()

    if (event === 'start') {
      // Start new operation
      const operation: Operation = {
        name,
        startTime: now,
        status: 'pending',
      }

      this.operations.push(operation)

      // Trim if too many
      if (this.operations.length > this.MAX_OPERATIONS) {
        this.operations.shift()
      }

      const icon = this.getOperationIcon(name)
      console.log(`[AuthDebugger] ${icon} 🟡 ${name} started`)

      // Warn if multiple operations pending
      const pending = this.operations.filter(op => op.status === 'pending')
      if (pending.length > 3) {
        console.warn(
          `[AuthDebugger] ⚠️  ${pending.length} operations pending:`,
          pending.map(op => op.name)
        )
      }
    } else {
      // Complete existing operation
      const op = this.operations.find(o => o.name === name && o.status === 'pending')

      if (op) {
        op.endTime = now
        op.duration = now - op.startTime
        op.status = event === 'complete' ? 'complete' : 'error'
        op.error = error

        const icon = this.getOperationIcon(name)
        const statusIcon = event === 'complete' ? '✅' : '❌'
        const durationText = `${op.duration}ms`

        console.log(`[AuthDebugger] ${icon} ${statusIcon} ${name} ${event} (${durationText})`)

        // Warn if slow
        if (op.duration > 5000) {
          console.warn(`[AuthDebugger] 🐌 ${name} took ${op.duration}ms (> 5s)`)
        }

        // Show error if any
        if (error) {
          console.error(`[AuthDebugger] 💥 ${name} error:`, error.message)
        }
      } else {
        console.warn(`[AuthDebugger] ⚠️  No pending operation found for: ${name}`)
      }
    }
  }

  /**
   * Get icon for operation type
   */
  private getOperationIcon(name: string): string {
    if (name.includes('Session')) return '🔐'
    if (name.includes('Teacher')) return '👤'
    if (name.includes('Institute')) return '🏢'
    if (name.includes('Token')) return '🔄'
    if (name.includes('signOut')) return '👋'
    return '⚙️'
  }

  /**
   * Print visual timeline of operations
   */
  printTimeline() {
    if (!this.enabled) {
      console.log('[AuthDebugger] Debugging not enabled. Call authDebugger.enable() first.')
      return
    }

    if (this.operations.length === 0) {
      console.log('[AuthDebugger] No operations recorded yet.')
      return
    }

    console.log('[AuthDebugger] Operation Timeline')
    console.log('═'.repeat(80))

    this.operations.forEach((op, index) => {
      const icon = this.getOperationIcon(op.name)
      const duration = op.duration ? `${op.duration}ms` : 'pending'
      const status = op.status === 'complete' ? '✅' : op.status === 'error' ? '❌' : '⏳'
      const timestamp = new Date(op.startTime).toLocaleTimeString()

      const nameWidth = 30
      const durationWidth = 10
      const name = op.name.padEnd(nameWidth)
      const dur = duration.padStart(durationWidth)

      console.log(`${index + 1}. ${icon} ${status} ${name} ${dur}  (${timestamp})`)

      // Show error if any
      if (op.error) {
        console.log(`   💥 Error: ${op.error.message}`)
      }
    })

    console.log('═'.repeat(80))

    // Summary stats
    const completed = this.operations.filter(op => op.status === 'complete')
    const errors = this.operations.filter(op => op.status === 'error')
    const pending = this.operations.filter(op => op.status === 'pending')

    const avgDuration = completed.length > 0
      ? Math.round(completed.reduce((sum, op) => sum + (op.duration || 0), 0) / completed.length)
      : 0

    console.log('📊 Summary:')
    console.log(`   Total operations: ${this.operations.length}`)
    console.log(`   ✅ Completed: ${completed.length}`)
    console.log(`   ❌ Errors: ${errors.length}`)
    console.log(`   ⏳ Pending: ${pending.length}`)
    console.log(`   ⏱️  Avg duration: ${avgDuration}ms`)
    console.log('═'.repeat(80))
  }

  /**
   * Detect potential race conditions
   */
  detectRaces() {
    if (!this.enabled) {
      console.log('[AuthDebugger] Debugging not enabled. Call authDebugger.enable() first.')
      return
    }

    console.log('[AuthDebugger] 🏁 Detecting Race Conditions...')
    console.log('─'.repeat(80))

    // Find overlapping operations
    const overlaps: Array<{ op1: Operation; op2: Operation }> = []

    for (let i = 0; i < this.operations.length; i++) {
      const op1 = this.operations[i]
      if (!op1.endTime) continue

      for (let j = i + 1; j < this.operations.length; j++) {
        const op2 = this.operations[j]
        if (!op2.endTime) continue

        // Check if operations overlap in time
        const op1End = op1.endTime
        const op2Start = op2.startTime

        if (op2Start < op1End && op1.name !== op2.name) {
          overlaps.push({ op1, op2 })
        }
      }
    }

    if (overlaps.length === 0) {
      console.log('✅ No race conditions detected!')
    } else {
      console.warn(`⚠️  Found ${overlaps.length} potential race condition(s):`)
      overlaps.forEach(({ op1, op2 }, index) => {
        console.warn(`\n${index + 1}. Overlapping operations:`)
        console.warn(`   ${this.getOperationIcon(op1.name)} ${op1.name}: ${op1.startTime} - ${op1.endTime}`)
        console.warn(`   ${this.getOperationIcon(op2.name)} ${op2.name}: ${op2.startTime} - ${op2.endTime}`)
      })
    }

    console.log('─'.repeat(80))

    // Find duplicate concurrent operations
    const concurrent = this.operations.filter(op => op.status === 'pending')
    const duplicates = concurrent.reduce((acc, op) => {
      acc[op.name] = (acc[op.name] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const dupsWithCount = Object.entries(duplicates).filter(([, count]) => count > 1)

    if (dupsWithCount.length > 0) {
      console.warn('⚠️  Concurrent duplicate operations detected:')
      dupsWithCount.forEach(([name, count]) => {
        console.warn(`   ${this.getOperationIcon(name)} ${name}: ${count} concurrent calls`)
      })
    } else {
      console.log('✅ No concurrent duplicate operations!')
    }

    console.log('─'.repeat(80))
  }

  /**
   * Get performance summary
   */
  getSummary() {
    if (!this.enabled) return null

    const completed = this.operations.filter(op => op.status === 'complete')
    const errors = this.operations.filter(op => op.status === 'error')
    const pending = this.operations.filter(op => op.status === 'pending')

    const durations = completed.map(op => op.duration || 0)
    const avgDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0

    return {
      total: this.operations.length,
      completed: completed.length,
      errors: errors.length,
      pending: pending.length,
      avgDuration: Math.round(avgDuration),
      maxDuration,
      minDuration,
      successRate: completed.length > 0
        ? ((completed.length / (completed.length + errors.length)) * 100).toFixed(1) + '%'
        : 'N/A'
    }
  }

  /**
   * Clear operation history
   */
  clear() {
    this.operations = []
    console.log('[AuthDebugger] 🗑️  Operation history cleared')
  }

  /**
   * Get all operations (for external analysis)
   */
  getOperations(): readonly Operation[] {
    return [...this.operations]
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

/**
 * Singleton debugger instance
 */
export const authDebugger = new AuthDebugger()

// Auto-enable in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  authDebugger.enable()

  // Make available globally for console access
  ;(window as any).authDebugger = authDebugger
}

// Export type
export type { Operation }
