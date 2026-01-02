'use client'

/**
 * Papers List Page - Papers Management Interface
 *
 * Shows all test papers for a selected subject
 * Allows teachers to:
 * - View papers by status (Draft, In Review, Finalized, All)
 * - Search and sort papers
 * - Continue/resume work on papers
 * - View finalized papers
 * - Delete papers
 * - Create new papers
 */

import React from 'react'
import { useRequireSession } from '@/hooks/useSession'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { createBrowserClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Plus, Search, FileText, Download } from 'lucide-react'
import { toast } from '@/components/ui/toast'

interface Paper {
  id: string
  title: string
  status: 'draft' | 'review' | 'finalized'
  question_count: number
  difficulty_level: string
  created_at: string
  finalized_at: string | null
  pdf_url: string | null
  subject_id: string
  subject_name: string
  selected_count: number
  total_generated: number
  last_modified: string
}

type StatusFilter = 'all' | 'draft' | 'review' | 'finalized'
type SortOption = 'recent' | 'oldest' | 'title'

export default function PapersListPage() {
  const { session, teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireSession()
  const router = useRouter()
  const params = useParams()
  const subject_id = params.subject_id as string
  const supabase = createBrowserClient()

  const [papers, setPapers] = useState<Paper[]>([])
  const [subjectName, setSubjectName] = useState<string>('')
  const [loadingData, setLoadingData] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('recent')

  // Delete modal
  const [deletingPaper, setDeletingPaper] = useState<Paper | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (teacher && !loading && !teacherLoading && subject_id) {
      fetchPapers()
    }
  }, [teacher, loading, teacherLoading, subject_id, statusFilter, searchQuery, sortOption])

  const fetchPapers = async () => {
    try {
      setLoadingData(true)

      // Using centralized session from useRequireSession hook (no redundant getSession call)
      if (!session) {
        setPageError('Session expired. Please sign in again.')
        return
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        subject_id,
        status: statusFilter,
        sort: sortOption,
      })

      if (searchQuery) {
        queryParams.set('search', searchQuery)
      }

      const response = await fetch(`/api/test-papers?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch papers')
      }

      console.log('[PAPERS_LIST] Fetched', data.papers.length, 'papers')

      setPapers(data.papers)
      if (data.papers.length > 0) {
        setSubjectName(data.papers[0].subject_name)
      } else {
        // Fetch subject name separately
        const { data: subject } = await supabase
          .from('subjects')
          .select('name')
          .eq('id', subject_id)
          .single()
        setSubjectName(subject?.name || 'Subject')
      }
    } catch (err) {
      console.error('[FETCH_PAPERS_ERROR]', err)
      setPageError(err instanceof Error ? err.message : 'Failed to load papers')
    } finally {
      setLoadingData(false)
    }
  }

  const handleDeletePaper = async () => {
    if (!deletingPaper) return

    try {
      setDeleting(true)

      // Using centralized session (no redundant getSession call)
      if (!session) {
        setPageError('Session expired')
        return
      }

      const response = await fetch(`/api/test-papers/${deletingPaper.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete paper')
      }

      console.log('[DELETE_PAPER_SUCCESS]', deletingPaper.id)

      // Refresh papers list
      fetchPapers()
      setDeletingPaper(null)
    } catch (err) {
      console.error('[DELETE_PAPER_ERROR]', err)
      toast.error(err instanceof Error ? err.message : 'Failed to delete paper')
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">✏️ Draft</span>
      case 'review':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">🔍 In Review</span>
      case 'finalized':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">✅ Finalized</span>
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{status}</span>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state
  if (loading || teacherLoading || loadingData) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (pageError) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-red-50 border border-red-200 p-6">
            <p className="text-red-800 font-medium">{pageError}</p>
            <Link
              href="/dashboard/test-papers"
              className="mt-4 inline-block text-primary-600 hover:underline"
            >
              ← Back to Subjects
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/test-papers"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subjects
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900">{subjectName}</h1>
              <p className="text-neutral-600 mt-2 text-lg">Manage your test papers</p>
            </div>
            <Link
              href={`/dashboard/test-papers/new/${subject_id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create New Paper
            </Link>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200">
          <div className="border-b border-neutral-200 px-6">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setStatusFilter('all')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                  statusFilter === 'all'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                All ({papers.length})
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                  statusFilter === 'draft'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => setStatusFilter('review')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                  statusFilter === 'review'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                In Review
              </button>
              <button
                onClick={() => setStatusFilter('finalized')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                  statusFilter === 'finalized'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                Finalized
              </button>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="px-6 py-4 flex items-center gap-4 bg-neutral-50 rounded-b-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white transition-all shadow-sm hover:shadow-md"
              >
                <option value="recent">Recent First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Papers List */}
        {papers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-neutral-300 p-20 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No papers found</h3>
            <p className="text-neutral-600 mb-8">Get started by creating your first test paper</p>
            <Link
              href={`/dashboard/test-papers/new/${subject_id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Your First Paper
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {papers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                session={session}
                onDelete={setDeletingPaper}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deletingPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-neutral-900 bg-opacity-50 backdrop-blur-sm"
            onClick={() => !deleting && setDeletingPaper(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Delete Paper?</h3>
            <p className="text-neutral-600 mb-8 leading-relaxed">
              Are you sure you want to delete "<strong className="text-neutral-900">{deletingPaper.title}</strong>"?
              This will permanently delete all {deletingPaper.total_generated} questions and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingPaper(null)}
                disabled={deleting}
                className="px-5 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePaper}
                disabled={deleting}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
              >
                {deleting ? 'Deleting...' : 'Delete Paper'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Paper Card Component
interface PaperCardProps {
  paper: Paper
  session: any // Session from parent (centralized)
  onDelete: (paper: Paper) => void
  formatDate: (date: string) => string
  getStatusBadge: (status: string) => React.ReactElement
}

function PaperCard({ paper, session, onDelete, formatDate, getStatusBadge }: PaperCardProps) {
  const router = useRouter()
  const [editingPaper, setEditingPaper] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const getProgressText = () => {
    if (paper.status === 'draft') {
      return paper.total_generated > 0
        ? `Questions generated: ${paper.total_generated}`
        : 'Not started'
    }
    if (paper.status === 'review') {
      return `Progress: ${paper.selected_count} / ${paper.question_count} selected`
    }
    if (paper.status === 'finalized') {
      return `Complete: ${paper.question_count} questions finalized`
    }
    return ''
  }

  const getActionButton = () => {
    if (paper.status === 'draft') {
      return (
        <button
          onClick={() => router.push(`/dashboard/test-papers/${paper.id}/generate`)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
        >
          Continue Editing
        </button>
      )
    }
    if (paper.status === 'review') {
      return (
        <button
          onClick={() => router.push(`/dashboard/test-papers/${paper.id}/review`)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
        >
          Continue Review
        </button>
      )
    }
    if (paper.status === 'finalized') {
      return (
        <>
          <button
            onClick={() => router.push(`/dashboard/test-papers/${paper.id}/pdf`)}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 shadow-sm hover:shadow-md transition-all"
          >
            View Paper
          </button>
          <button
            onClick={handleEditPaper}
            disabled={editingPaper}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 disabled:bg-neutral-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all"
          >
            {editingPaper ? 'Opening...' : 'Edit Paper'}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            className="p-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all"
            title="Download PDF"
          >
            {downloadingPdf ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </>
      )
    }
    return null
  }

  const handleEditPaper = async () => {
    try {
      setEditingPaper(true)

      // Using centralized session passed from parent (no redundant getSession call)
      if (!session) {
        toast.error('Session expired. Please sign in again.')
        return
      }

      // Call reopen API to change status back to review
      const response = await fetch(`/api/test-papers/${paper.id}/reopen`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reopen paper')
      }

      // Navigate to review page
      router.push(`/dashboard/test-papers/${paper.id}/review`)
    } catch (err) {
      console.error('[EDIT_PAPER_ERROR]', err)
      toast.error(err instanceof Error ? err.message : 'Failed to reopen paper for editing')
      setEditingPaper(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!paper.pdf_url) {
      toast.error('PDF not available. Please finalize the paper first.')
      return
    }

    try {
      setDownloadingPdf(true)

      // Using centralized session passed from parent (no redundant getSession call)
      if (!session) {
        toast.error('Session expired. Please sign in again.')
        return
      }

      // Fetch signed URL from API
      const response = await fetch(`/api/test-papers/${paper.id}/pdf-url`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get PDF URL')
      }

      const data = await response.json()
      window.open(data.pdf_url, '_blank')

    } catch (err) {
      console.error('[DOWNLOAD_PDF_ERROR]', err)
      toast.error(err instanceof Error ? err.message : 'Failed to download PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.01]">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {getStatusBadge(paper.status)}
            <h3 className="text-xl font-bold text-neutral-900">{paper.title}</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              {getProgressText()}
            </span>
            <span className="text-neutral-300">•</span>
            <span>Created {formatDate(paper.created_at)}</span>
            {paper.last_modified !== paper.created_at && (
              <>
                <span className="text-neutral-300">•</span>
                <span>Modified {formatDate(paper.last_modified)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1.5 bg-neutral-100 rounded-lg font-medium text-neutral-700">
              {paper.question_count} questions
            </span>
            <span className="px-3 py-1.5 bg-neutral-100 rounded-lg font-medium text-neutral-700 capitalize">
              {paper.difficulty_level}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
        {getActionButton()}
        <button
          onClick={() => onDelete(paper)}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 transition-all"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
