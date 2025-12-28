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
import { useRequireAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'

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
  const { teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireAuth()
  const router = useRouter()
  const params = useParams()
  const subject_id = params.subject_id as string

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

      const { data: { session } } = await supabase.auth.getSession()
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

      const { data: { session } } = await supabase.auth.getSession()
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
      alert(err instanceof Error ? err.message : 'Failed to delete paper')
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
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-saffron border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Loading papers...</p>
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
              className="mt-4 inline-block text-brand-saffron hover:underline"
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
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/test-papers" className="text-brand-saffron hover:underline mb-4 inline-block">
            ← Back to Subjects
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{subjectName} - Test Papers</h1>
              <p className="text-neutral-600 mt-2">Manage your test papers</p>
            </div>
            <Link
              href={`/dashboard/test-papers/new/${subject_id}`}
              className="px-6 py-3 bg-[#F7931E] text-white rounded-lg font-medium hover:bg-[#E67E00] transition-colors"
            >
              + Create New Paper
            </Link>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          <div className="border-b border-neutral-200 px-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setStatusFilter('all')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  statusFilter === 'all'
                    ? 'border-brand-saffron text-brand-saffron'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                All ({papers.length})
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  statusFilter === 'draft'
                    ? 'border-brand-saffron text-brand-saffron'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => setStatusFilter('review')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  statusFilter === 'review'
                    ? 'border-brand-saffron text-brand-saffron'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                In Review
              </button>
              <button
                onClick={() => setStatusFilter('finalized')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  statusFilter === 'finalized'
                    ? 'border-brand-saffron text-brand-saffron'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Finalized
              </button>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-saffron"
              />
            </div>
            <div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-saffron"
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
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
            <p className="text-neutral-600 mb-4">No papers found</p>
            <Link
              href={`/dashboard/test-papers/new/${subject_id}`}
              className="inline-block px-6 py-3 bg-[#F7931E] text-white rounded-lg font-medium hover:bg-[#E67E00]"
            >
              Create Your First Paper
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {papers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm"
            onClick={() => !deleting && setDeletingPaper(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Paper?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{deletingPaper.title}</strong>"?
              This will permanently delete all {deletingPaper.total_generated} questions and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingPaper(null)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePaper}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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
  onDelete: (paper: Paper) => void
  formatDate: (date: string) => string
  getStatusBadge: (status: string) => React.ReactElement
}

function PaperCard({ paper, onDelete, formatDate, getStatusBadge }: PaperCardProps) {
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700"
        >
          Continue Editing
        </button>
      )
    }
    if (paper.status === 'review') {
      return (
        <button
          onClick={() => router.push(`/dashboard/test-papers/${paper.id}/review`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700"
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700"
          >
            View Paper
          </button>
          <button
            onClick={handleEditPaper}
            disabled={editingPaper}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium text-sm hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {editingPaper ? 'Opening...' : 'Edit Paper'}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            title="Download PDF"
          >
            {downloadingPdf ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
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

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Session expired. Please sign in again.')
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
      alert(err instanceof Error ? err.message : 'Failed to reopen paper for editing')
      setEditingPaper(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!paper.pdf_url) {
      alert('PDF not available. Please finalize the paper first.')
      return
    }

    try {
      setDownloadingPdf(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Session expired. Please sign in again.')
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
      alert(err instanceof Error ? err.message : 'Failed to download PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {getStatusBadge(paper.status)}
            <h3 className="text-lg font-semibold text-neutral-900">{paper.title}</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span>📊 {getProgressText()}</span>
            <span>•</span>
            <span>📅 Created {formatDate(paper.created_at)}</span>
            {paper.last_modified !== paper.created_at && (
              <>
                <span>•</span>
                <span>Modified {formatDate(paper.last_modified)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500">
            <span className="px-2 py-1 bg-neutral-100 rounded">
              {paper.question_count} questions
            </span>
            <span className="px-2 py-1 bg-neutral-100 rounded capitalize">
              {paper.difficulty_level}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {getActionButton()}
        <button
          onClick={() => onDelete(paper)}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium text-sm hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
