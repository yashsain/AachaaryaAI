/**
 * PaperCard Component
 *
 * Displays a paper card with sections overview in Papers List screen
 * Shows paper title, classes, difficulty, status, and section status tiles
 */

'use client'

import { SectionStatusBadge } from './SectionStatusBadge'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronRight, FileText } from 'lucide-react'

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
        return 'bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-700 border-neutral-200/80'
      case 'review':
        return 'bg-gradient-to-br from-warning-50 to-warning-100 text-warning-700 border-warning-200/80'
      case 'finalized':
        return 'bg-gradient-to-br from-success-50 to-success-100 text-success-700 border-success-200/80'
    }
  }

  // Get difficulty badge color
  const getDifficultyStyles = () => {
    switch (paper.difficulty_level) {
      case 'easy':
        return 'bg-gradient-to-br from-success-50 to-success-100 text-success-700 border-success-200/80'
      case 'balanced':
        return 'bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 border-primary-200/80'
      case 'hard':
        return 'bg-gradient-to-br from-error-50 to-error-100 text-error-700 border-error-200/80'
    }
  }

  // Calculate overall progress
  const completedSections = paper.sections.filter(s => s.status === 'finalized').length
  const totalSections = paper.sections.length
  const progressPercentage = totalSections > 0 ? (completedSections / totalSections) * 100 : 0

  return (
    <div
      className="group relative bg-white border border-neutral-200/60 rounded-2xl p-6 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 cursor-pointer"
      onClick={() => router.push(`/dashboard/test-papers/${paper.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
            {paper.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{formatDate(paper.created_at)}</span>
          </div>
        </div>

        {/* Paper Status Badge */}
        <span className={`px-3 py-1.5 text-xs font-semibold rounded-xl border ${getPaperStatusStyles()}`}>
          {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
        </span>
      </div>

      {/* Classes and Difficulty */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {/* Classes */}
        {paper.classes.slice(0, 3).map((cls) => (
          <span
            key={cls.id}
            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-neutral-50 to-neutral-100/80 text-neutral-700 rounded-lg border border-neutral-200/60"
          >
            {cls.class_levels?.name} - {cls.batch_name}
          </span>
        ))}
        {paper.classes.length > 3 && (
          <span className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-neutral-50 to-neutral-100/80 text-neutral-700 rounded-lg border border-neutral-200/60">
            +{paper.classes.length - 3} more
          </span>
        )}

        {/* Difficulty */}
        <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getDifficultyStyles()}`}>
          {paper.difficulty_level.charAt(0).toUpperCase() + paper.difficulty_level.slice(1)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 mb-2">
          <span>Section Progress</span>
          <span className="text-primary-600">{completedSections} / {totalSections} completed</span>
        </div>
        <div className="w-full h-2.5 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-success-500 to-success-600 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Section Status Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {paper.sections.map((section) => (
          <div
            key={section.id}
            className="p-3 bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-xl border border-neutral-200/60 hover:border-primary-300 hover:shadow-md hover:from-primary-50/30 hover:to-primary-100/30 transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/dashboard/test-papers/${paper.id}`)
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-900 truncate">
                {section.section_name}
              </span>
              <SectionStatusBadge status={section.status} size="sm" showIcon={false} />
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-neutral-600">
              <span>{section.chapter_count} ch</span>
              <span className="text-neutral-300">•</span>
              <span>{section.question_count} q</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-neutral-200/60 flex items-center justify-between">
        <button
          className="text-sm font-semibold text-neutral-600 hover:text-primary-600 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100/50 transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/dashboard/test-papers/${paper.id}`)
          }}
        >
          Open Dashboard
          <ChevronRight className="w-4 h-4" />
        </button>

        {paper.status === 'finalized' && (
          <button
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 hover:from-primary-100 hover:to-primary-200/50 border border-primary-200/50 hover:border-primary-300 transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/dashboard/test-papers/${paper.id}/pdf`)
            }}
          >
            <FileText className="w-4 h-4" />
            View PDF
          </button>
        )}
      </div>
    </div>
  )
}
