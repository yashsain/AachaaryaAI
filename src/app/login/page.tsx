'use client'

/**
 * Modern Login Page - Institute Code Based Authentication
 *
 * Two-step flow with real Supabase Auth:
 * 1. Enter Institute Code → Fetch institute from database
 * 2. Show Institute Branding + Email/Password Login → Authenticate with Supabase
 *
 * Auto-redirects authenticated users to dashboard
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, ArrowLeft, CheckCircle } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useSession } from '@/hooks/useSession'
import type { Institute } from '@/types/database'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const { user, teacher, loading: authLoading, teacherLoading } = useSession()

  // Check for invitation token in URL hash (in case Site URL is set to /login)
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token') && hash.includes('type=invite')) {
      console.log('[LoginPage] Detected invitation token, redirecting to set-password')
      window.location.href = `/set-password?invite=true${hash}`
    }
  }, [])

  // Redirect authenticated users to dashboard
  // FIX: Wait for COMPLETE auth data (session + teacher + institute) before redirecting
  // Prevents "Missing data" errors on dashboard from premature navigation
  useEffect(() => {
    if (!authLoading && !teacherLoading && user && teacher) {
      console.log('[LoginPage] Auth complete (user + teacher loaded), redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [authLoading, teacherLoading, user, teacher, router])

  // Flow control
  const [step, setStep] = useState<'code' | 'login'>('code')
  const [institute, setInstitute] = useState<Institute | null>(null)

  // Form state - Step 1
  const [instituteCode, setInstituteCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)

  // Form state - Step 2
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Step 1: Validate Institute Code
  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCodeError('')
    setCodeLoading(true)

    try {
      // Fetch institute from database by code
      const { data: instituteData, error: instituteError } = await supabase
        .from('institutes')
        .select('*')
        .eq('code', instituteCode.toUpperCase().trim())
        .single()

      if (instituteError || !instituteData) {
        setCodeError('Invalid institute code. Please check and try again.')
        setCodeLoading(false)
        return
      }

      // Success - move to login step
      setInstitute(instituteData as Institute)
      setStep('login')
      setCodeLoading(false)
    } catch (error) {
      console.error('Error fetching institute:', error)
      setCodeError('An error occurred. Please try again.')
      setCodeLoading(false)
    }
  }

  // Step 2: Handle Login with Supabase Auth
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    if (!institute) {
      setLoginError('Institute information missing. Please go back and re-enter code.')
      setLoginLoading(false)
      return
    }

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (authError) {
        // Provide helpful error message without revealing security details
        setLoginError('Invalid email or password. If your account was removed or deactivated, please contact your administrator.')
        setLoginLoading(false)
        return
      }

      if (!authData.user) {
        setLoginError('Authentication failed. Please try again.')
        setLoginLoading(false)
        return
      }

      // Fetch teacher record to verify they belong to this institute
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('institute_id, role')
        .eq('id', authData.user.id)
        .is('deleted_at', null)
        .single()

      if (teacherError || !teacherData) {
        // Sign out the user since they're not a valid teacher
        await supabase.auth.signOut()
        setLoginError('Your account has been deactivated or removed. Please contact your administrator for assistance.')
        setLoginLoading(false)
        return
      }

      // CRITICAL: Verify teacher belongs to the institute code they entered
      if (teacherData.institute_id !== institute.id) {
        // Sign out the user since they don't belong to this institute
        await supabase.auth.signOut()
        setLoginError(
          `Your account does not belong to ${institute.name}. Please check the institute code.`
        )
        setLoginLoading(false)
        return
      }

      // Success! User is authenticated and belongs to the correct institute
      // Redirect to dashboard (AuthContext will handle session)
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setLoginError('An unexpected error occurred. Please try again.')
      setLoginLoading(false)
    }
  }

  // Back to code entry
  function handleBack() {
    setStep('code')
    setInstitute(null)
    setEmail('')
    setPassword('')
    setLoginError('')
  }

  // Show loading state while checking authentication
  // Prevents flash of login form before redirect
  // FIX: Also check teacherLoading to prevent flash during teacher data fetch
  if (authLoading || (user && teacherLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render login form if user is authenticated (redirect will happen)
  if (user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-linear-to-br from-primary-500 to-primary-600 p-12 relative overflow-hidden">
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
          <h1 className="text-5xl font-bold mb-6">aachaaryAI</h1>
          <p className="text-xl mb-12 text-white/90">
            Your AI Teaching Assistant for Test Paper Generation
          </p>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {[
              {
                title: 'Institute-Specific Platform',
                description: 'Each coaching institute gets their own branded experience',
              },
              {
                title: 'Generate in Minutes',
                description: 'Create professional test papers in <30 minutes',
              },
              {
                title: 'Multi-Format Support',
                description: 'MCQ, Integer, Matrix Match, Assertion-Reason & more',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="h-6 w-6 text-white/90 shrink-0" />
                <div>
                  <p className="font-semibold text-lg">{feature.title}</p>
                  <p className="text-white/80">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* Step 1: Institute Code Entry */}
            {step === 'code' && (
              <motion.div
                key="code-step"
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
                  <h1 className="text-3xl font-bold bg-linear-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                    aachaaryAI
                  </h1>
                </div>

                {/* Institute Code Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Building2 className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Welcome</h2>
                    <p className="text-neutral-600">Enter your institute code to continue</p>
                  </div>

                  <form onSubmit={handleCodeSubmit} className="space-y-6">
                    {/* Institute Code Input */}
                    <Input
                      id="instituteCode"
                      label="Institute Code"
                      type="text"
                      value={instituteCode}
                      onChange={(e) => setInstituteCode(e.target.value.toUpperCase())}
                      placeholder="e.g., ALLEN, DEMO"
                      required
                      disabled={codeLoading}
                      className="uppercase"
                      autoFocus
                    />

                    {/* Error Message */}
                    {codeError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-error-50 border border-error-200 rounded-lg p-3"
                      >
                        <p className="text-error-700 text-sm">{codeError}</p>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={codeLoading}
                      className="w-full"
                    >
                      Continue
                    </Button>
                  </form>

                  {/* Help Text */}
                  <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
                    <p className="text-sm text-neutral-600">
                      Don't know your institute code?{' '}
                      <span className="text-primary-600 font-medium">Contact your admin</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Institute Branded Login */}
            {step === 'login' && institute && (
              <motion.div
                key="login-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Institute Header */}
                <div className="text-center mb-6">
                  <Image
                    src={institute.logo_url || '/logo.png'}
                    alt={`${institute.name} Logo`}
                    width={100}
                    height={67}
                    className="mx-auto mb-4 rounded-lg"
                  />
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{ color: institute.primary_color }}
                  >
                    {institute.name}
                  </h1>
                  {institute.tagline && (
                    <p className="text-neutral-600 text-sm">{institute.tagline}</p>
                  )}
                  {institute.city && (
                    <p className="text-neutral-500 text-xs mt-1">{institute.city}</p>
                  )}
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">Sign In</h2>
                  <p className="text-neutral-600 mb-8">Access your account to continue</p>

                  <form onSubmit={handleLogin} className="space-y-6">
                    {/* Email Input */}
                    <Input
                      id="email"
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@institute.com"
                      required
                      disabled={loginLoading}
                      autoFocus
                    />

                    {/* Password Input */}
                    <Input
                      id="password"
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loginLoading}
                    />

                    {/* Error Message */}
                    {loginError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-error-50 border border-error-200 rounded-lg p-3"
                      >
                        <p className="text-error-700 text-sm">{loginError}</p>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loginLoading}
                      className="w-full"
                      style={{
                        background: `linear-gradient(to right, ${institute.primary_color}, ${institute.primary_color}dd)`,
                      }}
                    >
                      Sign In
                    </Button>
                  </form>

                  {/* Back Button */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleBack}
                      disabled={loginLoading}
                      className={cn(
                        'inline-flex items-center gap-2 text-sm font-medium transition-colors',
                        'text-primary-600 hover:text-primary-700',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Change Institute
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-sm text-neutral-500 mt-6">
            Trusted by coaching institutes for NEET, JEE, Banking & more
          </p>
        </div>
      </div>
    </div>
  )
}
