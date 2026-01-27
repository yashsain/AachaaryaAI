'use client'

/**
 * Generate Questions Modal
 *
 * Modal for generating questions in a section
 * - Shows section details before generation
 * - Real-time generation progress with polling
 * - Success/error feedback
 * - Auto-closes on completion
 */

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { AlertCircle, CheckCircle2, Loader2, Zap } from 'lucide-react'

interface GenerateQuestionsModalProps {
  isOpen: boolean
  onClose: () => void
  paperId: string
  sectionId: string
  sectionName: string
  subjectName: string
  questionCount: number
  assignedChapters: Array<{ id: string; name: string }>
  isRegenerate?: boolean
  sectionStatus: 'pending' | 'ready' | 'generating' | 'in_review' | 'finalized'
  session: any
}

type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error'

interface BatchProgress {
  questionsGenerated: number
  totalTarget: number
  batchNumber: number
  totalBatches: number
}

export function GenerateQuestionsModal({
  isOpen,
  onClose,
  paperId,
  sectionId,
  sectionName,
  subjectName,
  questionCount,
  assignedChapters,
  isRegenerate = false,
  sectionStatus,
  session
}: GenerateQuestionsModalProps) {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [generationResult, setGenerationResult] = useState<any>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null)

  // Cleanup polling on unmount or close
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setGenerationStatus('idle')
      setError(null)
      setGenerationResult(null)
      setBatchProgress(null)
    } else {
      // Cleanup polling when modal closes
      if (pollingInterval) {
        clearInterval(pollingInterval)
        setPollingInterval(null)
      }
    }
  }, [isOpen])

  const pollSectionStatus = async () => {
    try {
      if (!session) return

      const response = await fetch(`/api/test-papers/${paperId}/sections/${sectionId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })

      if (!response.ok) return

      const data = await response.json()
      const section = data.section
      const newStatus = section.status

      console.log('[MODAL_POLL] Section status:', newStatus, 'Batch:', section.batch_number, '/', section.total_batches, 'Questions:', section.questions_generated_so_far)

      // Update batch progress if generating
      if (newStatus === 'generating' && section.total_batches > 0) {
        const targetQuestions = Math.ceil(questionCount * 1.5)
        setBatchProgress({
          questionsGenerated: section.questions_generated_so_far || 0,
          totalTarget: targetQuestions,
          batchNumber: section.batch_number || 0,
          totalBatches: section.total_batches || 1
        })
      }

      // If status changed to in_review, generation completed
      if (newStatus === 'in_review') {
        console.log('[MODAL_POLL] Generation completed!')

        // Stop polling
        if (pollingInterval) {
          clearInterval(pollingInterval)
          setPollingInterval(null)
        }

        setGenerationResult({
          questions_generated: section.actual_question_count || section.questions_generated_so_far || questionCount,
          chapters_processed: assignedChapters.length
        })
        setGenerationStatus('completed')

        // Auto-close modal after 2 seconds (parent will refresh data via fetchPaperData)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
      // If status changed to ready (from generating), it failed
      else if (generationStatus === 'generating' && newStatus === 'ready') {
        console.log('[MODAL_POLL] Generation failed or was cleaned up')

        // Stop polling
        if (pollingInterval) {
          clearInterval(pollingInterval)
          setPollingInterval(null)
        }

        setError('Generation timed out or failed. Please try again.')
        setGenerationStatus('error')
      }
    } catch (err) {
      console.error('[MODAL_POLL] Error:', err)
      // Continue polling even if one poll fails
    }
  }

  const startPolling = () => {
    // Poll every 5 seconds
    const interval = setInterval(pollSectionStatus, 5000)
    setPollingInterval(interval)
    console.log('[MODAL_POLL] Started polling')
  }

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
      console.log('[MODAL_POLL] Stopped polling')
    }
  }

  const handleGenerate = async () => {
    // Check if section has chapters assigned
    if (assignedChapters.length === 0) {
      setError('No chapters assigned to this section')
      return
    }

    try {
      setGenerationStatus('generating')
      setError(null)

      if (!session) {
        setError('Session expired. Please sign in again.')
        setGenerationStatus('idle')
        return
      }

      // Start polling immediately to track status changes
      startPolling()

      // Determine endpoint based on regenerate flag
      const endpoint = isRegenerate
        ? `/api/test-papers/${paperId}/sections/${sectionId}/regenerate`
        : `/api/test-papers/${paperId}/sections/${sectionId}/generate`

      console.log(`[MODAL_GENERATE_START] Calling ${endpoint}`)

      // Call generation API (this will take 3-5 minutes)
      // Polling will detect when it completes even if HTTP connection fails
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'We encountered an issue generating questions. Please try again.')
      }

      console.log('[MODAL_GENERATE_SUCCESS]', data)

      // Check if this is batch-based generation (has_more = true means more batches coming)
      if (data.has_more || data.next_batch_triggered) {
        // Batch 1 completed, more batches are generating in background
        // Initialize batch progress with batch 1 data
        setBatchProgress({
          questionsGenerated: data.batch_1_questions || data.questions_generated || 0,
          totalTarget: data.total_target || Math.ceil(questionCount * 1.5),
          batchNumber: data.batch_number || 1,
          totalBatches: data.total_batches || 1
        })

        // Keep polling to track remaining batches
        console.log('[MODAL_GENERATE] Batch 1 complete, continuing to poll for remaining batches')
      } else {
        // Single batch generation completed (question count <= 30)
        // Stop polling since everything is done
        stopPolling()

        // Update UI with result
        setGenerationResult(data)
        setGenerationStatus('completed')

        // Auto-close modal after 2 seconds (parent will refresh data via fetchPaperData)
        setTimeout(() => {
          onClose()
        }, 2000)
      }

    } catch (err) {
      console.error('[MODAL_GENERATE_ERROR]', err)

      // Stop polling on error
      stopPolling()

      setError(err instanceof Error ? err.message : 'We encountered an issue generating questions. Please try again.')
      setGenerationStatus('error')
    }
  }

  const handleClose = () => {
    // Don't allow closing while generating
    if (generationStatus === 'generating') {
      return
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isRegenerate ? 'Regenerate' : 'Generate'} Questions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Idle State - Confirmation */}
          {generationStatus === 'idle' && (
            <>
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Ready to {isRegenerate ? 'Regenerate' : 'Generate'} Questions
                </h3>
                <p className="text-gray-600">
                  {isRegenerate
                    ? 'This will delete existing questions and generate new ones'
                    : `Generate ${questionCount} questions for this section`}
                </p>
              </div>

              {/* Finalized Section Info */}
              {sectionStatus === 'finalized' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-900">
                        This section is finalized. Regenerating will create a fresh set of questions. You'll need to review and finalize again.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">Section</p>
                  <p className="text-base font-semibold text-gray-900">{sectionName}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">Subject</p>
                  <p className="text-base font-semibold text-gray-900">{subjectName}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Assigned Chapters ({assignedChapters.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {assignedChapters.map((chapter) => (
                      <span
                        key={chapter.id}
                        className="px-2 py-1 bg-white text-gray-700 rounded border border-gray-200 text-sm"
                      >
                        {chapter.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">Target Questions</p>
                  <p className="text-base font-semibold text-gray-900">{questionCount} questions</p>
                  <p className="text-sm text-gray-500 mt-1">
                    AI will generate ~{Math.ceil(questionCount * 1.5)} questions for selection
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-800 font-medium">Error</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant={isRegenerate ? 'destructive' : 'primary'}
                  onClick={handleGenerate}
                  disabled={assignedChapters.length === 0}
                  className="flex-1"
                >
                  {isRegenerate ? 'Regenerate Questions' : 'Generate Questions'}
                </Button>
              </div>
            </>
          )}

          {/* Generating State */}
          {generationStatus === 'generating' && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-6 animate-spin" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Questions...</h3>

              {/* Batch Progress Display */}
              {batchProgress && batchProgress.totalBatches > 1 ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Generated <span className="font-semibold text-blue-600">{batchProgress.questionsGenerated}</span> of <span className="font-semibold">{batchProgress.totalTarget}</span> questions
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    Batch <span className="font-semibold">{batchProgress.batchNumber}</span> of <span className="font-semibold">{batchProgress.totalBatches}</span>
                  </p>

                  {/* Progress Bar */}
                  <div className="max-w-md mx-auto mb-6">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(100, (batchProgress.questionsGenerated / batchProgress.totalTarget) * 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {Math.round((batchProgress.questionsGenerated / batchProgress.totalTarget) * 100)}% complete
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 mb-4">
                  This may take a few minutes. You can close this modal.
                </p>
              )}

              <p className="text-gray-500 text-sm mb-6">
                Processing {assignedChapters.length} {assignedChapters.length === 1 ? 'chapter' : 'chapters'}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Generation continues in the background. You can close this modal and navigate freely. The page will refresh automatically when complete.
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={onClose}
                className="mt-6"
              >
                Close & Continue in Background
              </Button>
            </div>
          )}

          {/* Success State */}
          {generationStatus === 'completed' && generationResult && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Questions Generated!</h3>
              <p className="text-gray-600 mb-6">
                Successfully generated {generationResult.questions_generated} questions
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Chapters Processed:</span>
                    <span className="font-semibold text-green-900">{generationResult.chapters_processed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Questions Generated:</span>
                    <span className="font-semibold text-green-900">{generationResult.questions_generated}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Closing modal...
              </p>
            </div>
          )}

          {/* Error State */}
          {generationStatus === 'error' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Generation Failed</h3>
              <p className="text-gray-600 mb-6">{error}</p>

              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setGenerationStatus('idle')}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
