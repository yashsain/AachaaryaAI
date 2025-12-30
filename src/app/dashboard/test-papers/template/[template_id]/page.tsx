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
import { supabase } from '@/lib/supabase'
import { PaperCard } from '@/components/ui/PaperCard'
import { Button } from '@/components/ui/Button'

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
  const router = useRouter()

  const [template, setTemplate] = useState<Template | null>(null)
  const [papers, setPapers] = useState<PaperWithSections[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTemplate()
    fetchPapers()
  }, [templateId])

  const fetchTemplate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

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

  if (error && !template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Template</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard/test-papers')}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (template?.stream_id) {
                    router.push(`/dashboard/test-papers/stream/${template.stream_id}`)
                  } else {
                    router.push('/dashboard/test-papers')
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {template?.name || 'Loading...'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {template?.streams.name} • {papers.length} {papers.length === 1 ? 'paper' : 'papers'}
                </p>
              </div>
            </div>

            <Button variant="primary" onClick={handleCreateNew}>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Paper
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPapers()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              // Fetch papers will be called in useEffect
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="finalized">Finalized</option>
          </select>

          <Button variant="secondary" onClick={fetchPapers}>
            Apply Filters
          </Button>
        </div>

        {/* Papers Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg
                className="animate-spin h-8 w-8 text-gray-900 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600">Loading papers...</p>
            </div>
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No papers yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first {template?.name} paper
            </p>
            <Button variant="primary" onClick={handleCreateNew}>
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
    </div>
  )
}
