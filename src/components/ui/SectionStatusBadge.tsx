/**
 * SectionStatusBadge Component
 *
 * Displays the status of a test paper section with appropriate styling
 * Status types: 'pending' | 'ready' | 'in_review' | 'finalized'
 *
 * Status Flow:
 * - pending: No chapters assigned yet
 * - ready: Chapters assigned, not generated
 * - in_review: Questions generated, under review by teacher
 * - finalized: Questions finalized, ready for PDF generation
 */

interface SectionStatusBadgeProps {
  status: 'pending' | 'ready' | 'in_review' | 'finalized'
  size?: 'sm' | 'md'
  showIcon?: boolean
}

export function SectionStatusBadge({
  status,
  size = 'md',
  showIcon = true
}: SectionStatusBadgeProps) {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full'

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  const statusConfig = {
    pending: {
      label: 'Pending',
      styles: 'bg-gray-100 text-gray-700 border border-gray-300',
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    ready: {
      label: 'Ready',
      styles: 'bg-blue-100 text-blue-700 border border-blue-300',
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    in_review: {
      label: 'In Review',
      styles: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    finalized: {
      label: 'Finalized',
      styles: 'bg-green-100 text-green-700 border border-green-300',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      )
    }
  }

  const config = statusConfig[status]

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${config.styles}`}>
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  )
}
