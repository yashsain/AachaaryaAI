/**
 * Error Boundary Component
 *
 * Catches React errors during rendering and shows fallback UI
 * Prevents white screen of death
 */

'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-red-200">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-neutral-800 mb-2 text-center">
              Something Went Wrong
            </h2>
            <p className="text-neutral-600 mb-6 text-center">
              An unexpected error occurred. Please refresh the page to try again.
            </p>

            {this.state.error && (
              <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                <details className="text-sm">
                  <summary className="cursor-pointer text-neutral-600 font-medium">
                    Error Details
                  </summary>
                  <div className="mt-2 space-y-1 text-neutral-500 font-mono text-xs">
                    <p>{this.state.error.message}</p>
                    {this.state.error.stack && (
                      <pre className="overflow-auto max-h-40 mt-2 p-2 bg-neutral-100 rounded">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              Refresh Page
            </button>

            <p className="text-xs text-neutral-500 mt-6 text-center">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
