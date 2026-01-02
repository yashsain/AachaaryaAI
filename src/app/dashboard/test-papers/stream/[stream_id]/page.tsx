'use client'

/**
 * Template Picker Page - Test Papers (Filtered by Stream)
 *
 * Second step in test paper creation workflow
 * Shows list of paper templates for selected stream
 * Templates define the structure and sections of the paper
 */

import { useRequireSession } from '@/hooks/useSession'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'

interface PaperTemplate {
  id: string
  name: string
  description: string | null
  display_order: number
  is_default: boolean
  stream_id: string
  streams: {
    id: string
    name: string
  }
  sections: Array<{
    id: string
    subject_id: string
    section_type: string
    section_name: string
    section_order: number
    default_question_count: number
    subjects: {
      id: string
      name: string
    }
  }>
}

export default function TestPapersTemplatePickerPage() {
  const { session, teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireSession()
  const router = useRouter()
  const params = useParams()
  const streamId = params?.stream_id as string

  const [templates, setTemplates] = useState<PaperTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [templatesError, setTemplatesError] = useState<string | null>(null)
  const [streamName, setStreamName] = useState<string>('')

  useEffect(() => {
    if (teacher && !loading && !teacherLoading && streamId) {
      fetchTemplates()
    }
  }, [teacher, loading, teacherLoading, streamId])

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true)
      setTemplatesError(null)

      if (!session) {
        setTemplatesError('Session expired. Please sign in again.')
        return
      }

      const response = await fetch(`/api/paper-templates?stream_id=${streamId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch templates')
      }

      const data = await response.json()
      const templatesList = data.templates || []
      setTemplates(templatesList)

      // Get stream name from first template
      if (templatesList.length > 0) {
        setStreamName(templatesList[0].streams.name)
      }
    } catch (err) {
      console.error('[TEST_PAPERS_TEMPLATE_PICKER_ERROR]', err)
      setTemplatesError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setLoadingTemplates(false)
    }
  }

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state
  if (loading || teacherLoading || loadingTemplates) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-saffron border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/test-papers"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Streams
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Create Test Paper</h1>
              <p className="text-sm text-neutral-600 mt-1">
                {streamName ? `${streamName} - Select a paper template` : 'Select a paper template to continue'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error State */}
        {templatesError && (
          <div className="bg-error/10 border border-error/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-error text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-error font-medium">Error Loading Templates</p>
                <p className="text-error/80 text-sm mt-1">{templatesError}</p>
                <button
                  onClick={fetchTemplates}
                  className="mt-3 text-sm text-error hover:underline font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!templatesError && templates.length === 0 && !loadingTemplates && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">No Templates Found</h2>
            <p className="text-neutral-600 mb-6">
              No paper templates have been configured for this stream yet. Please contact your administrator.
            </p>
            <Link
              href="/dashboard/test-papers"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-saffron text-white rounded-lg hover:bg-brand-saffron/90 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Streams
            </Link>
          </div>
        )}

        {/* Templates Grid */}
        {templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Link
                key={template.id}
                href={`/dashboard/test-papers/template/${template.id}`}
                className="block"
              >
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-neutral-200 hover:border-brand-saffron group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-neutral-800 group-hover:text-brand-saffron transition-colors">
                          {template.name}
                        </h3>
                        {template.is_default && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Default
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-neutral-600 mb-3">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-6 h-6 text-neutral-400 group-hover:text-brand-saffron transition-colors flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Template Sections */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      Sections ({template.sections.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {template.sections.map((section) => (
                        <div
                          key={section.id}
                          className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                        >
                          <span className="font-medium text-neutral-800">{section.section_name}</span>
                          <span className="text-neutral-500 mx-1">•</span>
                          <span className="text-neutral-600">{section.subjects.name}</span>
                          <span className="text-neutral-500 mx-1">•</span>
                          <span className="text-neutral-600">{section.default_question_count} Q</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Questions */}
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <p className="text-sm font-medium text-neutral-700">
                      Total: {template.sections.reduce((sum, s) => sum + s.default_question_count, 0)} questions
                    </p>
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
