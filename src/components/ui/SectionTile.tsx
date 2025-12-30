/**
 * SectionTile Component
 *
 * Displays a section card with status, chapter count, and action button
 * Used in Paper Dashboard to show all sections of a paper
 */

'use client'

import { SectionStatusBadge } from './SectionStatusBadge'
import { Button } from './Button'

interface SectionTileProps {
  section: {
    id: string
    section_name: string
    section_order: number
    status: 'pending' | 'ready' | 'in_review' | 'finalized'
    chapter_count: number
    question_count: number
  }
  paperId: string
  onActionClick: (sectionId: string, action: 'assign' | 'generate' | 'regenerate' | 'view') => void
  isLoading?: boolean
}

export function SectionTile({
  section,
  paperId,
  onActionClick,
  isLoading = false
}: SectionTileProps) {
  // Determine action button based on status
  const getActionButton = (): { label: string; action: 'assign' | 'generate' | 'view'; variant: 'primary' | 'secondary' } => {
    switch (section.status) {
      case 'pending':
        return {
          label: 'Assign Chapters',
          action: 'assign' as const,
          variant: 'primary' as const
        }
      case 'ready':
        return {
          label: 'Generate Questions',
          action: 'generate' as const,
          variant: 'primary' as const
        }
      case 'in_review':
        return {
          label: 'Review & Finalize',
          action: 'view' as const,
          variant: 'primary' as const
        }
      case 'finalized':
      default:
        return {
          label: 'View Questions',
          action: 'view' as const,
          variant: 'secondary' as const
        }
    }
  }

  const actionButton = getActionButton()

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500">
              Section {section.section_order}
            </span>
            <SectionStatusBadge status={section.status} size="sm" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            {section.section_name}
          </h3>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>
            {section.chapter_count} {section.chapter_count === 1 ? 'Chapter' : 'Chapters'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {section.status === 'in_review' || section.status === 'finalized'
              ? `${section.question_count} Questions`
              : `Target: ${section.question_count}`}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex gap-2">
        {actionButton.action && (
          <Button
            variant={actionButton.variant}
            size="sm"
            className="flex-1"
            onClick={() => onActionClick(section.id, actionButton.action!)}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {actionButton.label}
          </Button>
        )}

        {!actionButton.action && (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            disabled
          >
            {actionButton.label}
          </Button>
        )}

        {(section.status === 'in_review' || section.status === 'finalized') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onActionClick(section.id, 'regenerate')}
            disabled={isLoading}
            title="Regenerate questions"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        )}
      </div>

    </div>
  )
}
