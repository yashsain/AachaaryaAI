'use client'

/**
 * Subject Picker Page - Materials (Filtered by Stream)
 *
 * Second step in material management workflow
 * Shows list of subjects for selected stream
 * - Teachers: see only their assigned subjects (filtered by stream)
 * - Admins: see all subjects for the stream
 */

import { useRequireSession } from '@/hooks/useSession'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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

export default function MaterialsSubjectPickerPage() {
  const { session, teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireSession()
  const router = useRouter()
  const params = useParams()
  const streamId = params?.stream_id as string

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [subjectsError, setSubjectsError] = useState<string | null>(null)
  const [streamName, setStreamName] = useState<string>('')

  useEffect(() => {
    if (teacher && !loading && !teacherLoading && streamId) {
      fetchSubjects()
    }
  }, [teacher, loading, teacherLoading, streamId])

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true)
      setSubjectsError(null)

      if (!session) {
        setSubjectsError('Session expired. Please sign in again.')
        return
      }

      const response = await fetch(`/api/subjects?stream_id=${streamId}`, {
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

      // Get stream name from first subject
      if (subjectsList.length > 0) {
        setStreamName(subjectsList[0].streams.name)
      }
    } catch (err) {
      console.error('[MATERIALS_SUBJECT_PICKER_ERROR]', err)
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
              <h1 className="text-2xl font-bold text-neutral-800">Manage Study Materials</h1>
              <p className="text-sm text-neutral-600 mt-1">
                {streamName ? `${streamName} - Select a subject` : 'Select a subject to continue'}
              </p>
            </div>
            <Link href="/dashboard/materials">
              <button className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-brand-saffron transition-colors">
                ← Back to Streams
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
              <span className="text-3xl">📚</span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">No Subjects Found</h2>
            <p className="text-neutral-600 mb-6">
              {teacher?.role === 'admin'
                ? `No subjects have been added for this stream yet.`
                : 'You have not been assigned any subjects for this stream. Please contact your administrator.'}
            </p>
            <Link href="/dashboard/materials">
              <button className="px-6 py-2.5 bg-brand-saffron text-white rounded-lg hover:bg-brand-saffron/90 transition-colors font-medium">
                ← Back to Streams
              </button>
            </Link>
          </div>
        )}

        {/* Subjects List */}
        {!subjectsError && subjects.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-800">
                Select a Subject
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'} available for {streamName}
              </p>
            </div>

            <div className="divide-y divide-neutral-200">
              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/dashboard/materials/${subject.id}`}
                  className="block hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center justify-between p-6 group">
                    <div className="flex items-center gap-4">
                      {/* Subject Icon */}
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-lg flex items-center justify-center">
                        <span className="text-2xl">
                          {subject.name === 'Biology' ? '🧬' :
                           subject.name === 'Physics' ? '⚛️' :
                           subject.name === 'Chemistry' ? '🧪' :
                           subject.name === 'Mathematics' ? '📐' :
                           '📚'}
                        </span>
                      </div>

                      {/* Subject Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-brand-blue transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {subject.streams.name} Stream
                        </p>
                      </div>
                    </div>

                    {/* Chevron Icon */}
                    <svg
                      className="w-6 h-6 text-neutral-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-all"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-blue-600 text-xl">💡</span>
            <div>
              <p className="text-sm text-blue-800 font-medium">About Study Materials</p>
              <p className="text-sm text-blue-700 mt-1">
                Organize your study materials by uploading PDFs of notes, DPPs, past papers, and more.
                Materials are tagged by chapters for easy access during test paper generation.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
