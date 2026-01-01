/**
 * Supabase Browser Client (SSR-Compliant)
 *
 * Uses @supabase/ssr for proper cookie-based session storage.
 * This replaces the deprecated localStorage pattern.
 *
 * USAGE:
 * ```typescript
 * import { createBrowserClient } from '@/lib/supabase/client'
 *
 * function MyComponent() {
 *   const supabase = createBrowserClient()
 *   // Use supabase client...
 * }
 * ```
 *
 * WHY COOKIE-BASED:
 * - Prevents middleware/client session divergence
 * - Enables SSR with authenticated data
 * - Works seamlessly with Next.js middleware
 * - Automatic server/client sync
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

'use client'

import { createBrowserClient as createClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Check .env.local file.')
}

let client: SupabaseClient | null = null

/**
 * Create a Supabase client for browser environments.
 *
 * Returns singleton instance to prevent multiple subscriptions.
 * Session is stored in cookies (not localStorage) for SSR compatibility.
 *
 * Features:
 * - Cookie-based session storage
 * - Automatic token refresh
 * - PKCE flow support
 * - URL session detection (email confirmations, password resets)
 *
 * @returns Supabase client instance
 */
export function createBrowserClient(): SupabaseClient {
  if (client) {
    return client
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        // Read cookie from document.cookie
        if (typeof document === 'undefined') return undefined

        const cookies = document.cookie.split(';')
        const cookie = cookies.find(c => c.trim().startsWith(`${name}=`))
        return cookie?.split('=')[1]
      },
      set(name: string, value: string, options: any) {
        // Write cookie to document.cookie
        if (typeof document === 'undefined') return

        let cookieStr = `${name}=${value}`

        if (options?.maxAge) {
          cookieStr += `; max-age=${options.maxAge}`
        }
        if (options?.path) {
          cookieStr += `; path=${options.path}`
        }
        if (options?.domain) {
          cookieStr += `; domain=${options.domain}`
        }
        if (options?.sameSite) {
          cookieStr += `; samesite=${options.sameSite}`
        }
        if (options?.secure) {
          cookieStr += '; secure'
        }

        document.cookie = cookieStr
      },
      remove(name: string, options: any) {
        // Remove cookie by setting max-age=0
        if (typeof document === 'undefined') return

        let cookieStr = `${name}=; max-age=0`

        if (options?.path) {
          cookieStr += `; path=${options.path}`
        }
        if (options?.domain) {
          cookieStr += `; domain=${options.domain}`
        }

        document.cookie = cookieStr
      },
    },
  })

  return client
}

/**
 * Legacy export for backward compatibility.
 * Prefer using createBrowserClient() for clarity.
 */
export const supabase = createBrowserClient()
