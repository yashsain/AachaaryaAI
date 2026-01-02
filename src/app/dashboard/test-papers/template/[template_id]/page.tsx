/**
 * Papers List Screen
 *
 * Shows all papers created from a specific template
 * Displays paper cards with section status overview
 * Allows filtering and creating new papers
 */

'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireSession } from '@/hooks/useSession'
import { PaperCard } from '@/components/ui/PaperCard'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Plus, Search, FileText } from 'lucide-react'

interface TemplatePapersPageProps {
  params: Promise<{
    template_id: string
  }>
}

interface PaperWithSections {
  id: string
  title: string
  created_at: string
  status: 'draft' | 'review' | 'finalized'
  difficulty_level: 'easy' | 'balanced' | 'hard'
  classes: Array<{
    id: string
    batch_name: string
    medium: string
    class_levels: {
      name: string
    }
  }>
  sections: Array<{
    id: string
    section_name: string
    section_order: number
    status: 'pending' | 'ready' | 'in_review' | 'finalized'
    chapter_count: number
    question_count: number
  }>
}

interface Template {
  id: string
  name: string
  stream_id: string
  streams: {
    id: string
    name: string
  }
}

export default function TemplatePapersPage({ params }: TemplatePapersPageProps) {
  const resolvedParams = use(params)
  const templateId = resolvedParams.template_id
  const { session, loading, teacherLoading } = useRequireSession()
  const router = useRouter()

  const [template, setTemplate] = useState<Template | null>(null)
  const [papers, setPapers] = useState<PaperWithSections[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Only fetch when auth is fully loaded
    // Prevents race condition with useRequireSession redirect logic
    if (session && !loading && !teacherLoading) {
      fetchTemplate()
      fetchPapers()
    }
  }, [session, loading, teacherLoading, templateId])

  const fetchTemplate = async () => {
    try {
      // Session is guaranteed to exist here due to useEffect guard above
      // No need for manual redirect - useRequireSession handles it

      const response = await fetch(`/api/paper-templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch template')
      }

      const data = await response.json()
      setTemplate(data.template)
    } catch (err) {
      console.error('Error fetching template:', err)
      setError('Failed to load template')
    }
  }

  const fetchPapers = async () => {
    try {
      setIsLoading(true)

      // Session is guaranteed to exist here due to useEffect guard above
      // No need for manual redirect - useRequireSession handles it

      // Build query parameters
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      if (searchQuery) {
        params.set('search', searchQuery)
      }

      const queryString = params.toString()
      const url = `/api/paper-templates/${templateId}/papers${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch papers')
      }

      const data = await response.json()
      setPapers(data.papers || [])
    } catch (err) {
      console.error('Error fetching papers:', err)
      setError('Failed to load papers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNew = () => {
    router.push(`/dashboard/test-papers/new-template/${templateId}`)
  }

  // Loading state
  if (isLoading && !template) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !template) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Error Loading Template</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard/test-papers')}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (template?.stream_id) {
                router.push(`/dashboard/test-papers/stream/${template.stream_id}`)
              } else {
                router.push('/dashboard/test-papers')
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 rounded-xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100/50 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Streams
          </button>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              {template?.name || 'Loading...'}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100/80 text-neutral-700 border border-neutral-200/80">
                {template?.streams.name}
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/80 text-primary-700 border border-primary-200/80">
                <FileText className="h-4 w-4" />
                {papers.length} {papers.length === 1 ? 'paper' : 'papers'}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Paper
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPapers()}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100/80 border border-neutral-200/80 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
          }}
          className="px-4 py-3 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100/80 border border-neutral-200/80 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 font-medium text-neutral-700"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="finalized">Finalized</option>
        </select>

        <Button
          variant="secondary"
          onClick={fetchPapers}
          className="shadow-md hover:shadow-lg transition-all"
        >
          Apply Filters
        </Button>
      </div>

      {/* Papers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-neutral-300 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-3">No papers yet</h3>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto leading-relaxed">
            Get started by creating your first {template?.name} paper
          </p>
          <Button
            variant="primary"
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create First Paper
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      )}
    </div>
  )
}
