'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

interface AddChapterModalProps {
  isOpen: boolean
  onClose: () => void
  subjectId: string
  onSuccess: (chapter: any) => void
}

export function AddChapterModal({
  isOpen,
  onClose,
  subjectId,
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
      const { data: { session } } = await supabase.auth.getSession()
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
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!chapterName.trim()}
          >
            Add Chapter
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Chapter Name"
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
          onBlur={handleBlur}
          placeholder="e.g., Tenses, Cell Biology"
          required
          error={error}
          disabled={isSubmitting}
          autoFocus
        />

        {/* Show normalized preview if different from input */}
        {chapterName && chapterName !== normalizedName && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Will be saved as: <span className="font-semibold">{normalizedName}</span>
            </p>
          </div>
        )}

        {/* Warning for duplicate */}
        {warning && (
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">{warning}</p>
          </div>
        )}

        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            💡 Tip: Chapter names are automatically formatted (first letter capitalized).
            Duplicate names are prevented to keep your library organized.
          </p>
        </div>
      </form>
    </Modal>
  )
}
