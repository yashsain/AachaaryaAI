'use client'

/**
 * Modern Template Picker Page - Test Papers
 *
 * Second step in test paper creation workflow
 * Features:
 * - Template cards with section preview
 * - Visual section breakdown
 * - Animated loading states
 * - Modern card design with hover effects
 */

import { useRequireSession } from '@/hooks/useSession'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Layers, Hash, BookOpen, ChevronRight, Star } from 'lucide-react'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

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

// Subject-specific colors
const getSubjectColor = (subjectName: string) => {
  const name = subjectName.toLowerCase()

  if (name.includes('physics')) {
    return {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    }
  } else if (name.includes('chemistry')) {
    return {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200'
    }
  } else if (name.includes('biology')) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200'
    }
  } else if (name.includes('math')) {
    return {
      bg: 'bg-primary-50',
      text: 'text-primary-700',
      border: 'border-primary-200'
    }
  } else {
    return {
      bg: 'bg-neutral-50',
      text: 'text-neutral-700',
      border: 'border-neutral-200'
    }
  }
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
  if (loading || teacherLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3 text-neutral-600">
          <Link
            href="/dashboard/test-papers"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Streams
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-neutral-900">
          {streamName ? `${streamName} Templates` : 'Select Template'}
        </h1>
        <p className="text-lg text-neutral-600">
          Choose a paper template to define the structure and sections of your test
        </p>
      </motion.div>

      {/* Error State */}
      {templatesError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-error-50 border border-error-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-error-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-error-900 mb-1">Error Loading Templates</h3>
              <p className="text-error-700 text-sm mb-4">{templatesError}</p>
              <button
                onClick={fetchTemplates}
                className="inline-flex items-center gap-2 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loadingTemplates && !templatesError && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!templatesError && templates.length === 0 && !loadingTemplates && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center"
        >
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">No Templates Found</h2>
          <p className="text-neutral-600 mb-6 max-w-md mx-auto">
            No paper templates have been configured for this stream yet. Please contact your administrator.
          </p>
          <Link href="/dashboard/test-papers">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-medium shadow-lg hover:shadow-xl">
              <ArrowLeft className="h-4 w-4" />
              Back to Streams
            </button>
          </Link>
        </motion.div>
      )}

      {/* Templates Grid */}
      {templates.length > 0 && !loadingTemplates && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templates.map((template, index) => {
            const totalQuestions = template.sections.reduce((sum, s) => sum + s.default_question_count, 0)

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/dashboard/test-papers/template/${template.id}`}>
                  <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-200 hover:border-primary-300">
                    {/* Header */}
                    <div className="p-6 border-b border-neutral-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                              {template.name}
                            </h3>
                            {template.is_default && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full border border-primary-200">
                                <Star className="h-3 w-3 fill-current" />
                                Default
                              </span>
                            )}
                          </div>
                          {template.description && (
                            <p className="text-sm text-neutral-600 leading-relaxed">
                              {template.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-3" />
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-neutral-600">
                          <Layers className="h-4 w-4" />
                          <span className="font-medium">{template.sections.length} Sections</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-600">
                          <Hash className="h-4 w-4" />
                          <span className="font-medium">{totalQuestions} Questions</span>
                        </div>
                      </div>
                    </div>

                    {/* Sections */}
                    <div className="p-6">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-4">
                        Template Structure
                      </p>
                      <div className="space-y-3">
                        {template.sections.map((section, sectionIndex) => {
                          const subjectColor = getSubjectColor(section.subjects.name)

                          return (
                            <motion.div
                              key={section.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 + sectionIndex * 0.05 }}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                                subjectColor.bg,
                                subjectColor.border,
                                'group-hover:shadow-sm'
                              )}
                            >
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm',
                                subjectColor.text,
                                'bg-white/70'
                              )}>
                                {section.section_order}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn('font-semibold text-sm', subjectColor.text)}>
                                  {section.section_name}
                                </p>
                                <p className="text-xs text-neutral-600 truncate">
                                  {section.subjects.name}
                                </p>
                              </div>
                              <div className={cn(
                                'px-2.5 py-1 rounded-lg text-xs font-bold',
                                'bg-white/70',
                                subjectColor.text
                              )}>
                                {section.default_question_count} Q
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary-600 group-hover:text-primary-700">
                        <span>Create test paper with this template</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Helper Text */}
      {templates.length > 0 && !loadingTemplates && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-primary-50 border border-primary-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-primary-900 mb-1">About Templates</h4>
              <p className="text-sm text-primary-700">
                Templates define the structure of your test paper including sections, subjects, and question distribution. Select a template to proceed with creating your test paper.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
