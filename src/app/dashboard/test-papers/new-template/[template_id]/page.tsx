/**
 * Simplified Paper Creation from Template
 *
 * PHASE 1: Create paper with metadata only
 * - Select classes/batches
 * - Enter paper title, type, difficulty
 * - Creates paper with EMPTY sections (status = 'pending')
 * - Redirects to Paper Dashboard
 *
 * PHASE 2: Per-section workflow (handled in Paper Dashboard)
 * - Each section: Assign chapters → Generate questions
 */

'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireSession } from '@/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MultiSelect, MultiSelectOption } from '@/components/ui/MultiSelect'

interface CreatePaperPageProps {
  params: Promise<{
    template_id: string
  }>
}

interface Template {
  id: string
  name: string
  description: string | null
  stream_id: string
  streams: {
    id: string
    name: string
  }
  sections: Array<{
    id: string
    subject_id: string
    section_type: string
    section_name: string
    section_order: number
    default_question_count: number
    subjects: {
      id: string
      name: string
    }
  }>
}

interface Class {
  id: string
  batch_name: string
  medium: string
  stream_id: string
  streams: {
    id: string
    name: string
  }
  class_levels: {
    id: string
    name: string
  }
}

interface MaterialType {
  id: string
  name: string
}

export default function CreatePaperFromTemplatePage({ params }: CreatePaperPageProps) {
  const resolvedParams = use(params)
  const templateId = resolvedParams.template_id
  const { session } = useRequireSession()
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])
  const [materialTypeId, setMaterialTypeId] = useState<string>('')
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'balanced' | 'hard'>('balanced')

  // Data state
  const [template, setTemplate] = useState<Template | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([])

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchData()
  }, [templateId])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      if (!session) {
        router.push('/auth/login')
        return
      }

      // Fetch template
      const templateResponse = await fetch(`/api/paper-templates/${templateId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      if (!templateResponse.ok) throw new Error('Failed to fetch template')
      const templateData = await templateResponse.json()
      setTemplate(templateData.template)

      // Fetch classes for template's stream
      const classesResponse = await fetch(
        `/api/classes?stream_id=${templateData.template.stream_id}`,
        { headers: { 'Authorization': `Bearer ${session.access_token}` } }
      )
      if (!classesResponse.ok) throw new Error('Failed to fetch classes')
      const classesData = await classesResponse.json()
      setClasses(classesData.classes || [])

      // Fetch material types
      const typesResponse = await fetch('/api/material-types', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      if (!typesResponse.ok) throw new Error('Failed to fetch material types')
      const typesData = await typesResponse.json()
      setMaterialTypes(typesData.materialTypes || [])

    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load form data')
    } finally {
      setIsLoading(false)
    }
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!title.trim()) {
      errors.title = 'Title is required'
    } else if (title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters'
    }

    if (selectedClassIds.length === 0) {
      errors.classes = 'At least one class must be selected'
    }

    if (!materialTypeId) {
      errors.materialType = 'Material type is required'
    }

    if (!difficultyLevel || !['easy', 'balanced', 'hard'].includes(difficultyLevel)) {
      errors.difficultyLevel = 'Please select a difficulty level'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreate = async () => {
    if (!validate()) return

    try {
      setIsCreating(true)
      setError(null)

      if (!session) {
        setError('Session expired. Please sign in again.')
        return
      }

      const response = await fetch('/api/test-papers/create-from-template', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_id: templateId,
          title: title.trim(),
          class_ids: selectedClassIds,
          material_type_id: materialTypeId,
          difficulty_level: difficultyLevel
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setFieldErrors(data.errors)
        }
        throw new Error(data.error || 'Failed to create paper')
      }

      console.log('[CREATE_PAPER_SUCCESS]', data)

      // Redirect to Paper Dashboard
      router.push(`/dashboard/test-papers/${data.paper_id}`)

    } catch (err) {
      console.error('[CREATE_PAPER_ERROR]', err)
      setError(err instanceof Error ? err.message : 'Failed to create paper')
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-gray-900 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const classOptions: MultiSelectOption[] = classes.map(cls => ({
    id: cls.id,
    name: `${cls.streams.name} - ${cls.class_levels.name}${cls.batch_name ? ` (${cls.batch_name})` : ''}`
  }))

  const totalQuestions = template?.sections.reduce((sum, s) => sum + s.default_question_count, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Test Paper</h1>
              <p className="text-sm text-gray-500 mt-1">{template?.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Template Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 mb-1">Template: {template?.name}</p>
                <p className="text-sm text-blue-700 mb-2">
                  This paper will have {template?.sections.length} sections with {totalQuestions} total questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {template?.sections.map((section) => (
                    <span
                      key={section.id}
                      className="px-2 py-1 bg-blue-100 border border-blue-200 rounded text-xs text-blue-800"
                    >
                      {section.section_name}: {section.default_question_count}Q
                    </span>
                  ))}
                </div>
                <p className="text-sm text-blue-700 mt-3 font-medium">
                  ℹ️ Chapters will be assigned per-section after creation
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <Input
            label="Paper Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., REET Mains Level 2 - Practice Test 1"
            required
            error={fieldErrors.title}
            helperText="Give a descriptive title for this test paper"
          />

          {/* Classes */}
          <MultiSelect
            label="Classes / Batches"
            options={classOptions}
            selectedIds={selectedClassIds}
            onChange={setSelectedClassIds}
            placeholder="Select classes this paper is for..."
            required
            error={fieldErrors.classes}
          />

          {/* Material Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paper Type <span className="text-red-500">*</span>
            </label>
            <select
              value={materialTypeId}
              onChange={(e) => setMaterialTypeId(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors ${
                fieldErrors.materialType ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select paper type...</option>
              {materialTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            {fieldErrors.materialType && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.materialType}</p>
            )}
            <p className="mt-1 text-sm text-gray-600">
              Select the format/type of test paper to generate
            </p>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {['easy', 'balanced', 'hard'].map((level) => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="difficultyLevel"
                    value={level}
                    checked={difficultyLevel === level}
                    onChange={(e) => setDifficultyLevel(e.target.value as any)}
                    className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700 capitalize">{level}</span>
                </label>
              ))}
            </div>
            {fieldErrors.difficultyLevel && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.difficultyLevel}</p>
            )}
            <p className="mt-1 text-sm text-gray-600">
              Affects question complexity and discriminator distribution
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => router.back()}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleCreate}
              isLoading={isCreating}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Paper'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
