/**
 * Auth Error Banner Component
 *
 * Displays authentication errors with recovery actions.
 * Used across all pages that depend on auth state.
 */

'use client'

import { AuthError } from '@/lib/auth/types'

interface AuthErrorBannerProps {
  error: AuthError
  onRetry?: () => void
  onDismiss?: () => void
  onSignOut?: () => void
}

export function AuthErrorBanner({ error, onRetry, onDismiss, onSignOut }: AuthErrorBannerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50 p-4">
      <div className="max-w-md w-full">
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-200">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h2 className="text-2xl font-bold text-neutral-800 mb-2 text-center">
            {error.recoverable ? 'Connection Issue' : 'Unable to Continue'}
          </h2>
          <p className="text-neutral-600 mb-6 text-center">{error.message}</p>

          {/* Error Details (for debugging) */}
          <div className="bg-neutral-50 rounded-lg p-4 mb-6">
            <details className="text-sm">
              <summary className="cursor-pointer text-neutral-600 font-medium">
                Technical Details
              </summary>
              <div className="mt-2 space-y-1 text-neutral-500">
                <p>
                  <span className="font-medium">Error Code:</span> {error.code}
                </p>
                <p>
                  <span className="font-medium">Correlation ID:</span> {error.correlationId}
                </p>
                <p>
                  <span className="font-medium">Time:</span> {error.timestamp.toLocaleString()}
                </p>
                {error.originalError && (
                  <p>
                    <span className="font-medium">Original Error:</span>{' '}
                    {error.originalError.message}
                  </p>
                )}
              </div>
            </details>
          </div>

          {/* Recovery Actions */}
          <div className="space-y-3">
            {/* Primary action (usually retry if recoverable) */}
            {error.recoverable && onRetry && (
              <button
                onClick={onRetry}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                Try Again
              </button>
            )}

            {/* Secondary actions */}
            <div className="flex gap-3">
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="flex-1 py-2 px-4 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Dismiss
                </button>
              )}
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="flex-1 py-2 px-4 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>

          {/* Help Text */}
          <p className="text-xs text-neutral-500 mt-6 text-center">
            If this problem persists, please contact your administrator with the correlation ID
            above.
          </p>
        </div>
      </div>
    </div>
  )
}
