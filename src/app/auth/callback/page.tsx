'use client'

/**
 * Auth Callback Client Page
 *
 * Handles invitation tokens from URL hash fragments.
 * Hash fragments are only available on the client side, so we need
 * a client component to extract and handle them.
 */

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const type = searchParams?.get('type')
      const errorParam = searchParams?.get('error')
      const errorDescription = searchParams?.get('error_description')

      console.log('[Auth Callback Client] Handling callback:', {
        type,
        hasError: !!errorParam,
        error: errorParam,
        errorDescription,
        hash: window.location.hash
      })

      // Handle errors from Supabase
      if (errorParam) {
        console.error('[Auth Callback Client] Error from Supabase:', errorParam, errorDescription)
        router.push(`/login?error=${encodeURIComponent(errorDescription || errorParam)}`)
        return
      }

      // Check if there's a hash fragment (invitation token)
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        console.log('[Auth Callback Client] Found access token in hash, waiting for Supabase to process...')

        // For invitations, redirect to set-password
        // Use window.location.href to preserve the hash fragment
        if (type === 'invite') {
          console.log('[Auth Callback Client] Invitation detected, redirecting to set-password')
          window.location.href = `/set-password?invite=true${hash}`
          return
        }

        // For other flows (password reset), redirect to reset-password
        console.log('[Auth Callback Client] Password reset detected, redirecting to reset-password')
        window.location.href = `/reset-password${hash}`
        return
      }

      // No hash fragment - might be PKCE flow with code parameter
      const code = searchParams?.get('code')
      if (code) {
        console.log('[Auth Callback Client] PKCE code found, exchanging for session...')

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('[Auth Callback Client] Error exchanging code:', exchangeError)
          router.push(`/login?error=${encodeURIComponent('Failed to verify email link')}`)
          return
        }

        console.log('[Auth Callback Client] PKCE exchange successful, redirecting to dashboard')
        router.push('/dashboard')
        return
      }

      // No hash, no code - redirect to login
      console.log('[Auth Callback Client] No auth data found, redirecting to login')
      router.push('/login')
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {error ? error : 'Processing invitation...'}
        </p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
