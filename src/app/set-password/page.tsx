'use client'

/**
 * Set Password Page (For Invitations)
 *
 * Dedicated page for new teachers to set their initial password
 * Handles auth token from URL hash fragment (implicit flow)
 */

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { useSession } from '@/hooks/useSession'
import Image from 'next/image'

// Create Supabase client
const supabase = createBrowserClient()

/**
 * Parse tokens from URL hash fragment
 * Hash format: #access_token=...&refresh_token=...&expires_at=...&token_type=bearer
 */
function parseHashFragment(hash: string): { access_token?: string; refresh_token?: string } | null {
  if (!hash || !hash.startsWith('#')) {
    return null
  }

  const params = new URLSearchParams(hash.substring(1))
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')

  if (!access_token || !refresh_token) {
    return null
  }

  return { access_token, refresh_token }
}

function SetPasswordContent() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useSession()

  // Handle auth session from URL hash (for invitation emails)
  useEffect(() => {
    const handleSession = async () => {
      const invite = searchParams?.get('invite')

      console.log('[SetPassword] Handling session, invite:', invite)

      // For invitation flow, extract and process tokens from hash manually
      // Why: PKCE client auto-detection only handles ?code= parameters
      // inviteUserByEmail() generates implicit flow tokens in hash fragments (#access_token=)
      // Solution: Extract tokens manually and call setSession() (which is flow-agnostic)
      if (invite === 'true') {
        const hash = window.location.hash
        console.log('[SetPassword] Hash fragment:', hash ? 'present' : 'absent')

        if (!hash) {
          console.log('[SetPassword] No hash fragment - checking for existing session (fallback for config issues)')

          // Fallback: Check if a valid session already exists
          // This handles cases where:
          // 1. Session persisted in localStorage from previous attempt
          // 2. Supabase Site URL misconfiguration caused hash loss but session was established
          const { data: { session: existingSession }, error: sessionCheckError } = await supabase.auth.getSession()

          if (sessionCheckError) {
            console.error('[SetPassword] Error checking for existing session:', sessionCheckError)
            setError('Invalid invitation link. Please contact your admin.')
            setSessionReady(true)
            return
          }

          if (existingSession) {
            console.log('[SetPassword] Found existing session, proceeding with password setup')
            // Refresh session to ensure JWT has custom claims
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

            if (refreshError || !refreshData.session) {
              console.error('[SetPassword] Error refreshing existing session:', refreshError)
              setError('Session expired. Please request a new invitation link.')
              setSessionReady(true)
              return
            }

            console.log('[SetPassword] Existing session refreshed successfully')
            setSessionReady(true)
            setError('')
            return
          }

          // No hash and no existing session - truly invalid link
          console.error('[SetPassword] No hash fragment and no existing session found for invitation')
          setError('Invalid invitation link. Please contact your admin.')
          setSessionReady(true)
          return
        }

        // Parse tokens from hash
        const tokens = parseHashFragment(hash)
        console.log('[SetPassword] Parsed tokens:', tokens ? 'success' : 'failed')

        if (!tokens) {
          console.error('[SetPassword] Failed to parse tokens from hash')
          setError('Invalid invitation link format. Please contact your admin.')
          setSessionReady(true)
          return
        }

        try {
          // Set session using tokens from invitation link
          // StateManager will handle JWT claims waiting and teacher fetch automatically
          console.log('[SetPassword] Setting session with tokens from hash...')
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: tokens.access_token!,
            refresh_token: tokens.refresh_token!
          })

          console.log('[SetPassword] setSession completed', { hasError: !!sessionError, hasSession: !!data?.session })

          if (sessionError) {
            console.error('[SetPassword] Error setting session:', sessionError)
            setError('Invalid or expired invitation link. Please contact your admin.')
            setSessionReady(true)
            return
          }

          if (!data.session) {
            console.error('[SetPassword] No session returned after setSession')
            setError('Failed to establish session. Please contact your admin.')
            setSessionReady(true)
            return
          }

          console.log('[SetPassword] Session established successfully:', data.session.user.email)

          // Session established! StateManager will automatically:
          // 1. Receive SIGNED_IN event from onAuthStateChange
          // 2. Queue teacher fetch for async processing
          // 3. Wait for JWT claims via ensureJWTReady()
          // 4. Fetch teacher without RLS hang
          // No manual refresh needed - event queue prevents deadlock!

          setSessionReady(true)
          setError('')

          // Clear hash from URL for cleaner UX
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        } catch (err) {
          console.error('[SetPassword] Unexpected error setting session:', err)
          setError('An unexpected error occurred. Please contact your admin.')
          setSessionReady(true)
        }
      } else {
        // For non-invitation flows (password reset), check if session already exists
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          console.log('[SetPassword] Existing session found for password reset')
          setSessionReady(true)
          setError('')
        } else {
          console.log('[SetPassword] No session found for password reset')
          // Don't set error yet, might be loading
          setSessionReady(true)
        }
      }
    }

    handleSession()
  }, [searchParams])

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Update user password using the main PKCE client
      // The session was already established via setSession() which is flow-agnostic
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      console.error('Set password error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  // Show loading state while establishing session
  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="aachaaryAI Logo"
            width={80}
            height={53}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-saffron to-brand-blue bg-clip-text text-transparent">
            aachaaryAI
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-neutral-100">
          {success ? (
            // Success State
            <div className="text-center">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">Welcome to aachaaryAI!</h2>
              <p className="text-neutral-600 mb-6">
                Your account is ready. Redirecting to dashboard...
              </p>
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-brand-saffron border-r-transparent"></div>
            </div>
          ) : (
            // Form State
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-saffron to-brand-blue rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔐</span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">Welcome!</h2>
                <p className="text-neutral-600">
                  Your account has been created. Please set a secure password to continue.
                </p>
              </div>

              <form onSubmit={handleSetPassword} className="space-y-6">
                {/* New Password Input */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Create Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-brand-saffron focus:ring-2 focus:ring-brand-saffron/20 outline-none transition-all"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Must be at least 8 characters</p>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-brand-saffron focus:ring-2 focus:ring-brand-saffron/20 outline-none transition-all"
                  />
                </div>

                {/* Password Requirements */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-neutral-700 mb-2">Password Requirements:</p>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className={newPassword.length >= 8 ? 'text-success' : 'text-neutral-400'}>
                        ✓
                      </span>
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className={
                          newPassword === confirmPassword && newPassword.length > 0
                            ? 'text-success'
                            : 'text-neutral-400'
                        }
                      >
                        ✓
                      </span>
                      Passwords match
                    </li>
                  </ul>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-danger/10 border border-danger/30 rounded-lg p-3">
                    <p className="text-danger text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-brand-saffron to-brand-saffron-dark text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                      Creating Account...
                    </span>
                  ) : (
                    'Set Password & Continue'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SetPasswordContent />
    </Suspense>
  )
}
