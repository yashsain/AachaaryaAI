'use client'

/**
 * Forgot Password Page
 *
 * Allows teachers to request a password reset email
 * Redirects to dashboard if user is already authenticated
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render form if user is authenticated (redirect will happen)
  if (user) {
    return null
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
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">Check Your Email</h2>
              <p className="text-neutral-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-neutral-500 mb-6">
                The link will expire in 1 hour. If you don't see the email, check your spam folder.
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3 px-4 bg-gradient-to-r from-brand-saffron to-brand-saffron-dark text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-center"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            // Form State
            <>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">Forgot Password?</h2>
              <p className="text-neutral-600 mb-8">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleResetRequest} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@institute.com"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-brand-saffron focus:ring-2 focus:ring-brand-saffron/20 outline-none transition-all"
                  />
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
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-brand-blue hover:text-brand-blue-dark font-medium transition-colors"
                >
                  ← Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
