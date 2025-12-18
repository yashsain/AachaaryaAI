/**
 * Server-Side Logging API
 *
 * Receives logs from client-side and outputs them to the terminal
 * This allows viewing client-side auth logs in npm run dev terminal
 */

import { NextRequest, NextResponse } from 'next/server'

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
}

interface LogEntry {
  level: 'log' | 'info' | 'warn' | 'error'
  prefix: string
  message: string
  data?: any
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LogEntry = await request.json()
    const { level, prefix, message, data, timestamp } = body

    // Format timestamp
    const time = new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })

    // Color based on level
    let levelColor = colors.cyan
    let levelIcon = '●'

    if (level === 'error') {
      levelColor = colors.red
      levelIcon = '✖'
    } else if (level === 'warn') {
      levelColor = colors.yellow
      levelIcon = '⚠'
    } else if (level === 'info') {
      levelColor = colors.blue
      levelIcon = 'ℹ'
    } else {
      levelColor = colors.green
      levelIcon = '●'
    }

    // Build log message
    const timeStr = `${colors.dim}${time}${colors.reset}`
    const levelStr = `${levelColor}${levelIcon}${colors.reset}`
    const prefixStr = `${colors.cyan}${prefix}${colors.reset}`
    const messageStr = `${colors.white}${message}${colors.reset}`

    // Output to terminal
    console.log(`${timeStr} ${levelStr} ${prefixStr} ${messageStr}`)

    // If there's additional data, output it
    if (data) {
      console.log(`${colors.dim}   ↳${colors.reset}`, data)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[LogAPI] Error processing log:', error)
    return NextResponse.json({ success: false, error: 'Failed to process log' }, { status: 500 })
  }
}
