'use client'

/**
 * Stream Picker Page - Test Papers
 *
 * First step in test paper creation workflow
 * Shows list of streams for user to select
 * Streams are filtered by institute via institute_streams table
 */

import { useRequireSession } from '@/hooks/useSession'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'

interface Stream {
  id: string
  name: string
  created_at: string
}

export default function TestPapersStreamPickerPage() {
  const { session, teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireSession()
  const router = useRouter()
  const [streams, setStreams] = useState<Stream[]>([])
  const [loadingStreams, setLoadingStreams] = useState(true)
  const [streamsError, setStreamsError] = useState<string | null>(null)

  useEffect(() => {
    if (teacher && !loading && !teacherLoading) {
      fetchStreams()
    }
  }, [teacher, loading, teacherLoading])

  const fetchStreams = async () => {
    try {
      setLoadingStreams(true)
      setStreamsError(null)

      if (!session) {
        setStreamsError('Session expired. Please sign in again.')
        return
      }

      const response = await fetch('/api/streams', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch streams')
      }

      const data = await response.json()
      const streamsList = data.streams || []
      setStreams(streamsList)
    } catch (err) {
      console.error('[TEST_PAPERS_STREAM_PICKER_ERROR]', err)
      setStreamsError(err instanceof Error ? err.message : 'Failed to load streams')
    } finally {
      setLoadingStreams(false)
    }
  }

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state
  if (loading || teacherLoading || loadingStreams) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-saffron border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Loading streams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Create Test Paper</h1>
              <p className="text-sm text-neutral-600 mt-1">Select a stream to continue</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error State */}
        {streamsError && (
          <div className="bg-error/10 border border-error/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-error text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-error font-medium">Error Loading Streams</p>
                <p className="text-error/80 text-sm mt-1">{streamsError}</p>
                <button
                  onClick={fetchStreams}
                  className="mt-3 text-sm text-error hover:underline font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!streamsError && streams.length === 0 && !loadingStreams && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">No Streams Found</h2>
            <p className="text-neutral-600 mb-6">
              {teacher?.role === 'admin'
                ? 'No streams have been added to your institute yet.'
                : 'Your institute has no streams configured yet. Please contact your administrator.'}
            </p>
            {teacher?.role === 'admin' && (
              <Link href="/dashboard/admin/streams">
                <button className="px-6 py-2.5 bg-brand-saffron text-white rounded-lg hover:bg-brand-saffron/90 transition-colors font-medium">
                  Manage Streams
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Streams Grid */}
        {streams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {streams.map((stream) => (
              <Link
                key={stream.id}
                href={`/dashboard/test-papers/stream/${stream.id}`}
                className="block"
              >
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-neutral-200 hover:border-brand-saffron group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-brand-saffron transition-colors">
                        {stream.name}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        Select to view paper templates
                      </p>
                    </div>
                    <svg
                      className="w-6 h-6 text-neutral-400 group-hover:text-brand-saffron transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
