'use client'

/**
 * Reset Password Page
 *
 * Allows teachers to set a new password after clicking reset link
 * Also handles password updates from invitation emails
 */

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">Password Updated!</h2>
              <p className="text-neutral-600 mb-6">
                Your password has been successfully updated. Redirecting to dashboard...
              </p>
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-brand-saffron border-r-transparent"></div>
            </div>
          ) : (
            // Form State
            <>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                {isInvite ? 'Set Your Password' : 'Reset Password'}
              </h2>
              <p className="text-neutral-600 mb-8">
                {isInvite
                  ? 'Welcome! Please set a secure password for your account.'
                  : 'Enter your new password below.'}
              </p>

              <form onSubmit={handlePasswordReset} className="space-y-6">
                {/* New Password Input */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    New Password
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
                      Updating...
                    </span>
                  ) : isInvite ? (
                    'Set Password & Continue'
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              {/* Back to Login */}
              {!isInvite && (
                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="text-sm text-brand-blue hover:text-brand-blue-dark font-medium transition-colors"
                  >
                    ← Back to Login
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
