/**
 * Supabase Server Client (SSR-Compliant)
 *
 * Utilities for creating Supabase clients in server contexts:
 * - API Route Handlers
 * - Server Components
 * - Server Actions
 *
 * USAGE IN API ROUTES:
 * ```typescript
 * import { cookies } from 'next/headers'
 * import { createServerClient } from '@/lib/supabase/server'
 *
 * export async function GET(request: Request) {
 *   const supabase = createServerClient(cookies())
 *   const { data } = await supabase.from('teachers').select()
 *   return Response.json(data)
 * }
 * ```
 *
 * USAGE IN SERVER COMPONENTS:
 * ```typescript
 * import { cookies } from 'next/headers'
 * import { createServerClient } from '@/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = createServerClient(cookies())
 *   const { data } = await supabase.from('teachers').select()
 *   return <div>...</div>
 * }
 * ```
 *
 * WHY SEPARATE SERVER CLIENT:
 * - Reads session from request cookies (not client localStorage)
 * - Enables server-side authentication checks
 * - Required for RSC (React Server Components)
 * - Prevents cookie/localStorage divergence
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient as createClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { cookies as CookiesType } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Check .env.local file.')
}

/**
 * Create a Supabase client for server environments.
 *
 * IMPORTANT: Must be called with awaited Next.js cookies() instance.
 * Session is read from request cookies.
 *
 * Features:
 * - Cookie-based session reading
 * - Server-side authentication
 * - RSC compatible
 * - Respects RLS policies
 *
 * @param cookieStore - Awaited Next.js cookies() instance from next/headers
 * @returns Supabase client instance for server context
 *
 * @example
 * ```typescript
 * import { cookies } from 'next/headers'
 * import { createServerClient } from '@/lib/supabase/server'
 *
 * const supabase = createServerClient(await cookies())
 * const { data: { session } } = await supabase.auth.getSession()
 * ```
 */
export function createServerClient(
  cookieStore: Awaited<ReturnType<typeof CookiesType>>
): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Handle cookies.set() errors in Server Components
          // This can happen when trying to set cookies in RSC
          // The error is safe to ignore in read-only contexts
          console.warn(`Failed to set cookie "${name}":`, error)
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 })
        } catch (error) {
          // Handle cookies.set() errors in Server Components
          console.warn(`Failed to remove cookie "${name}":`, error)
        }
      },
    },
  })
}

/**
 * Get authenticated user from server context.
 *
 * Convenience helper for common pattern of getting current user.
 * Returns null if not authenticated.
 *
 * @param cookieStore - Awaited Next.js cookies() instance
 * @returns User object or null
 *
 * @example
 * ```typescript
 * import { cookies } from 'next/headers'
 * import { getServerUser } from '@/lib/supabase/server'
 *
 * const user = await getServerUser(await cookies())
 * if (!user) {
 *   redirect('/login')
 * }
 * ```
 */
export async function getServerUser(
  cookieStore: Awaited<ReturnType<typeof CookiesType>>
) {
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get authenticated session from server context.
 *
 * Convenience helper for getting current session.
 * Returns null if not authenticated.
 *
 * @param cookieStore - Awaited Next.js cookies() instance
 * @returns Session object or null
 *
 * @example
 * ```typescript
 * import { cookies } from 'next/headers'
 * import { getServerSession } from '@/lib/supabase/server'
 *
 * const session = await getServerSession(await cookies())
 * if (!session) {
 *   redirect('/login')
 * }
 * ```
 */
export async function getServerSession(
  cookieStore: Awaited<ReturnType<typeof CookiesType>>
) {
  const supabase = createServerClient(cookieStore)
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}
