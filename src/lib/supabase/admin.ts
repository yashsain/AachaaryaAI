/**
 * Supabase Admin Client
 *
 * Uses service role key to bypass RLS (Row Level Security).
 * ONLY use server-side for privileged operations.
 *
 * SECURITY WARNING:
 * - NEVER import this in client components
 * - NEVER expose service role key to browser
 * - ONLY use in API routes or server-side code
 * - Bypasses ALL RLS policies
 *
 * USAGE IN API ROUTES:
 * ```typescript
 * import { supabaseAdmin } from '@/lib/supabase/admin'
 *
 * export async function POST(request: Request) {
 *   // Verify request is authorized first!
 *   const { data } = await supabaseAdmin
 *     .from('teachers')
 *     .insert({ ... }) // Bypasses RLS
 *   return Response.json(data)
 * }
 * ```
 *
 * COMMON USE CASES:
 * - User invitation (inviteUserByEmail)
 * - Admin operations (create/update/delete any record)
 * - Bulk operations (bypassing RLS for performance)
 * - Migrations and seeding
 *
 * @see https://supabase.com/docs/guides/auth/auth-helpers/nextjs
 */

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL not found. Check .env.local file.')
}

if (!supabaseServiceKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will fail.')
}

/**
 * Admin client with service role key.
 *
 * Features:
 * - Bypasses RLS policies
 * - Full database access
 * - Can perform user management operations
 * - No session persistence needed
 *
 * IMPORTANT:
 * - Only use server-side
 * - Always verify authorization before using
 * - Never expose to client
 *
 * @example
 * ```typescript
 * import { supabaseAdmin } from '@/lib/supabase/admin'
 *
 * // Invite user (requires service role)
 * const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
 *   'user@example.com'
 * )
 *
 * // Bypass RLS for bulk operation
 * const { data } = await supabaseAdmin
 *   .from('teachers')
 *   .select('*') // Returns ALL teachers regardless of RLS
 * ```
 */
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      // No auto-refresh needed for service role
      autoRefreshToken: false,
      // No session persistence for admin client
      persistSession: false,
    },
  }
)

/**
 * Type guard to check if admin client is properly configured.
 *
 * Use this to verify service role key is available before
 * attempting admin operations.
 *
 * @returns true if admin client has service role key
 *
 * @example
 * ```typescript
 * import { supabaseAdmin, isAdminConfigured } from '@/lib/supabase/admin'
 *
 * if (!isAdminConfigured()) {
 *   throw new Error('Admin operations not available')
 * }
 * ```
 */
export function isAdminConfigured(): boolean {
  return !!supabaseServiceKey
}

/**
 * Safely execute admin operation with error handling.
 *
 * Wraps admin operations to ensure service role is configured
 * and provides better error messages.
 *
 * @param operation - Async function that uses supabaseAdmin
 * @returns Result of the operation
 * @throws Error if admin not configured or operation fails
 *
 * @example
 * ```typescript
 * import { withAdminClient } from '@/lib/supabase/admin'
 *
 * const users = await withAdminClient(async (admin) => {
 *   const { data, error } = await admin.auth.admin.listUsers()
 *   if (error) throw error
 *   return data.users
 * })
 * ```
 */
export async function withAdminClient<T>(
  operation: (admin: SupabaseClient) => Promise<T>
): Promise<T> {
  if (!isAdminConfigured()) {
    throw new Error(
      'Supabase admin client not configured. SUPABASE_SERVICE_ROLE_KEY missing.'
    )
  }

  try {
    return await operation(supabaseAdmin)
  } catch (error) {
    console.error('Admin operation failed:', error)
    throw error
  }
}
