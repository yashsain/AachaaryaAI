import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Check .env.local file.')
}

// Regular client for frontend operations (respects RLS)
// Configured with proper session persistence and auto-refresh
// Note: While PKCE flow is used for normal auth, inviteUserByEmail() generates
// implicit flow tokens (hash fragments). These are handled by manually calling
// setSession() which is flow-agnostic and works with tokens from any source.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable automatic token refresh before expiry
    autoRefreshToken: true,

    // Persist session in browser localStorage
    persistSession: true,

    // Detect session from URL (for email confirmations, password resets)
    // Note: This only auto-detects PKCE codes (?code=), not implicit tokens (#access_token=)
    // Invitation tokens must be extracted manually and passed to setSession()
    detectSessionInUrl: true,

    // Use localStorage for session storage (survives tab close/refresh)
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,

    // Flow type for authentication
    flowType: 'pkce'
  }
})

// Admin client for backend operations (bypasses RLS)
// Only use server-side where service key is available
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase // Fallback to regular client

// Database types are defined in src/types/database.ts
