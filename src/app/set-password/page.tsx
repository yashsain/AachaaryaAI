'use client'

/**
 * Modern Set Password Page (For Invitations)
 *
 * Dedicated page for new teachers to set their initial password
 * Features:
 * - Handles auth token from URL hash fragment (implicit flow)
 * - Clean, modern UI with animations
 * - Password strength indicators
 * - Show/hide password toggles
 * - Complex session establishment with fallback handling
 */

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, CheckCircle, Shield, Eye, EyeOff, UserPlus } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useSession } from '@/hooks/useSession'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Verifying invitation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-primary-500 to-primary-600 p-12 relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-700/30 rounded-full blur-3xl"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md text-white relative z-10"
        >
          <Image
            src="/logo.png"
            alt="aachaaryAI Logo"
            width={120}
            height={80}
            className="mb-8 drop-shadow-lg"
          />
          <h1 className="text-5xl font-bold mb-6">Welcome Aboard!</h1>
          <p className="text-xl mb-12 text-white/90">
            Your account has been created. Set up your password to start creating amazing test papers.
          </p>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {[
              {
                title: 'Secure Account',
                description: 'Create a strong password to protect your data',
              },
              {
                title: 'Easy Access',
                description: 'Use your credentials to log in anytime',
              },
              {
                title: 'Get Started',
                description: 'Start generating test papers in minutes',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <Shield className="h-6 w-6 text-white/90 shrink-0" />
                <div>
                  <p className="font-semibold text-lg">{feature.title}</p>
                  <p className="text-white/80">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {success ? (
              // Success State
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {/* Logo for mobile */}
                <div className="lg:hidden text-center mb-8">
                  <Image
                    src="/logo.png"
                    alt="aachaaryAI Logo"
                    width={80}
                    height={53}
                    className="mx-auto mb-4"
                  />
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                    aachaaryAI
                  </h1>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="h-8 w-8 text-success-600" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Welcome to aachaaryAI!</h2>
                    <p className="text-neutral-600 mb-6">
                      Your account is ready. Redirecting to dashboard...
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm text-primary-600">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-primary-600 border-r-transparent"></div>
                      <span>Taking you to your dashboard</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Form State
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Logo for mobile */}
                <div className="lg:hidden text-center mb-8">
                  <Image
                    src="/logo.png"
                    alt="aachaaryAI Logo"
                    width={80}
                    height={53}
                    className="mx-auto mb-4"
                  />
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                    aachaaryAI
                  </h1>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Welcome!</h2>
                    <p className="text-neutral-600">
                      Your account has been created. Please set a secure password to continue.
                    </p>
                  </div>

                  <form onSubmit={handleSetPassword} className="space-y-6">
                    {/* New Password Input */}
                    <div className="relative">
                      <Input
                        id="newPassword"
                        label="Create Password"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        autoFocus
                        leftIcon={<Lock className="h-5 w-5" />}
                        helperText="Must be at least 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        leftIcon={<Lock className="h-5 w-5" />}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-neutral-700 mb-3">Password Requirements:</p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <div className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center',
                            newPassword.length >= 8
                              ? 'bg-success-100 text-success-600'
                              : 'bg-neutral-200 text-neutral-400'
                          )}>
                            <CheckCircle className="h-3 w-3" />
                          </div>
                          <span className={cn(
                            'transition-colors',
                            newPassword.length >= 8
                              ? 'text-success-700'
                              : 'text-neutral-600'
                          )}>
                            At least 8 characters
                          </span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <div className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center',
                            newPassword === confirmPassword && newPassword.length > 0
                              ? 'bg-success-100 text-success-600'
                              : 'bg-neutral-200 text-neutral-400'
                          )}>
                            <CheckCircle className="h-3 w-3" />
                          </div>
                          <span className={cn(
                            'transition-colors',
                            newPassword === confirmPassword && newPassword.length > 0
                              ? 'text-success-700'
                              : 'text-neutral-600'
                          )}>
                            Passwords match
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-error-50 border border-error-200 rounded-lg p-3"
                      >
                        <p className="text-error-700 text-sm">{error}</p>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loading}
                      className="w-full"
                    >
                      Set Password & Continue
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-sm text-neutral-500 mt-6">
            Trusted by educational institutions for RPSC, RAS, Rajasthan Police & more
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  )
}
