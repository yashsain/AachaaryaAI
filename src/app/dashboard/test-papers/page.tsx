'use client'

/**
 * Subject Picker Page - Test Papers
 *
 * First step in test paper creation workflow
 * Shows list of subjects for user to select
 * - Teachers: see only their assigned subjects
 * - Admins: see all subjects
 * - Auto-redirects if only 1 subject available
 */

import { useRequireAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'

interface Subject {
  id: string
  name: string
  stream_id: string
  streams: {
    id: string
    name: string
  }
}

export default function TestPapersSubjectPickerPage() {
  const { teacher, institute, loading, teacherLoading, error, retry, clearError, signOut } = useRequireAuth()
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [subjectsError, setSubjectsError] = useState<string | null>(null)

  useEffect(() => {
    if (teacher && !loading && !teacherLoading) {
      fetchSubjects()
    }
  }, [teacher, loading, teacherLoading])

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true)
      setSubjectsError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setSubjectsError('Session expired. Please sign in again.')
        return
      }

      const response = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch subjects')
      }

      const data = await response.json()
      const subjectsList = data.subjects || []
      setSubjects(subjectsList)

      // Auto-redirect if only 1 subject
      if (subjectsList.length === 1) {
        console.log('[TEST_PAPERS_SUBJECT_PICKER] Auto-redirecting to only subject:', subjectsList[0].id)
        router.push(`/dashboard/test-papers/subject/${subjectsList[0].id}`)
      }
    } catch (err) {
      console.error('[TEST_PAPERS_SUBJECT_PICKER_ERROR]', err)
      setSubjectsError(err instanceof Error ? err.message : 'Failed to load subjects')
    } finally {
      setLoadingSubjects(false)
    }
  }

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state
  if (loading || teacherLoading || loadingSubjects) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-saffron border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Loading subjects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Create Test Paper</h1>
              <p className="text-sm text-neutral-600 mt-1">Select a subject to continue</p>
            </div>
            <Link href="/dashboard">
              <button className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-brand-saffron transition-colors">
                ← Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error State */}
        {subjectsError && (
          <div className="bg-error/10 border border-error/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-error text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-error font-medium">Error Loading Subjects</p>
                <p className="text-error/80 text-sm mt-1">{subjectsError}</p>
                <button
                  onClick={fetchSubjects}
                  className="mt-3 text-sm text-error hover:underline font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!subjectsError && subjects.length === 0 && !loadingSubjects && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">No Subjects Found</h2>
            <p className="text-neutral-600 mb-6">
              {teacher?.role === 'admin'
                ? 'No subjects have been added to your institute yet.'
                : 'You have not been assigned any subjects yet. Please contact your administrator.'}
            </p>
            {teacher?.role === 'admin' && (
              <Link href="/dashboard/admin/subjects">
                <button className="px-6 py-2.5 bg-brand-saffron text-white rounded-lg hover:bg-brand-saffron/90 transition-colors font-medium">
                  Add Subjects
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Subjects Grid */}
        {subjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/dashboard/test-papers/subject/${subject.id}`}
                className="block"
              >
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-neutral-200 hover:border-brand-saffron group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-brand-saffron transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        {subject.streams.name}
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
