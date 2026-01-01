'use client'

import React, { Component, ReactNode } from 'react'
import { AuthError, AuthErrorCode } from '@/lib/auth/types'

interface Props {
  children: ReactNode
  fallback?: (error: AuthError, retry: () => void) => ReactNode
}

interface State {
  hasError: boolean
  error: AuthError | null
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is an auth-related error
    const isAuthError = error.message?.includes('session') ||
                       error.message?.includes('auth') ||
                       error.message?.includes('token')

    if (isAuthError) {
      return {
        hasError: true,
        error: {
          code: AuthErrorCode.SESSION_FETCH_FAILED,
          message: error.message,
          recoverable: true,
          timestamp: new Date(),
          correlationId: `${Date.now()}`,
          originalError: error,
        }
      }
    }

    // Not an auth error, re-throw
    throw error
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    console.error('[AuthErrorBoundary] Auth error caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })

    // TODO: Send to Sentry/DataDog
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
    // Trigger re-render, which will retry the failed component
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry)
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Authentication Error</h2>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {this.state.error.message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={this.retry}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Sign In
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-gray-500">Debug Info</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {JSON.stringify(this.state.error, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
