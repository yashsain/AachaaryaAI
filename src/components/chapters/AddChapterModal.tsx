'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { Session } from '@supabase/supabase-js'

interface AddChapterModalProps {
  isOpen: boolean
  onClose: () => void
  subjectId: string
  session: Session  // Session from parent (centralized)
  onSuccess: (chapter: any) => void
}

export function AddChapterModal({
  isOpen,
  onClose,
  subjectId,
  session,
  onSuccess
}: AddChapterModalProps) {
  const [chapterName, setChapterName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setChapterName('')
      setError('')
      setWarning('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  // Normalize chapter name for preview
  const normalizedName = chapterName.trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  // Auto-capitalize on blur
  const handleBlur = () => {
    if (chapterName.trim()) {
      setChapterName(normalizedName)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setWarning('')

    if (!chapterName.trim()) {
      setError('Chapter name is required')
      return
    }

    setIsSubmitting(true)

    try {
      if (!session) {
        throw new Error('Session expired. Please sign in again.')
      }

      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          subject_id: subjectId,
          name: chapterName.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create chapter')
      }

      // If chapter already existed, show warning but still success
      if (data.existed) {
        setWarning(data.message || 'Chapter already exists')
        // Wait a moment to show the message
        setTimeout(() => {
          onSuccess(data.chapter)
          onClose()
        }, 1500)
      } else {
        // New chapter created
        onSuccess(data.chapter)
        onClose()
      }
    } catch (err) {
      console.error('Failed to create chapter:', err)
      setError(err instanceof Error ? err.message : 'Failed to create chapter')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Chapter"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!chapterName.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl"
          >
            Add Chapter
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-700">
            Chapter Name
          </label>
          <input
            type="text"
            value={chapterName}
            onChange={(e) => setChapterName(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g., Tenses, Cell Biology"
            required
            disabled={isSubmitting}
            autoFocus
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-neutral-900 placeholder:text-neutral-400 disabled:bg-neutral-50 disabled:cursor-not-allowed"
          />
          {error && (
            <p className="text-sm text-error-600 mt-1">{error}</p>
          )}
        </div>

        {/* Show normalized preview if different from input */}
        {chapterName && chapterName !== normalizedName && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium">Preview</p>
                <p className="text-sm text-blue-800 mt-1">
                  Will be saved as: <span className="font-bold">{normalizedName}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning for duplicate */}
        {warning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-yellow-800 mt-0.5">{warning}</p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-neutral-50 to-blue-50/50 border border-neutral-200 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-neutral-700 mb-1">Quick Tip</p>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Chapter names are automatically formatted with proper capitalization.
                Duplicate names are prevented to keep your library organized.
              </p>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
