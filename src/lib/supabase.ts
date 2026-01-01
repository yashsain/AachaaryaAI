/**
 * DEPRECATED: This file is deprecated in favor of SSR-compliant clients.
 *
 * Migration Guide:
 * ==============
 *
 * BROWSER/CLIENT COMPONENTS:
 * OLD: import { supabase } from '@/lib/supabase'
 * NEW: import { createBrowserClient } from '@/lib/supabase/client'
 *      const supabase = createBrowserClient()
 *
 * API ROUTES / SERVER COMPONENTS:
 * OLD: import { supabase } from '@/lib/supabase'
 * NEW: import { cookies } from 'next/headers'
 *      import { createServerClient } from '@/lib/supabase/server'
 *      const supabase = createServerClient(cookies())
 *
 * ADMIN OPERATIONS:
 * OLD: import { supabaseAdmin } from '@/lib/supabase'
 * NEW: import { supabaseAdmin } from '@/lib/supabase/admin'
 *
 * WHY MIGRATE:
 * - Cookie-based session storage (prevents middleware/client divergence)
 * - Proper SSR support (enables authenticated server components)
 * - Eliminates 45s RLS hangs (better session sync)
 * - Follows official Supabase SSR pattern
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 * @deprecated Use @/lib/supabase/client or @/lib/supabase/server instead
 */

// Re-export new SSR-compliant clients for backward compatibility
// This prevents breaking existing imports during migration
export { supabase, createBrowserClient } from './supabase/client'
export { createServerClient, getServerUser, getServerSession } from './supabase/server'
export { supabaseAdmin, isAdminConfigured, withAdminClient } from './supabase/admin'

// Legacy deprecated exports (will be removed after migration complete)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Check .env.local file.')
}

/**
 * @deprecated Use createBrowserClient() from '@/lib/supabase/client' instead
 */
export const legacySupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce'
  }
})

/**
 * @deprecated Use supabaseAdmin from '@/lib/supabase/admin' instead
 */
export const legacySupabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : legacySupabase

// Database types are defined in src/types/database.ts
