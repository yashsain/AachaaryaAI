'use client'

/**
 * Modern Forgot Password Page
 *
 * Allows teachers to request a password reset email
 * Features:
 * - Clean, modern UI with animations
 * - Success state with visual feedback
 * - Redirects to dashboard if user is already authenticated
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useSession } from '@/hooks/useSession'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const { user, loading: authLoading } = useSession()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      console.log('[ForgotPasswordPage] User already authenticated, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [authLoading, user, router])

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch (err) {
      console.error('Reset request error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render form if user is authenticated (redirect will happen)
  if (user) {
    return null
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
          <h1 className="text-5xl font-bold mb-6">Password Reset</h1>
          <p className="text-xl mb-12 text-white/90">
            Don't worry! It happens to the best of us. We'll help you get back on track.
          </p>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {[
              {
                title: 'Secure Process',
                description: 'Password reset link expires in 1 hour for your security',
              },
              {
                title: 'Email Verification',
                description: 'We will send instructions to your registered email address',
              },
              {
                title: 'Quick Recovery',
                description: 'Get back to creating test papers in minutes',
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
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Check Your Email</h2>
                    <p className="text-neutral-600 mb-6">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-primary-700">
                        The link will expire in 1 hour. If you don't see the email, check your spam folder.
                      </p>
                    </div>
                    <Link
                      href="/login"
                      className="inline-block w-full"
                    >
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                      >
                        Back to Login
                      </Button>
                    </Link>
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
                      <KeyRound className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Forgot Password?</h2>
                    <p className="text-neutral-600">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  <form onSubmit={handleResetRequest} className="space-y-6">
                    {/* Email Input */}
                    <Input
                      id="email"
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@institute.com"
                      required
                      disabled={loading}
                      autoFocus
                      leftIcon={<Mail className="h-5 w-5" />}
                    />

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
                      Send Reset Link
                    </Button>
                  </form>

                  {/* Back to Login */}
                  <div className="mt-6 text-center">
                    <Link
                      href="/login"
                      className={cn(
                        'inline-flex items-center gap-2 text-sm font-medium transition-colors',
                        'text-primary-600 hover:text-primary-700'
                      )}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Login
                    </Link>
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
