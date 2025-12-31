/**
 * PaperCard Component
 *
 * Displays a paper card with sections overview in Papers List screen
 * Shows paper title, classes, difficulty, status, and section status tiles
 */

'use client'

import { SectionStatusBadge } from './SectionStatusBadge'
import { useRouter } from 'next/navigation'

interface PaperCardProps {
  paper: {
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
}

export function PaperCard({ paper }: PaperCardProps) {
  const router = useRouter()

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Get paper status color
  const getPaperStatusStyles = () => {
    switch (paper.status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'finalized':
        return 'bg-green-100 text-green-700 border-green-300'
    }
  }

  // Get difficulty badge color
  const getDifficultyStyles = () => {
    switch (paper.difficulty_level) {
      case 'easy':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'balanced':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'hard':
        return 'bg-red-50 text-red-700 border-red-200'
    }
  }

  // Calculate overall progress
  const completedSections = paper.sections.filter(s => s.status === 'finalized').length
  const totalSections = paper.sections.length
  const progressPercentage = totalSections > 0 ? (completedSections / totalSections) * 100 : 0

  return (
    <div
      className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 hover:shadow-md transition-all bg-white cursor-pointer"
      onClick={() => router.push(`/dashboard/test-papers/${paper.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {paper.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(paper.created_at)}</span>
          </div>
        </div>

        {/* Paper Status Badge */}
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getPaperStatusStyles()}`}>
          {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
        </span>
      </div>

      {/* Classes and Difficulty */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Classes */}
        {paper.classes.slice(0, 3).map((cls) => (
          <span
            key={cls.id}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200"
          >
            {cls.class_levels?.name} - {cls.batch_name}
          </span>
        ))}
        {paper.classes.length > 3 && (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200">
            +{paper.classes.length - 3} more
          </span>
        )}

        {/* Difficulty */}
        <span className={`px-2 py-1 text-xs font-medium rounded border ${getDifficultyStyles()}`}>
          {paper.difficulty_level.charAt(0).toUpperCase() + paper.difficulty_level.slice(1)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Section Progress</span>
          <span>{completedSections} / {totalSections} completed</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Section Status Grid */}
      <div className="grid grid-cols-2 gap-2">
        {paper.sections.map((section) => (
          <div
            key={section.id}
            className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/dashboard/test-papers/${paper.id}`)
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700 truncate">
                {section.section_name}
              </span>
              <SectionStatusBadge status={section.status} size="sm" showIcon={false} />
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{section.chapter_count} ch</span>
              <span>{section.question_count} q</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
        <button
          className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/dashboard/test-papers/${paper.id}`)
          }}
        >
          Open Dashboard
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {paper.status === 'finalized' && (
          <button
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/dashboard/test-papers/${paper.id}/pdf`)
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            View PDF
          </button>
        )}
      </div>
    </div>
  )
}
