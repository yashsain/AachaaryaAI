'use client'

/**
 * Modern Reset Password Page
 *
 * Allows teachers to set a new password after clicking reset link
 * Features:
 * - Clean, modern UI with animations
 * - Password validation and matching
 * - Handles both password reset and invitation flows
 * - Auto-redirect to dashboard on success
 */

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ArrowLeft, CheckCircle, Shield, Eye, EyeOff } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

function ResetPasswordContent() {
  const supabase = createBrowserClient()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isInvite, setIsInvite] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if this is an invitation flow
    const invite = searchParams?.get('invite')
    setIsInvite(invite === 'true')
  }, [searchParams])

  async function handlePasswordReset(e: React.FormEvent) {
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
      console.error('Password reset error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
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
          <h1 className="text-5xl font-bold mb-6">
            {isInvite ? 'Welcome Aboard!' : 'New Password'}
          </h1>
          <p className="text-xl mb-12 text-white/90">
            {isInvite
              ? 'Set up your account to start creating amazing test papers.'
              : 'Choose a strong password to keep your account secure.'}
          </p>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {[
              {
                title: 'Strong & Secure',
                description: 'Use at least 8 characters for maximum security',
              },
              {
                title: 'Easy to Remember',
                description: 'Choose something memorable but hard to guess',
              },
              {
                title: 'Protected Account',
                description: 'Your data is encrypted and secure',
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
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Password Updated!</h2>
                    <p className="text-neutral-600 mb-6">
                      Your password has been successfully updated. Redirecting to dashboard...
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
                      <Lock className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                      {isInvite ? 'Set Your Password' : 'Reset Password'}
                    </h2>
                    <p className="text-neutral-600">
                      {isInvite
                        ? 'Welcome! Please set a secure password for your account.'
                        : 'Enter your new password below.'}
                    </p>
                  </div>

                  <form onSubmit={handlePasswordReset} className="space-y-6">
                    {/* New Password Input */}
                    <div className="relative">
                      <Input
                        id="newPassword"
                        label="New Password"
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
                      {isInvite ? 'Set Password & Continue' : 'Reset Password'}
                    </Button>
                  </form>

                  {/* Back to Login */}
                  {!isInvite && (
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
                  )}
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

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  )
}
