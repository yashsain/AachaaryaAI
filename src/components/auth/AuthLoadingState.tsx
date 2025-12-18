/**
 * Shared Auth Loading State Component
 *
 * Displays a consistent loading UI across all authenticated pages with:
 * - Stage-specific loading messages
 * - Visual progress bar (0-100%)
 * - Customizable fallback message
 */

import { LoadingStage } from '@/lib/auth/types'

interface AuthLoadingStateProps {
  stage?: LoadingStage | null
  progress?: number
  message?: string
}

export function AuthLoadingState({
  stage,
  progress,
  message
}: AuthLoadingStateProps) {
  // Determine the loading message based on stage
  const getLoadingMessage = () => {
    if (stage === 'SESSION') return 'Verifying session...'
    if (stage === 'TEACHER') return 'Loading your profile...'
    if (stage === 'INSTITUTE') return 'Loading institute data...'
    return message || 'Loading...'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50">
      <div className="text-center">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>

        {/* Loading Message */}
        <p className="mt-4 text-gray-600 font-medium">
          {getLoadingMessage()}
        </p>

        {/* Progress Bar */}
        {progress !== undefined && progress > 0 && (
          <div className="mt-4">
            <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">{Math.round(progress)}%</p>
          </div>
        )}
      </div>
    </div>
  )
}
