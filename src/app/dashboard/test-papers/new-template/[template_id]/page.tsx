'use client'

/**
 * Modern Paper Creation from Template
 *
 * PHASE 1: Create paper with metadata only
 * Features:
 * - Modern card-based form layout with animations
 * - Visual template preview with section breakdown
 * - Segmented control for difficulty selection
 * - Enhanced multi-select for classes
 * - Inline validation with helpful error messages
 * - Smooth loading states and transitions
 *
 * PHASE 2: Per-section workflow (handled in Paper Dashboard)
 * - Each section: Assign chapters → Generate questions
 */

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, FileText, Layers, Hash, BookOpen, Zap, BarChart3, AlertCircle, CheckCircle2, GraduationCap } from 'lucide-react'
import { useRequireSession } from '@/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MultiSelect, MultiSelectOption } from '@/components/ui/MultiSelect'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

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

// Subject-specific colors
const getSubjectColor = (subjectName: string) => {
  const name = subjectName.toLowerCase()

  if (name.includes('physics')) {
    return {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    }
  } else if (name.includes('chemistry')) {
    return {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200'
    }
  } else if (name.includes('biology')) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200'
    }
  } else if (name.includes('math')) {
    return {
      bg: 'bg-primary-50',
      text: 'text-primary-700',
      border: 'border-primary-200'
    }
  } else {
    return {
      bg: 'bg-neutral-50',
      text: 'text-neutral-700',
      border: 'border-neutral-200'
    }
  }
}

// Difficulty level config
const difficultyOptions = [
  {
    value: 'easy' as const,
    label: 'Easy',
    icon: Zap,
    description: 'More foundational questions'
  },
  {
    value: 'balanced' as const,
    label: 'Balanced',
    icon: BarChart3,
    description: 'Mix of easy, medium, hard'
  },
  {
    value: 'hard' as const,
    label: 'Hard',
    icon: Layers,
    description: 'More challenging questions'
  }
]

export default function CreatePaperFromTemplatePage({ params }: CreatePaperPageProps) {
  const resolvedParams = use(params)
  const templateId = resolvedParams.template_id
  const { session, loading, teacherLoading } = useRequireSession()
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
    // Only fetch when auth is fully loaded
    // Prevents race condition with useRequireSession redirect logic
    if (session && !loading && !teacherLoading) {
      fetchData()
    }
  }, [session, loading, teacherLoading, templateId])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Session is guaranteed to exist here due to useEffect guard above
      // No need for manual redirect - useRequireSession handles it

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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  // Error state (no template loaded)
  if (error && !template) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center"
      >
        <div className="w-20 h-20 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-error-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-3">Error Loading Template</h2>
        <p className="text-neutral-600 mb-6 max-w-md mx-auto">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </motion.div>
    )
  }

  const classOptions: MultiSelectOption[] = classes.map(cls => ({
    id: cls.id,
    name: `${cls.streams.name} - ${cls.class_levels.name}${cls.batch_name ? ` (${cls.batch_name})` : ''}`
  }))

  const totalQuestions = template?.sections.reduce((sum, s) => sum + s.default_question_count, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3 text-neutral-600">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary-600 transition-colors text-gray-900 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </button>
        </div>
        <h1 className="text-4xl font-bold text-neutral-900">Create Test Paper</h1>
        <p className="text-lg text-neutral-600">
          Configure your test paper based on the <span className="font-semibold text-neutral-900">{template?.name}</span> template
        </p>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-error-50 border border-error-200 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-error-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-error-900 mb-1">Error Creating Paper</h3>
                <p className="text-error-700 text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Paper Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Paper Details</h2>
                <p className="text-sm text-neutral-600">Configure your test paper settings</p>
              </div>
            </div>

            {/* Title Input */}
            <Input
              label="Paper Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., REET Mains Level 2 - Practice Test 1"
              required
              error={fieldErrors.title}
              helperText="Give a descriptive title for this test paper"
              leftIcon={<FileText className="h-5 w-5" />}
            />

            {/* Classes Multi-Select */}
            <MultiSelect
              label="Classes / Batches"
              options={classOptions}
              selectedIds={selectedClassIds}
              onChange={setSelectedClassIds}
              placeholder="Select classes this paper is for..."
              required
              error={fieldErrors.classes}
            />

            {/* Material Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Paper Type <span className="text-error-600">*</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                <select
                  value={materialTypeId}
                  onChange={(e) => setMaterialTypeId(e.target.value)}
                  className={cn(
                    'w-full pl-11 pr-4 py-3 border rounded-xl transition-all',
                    'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                    'appearance-none bg-white cursor-pointer',
                    fieldErrors.materialType ? 'border-error-500' : 'border-neutral-300'
                  )}
                  required
                >
                  <option value="">Select paper type...</option>
                  {materialTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {fieldErrors.materialType ? (
                <p className="mt-1.5 text-sm text-error-600">{fieldErrors.materialType}</p>
              ) : (
                <p className="mt-1.5 text-sm text-neutral-600">
                  Select the format/type of test paper to generate
                </p>
              )}
            </div>

            {/* Difficulty Level - Segmented Control */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Difficulty Level <span className="text-error-600">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {difficultyOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = difficultyLevel === option.value

                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficultyLevel(option.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'relative p-4 rounded-xl border-2 transition-all text-left',
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <CheckCircle2 className="h-5 w-5 text-primary-600" />
                        </motion.div>
                      )}
                      <Icon className={cn(
                        'h-6 w-6 mb-2',
                        isSelected ? 'text-primary-600' : 'text-neutral-400'
                      )} />
                      <p className={cn(
                        'font-semibold text-sm mb-1',
                        isSelected ? 'text-primary-900' : 'text-neutral-900'
                      )}>
                        {option.label}
                      </p>
                      <p className={cn(
                        'text-xs',
                        isSelected ? 'text-primary-700' : 'text-neutral-600'
                      )}>
                        {option.description}
                      </p>
                    </motion.button>
                  )
                })}
              </div>
              {fieldErrors.difficultyLevel && (
                <p className="mt-1.5 text-sm text-error-600">{fieldErrors.difficultyLevel}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.back()}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleCreate}
              isLoading={isCreating}
              disabled={isCreating}
            >
              {isCreating ? 'Creating Paper...' : 'Create Paper'}
            </Button>
          </div>
        </motion.div>

        {/* Template Preview Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Template Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <Layers className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900">Template Preview</h3>
                <p className="text-xs text-neutral-600">{template?.name}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4 text-primary-600" />
                  <p className="text-xs font-medium text-primary-700">Sections</p>
                </div>
                <p className="text-2xl font-bold text-primary-900">{template?.sections.length}</p>
              </div>
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="h-4 w-4 text-primary-600" />
                  <p className="text-xs font-medium text-primary-700">Questions</p>
                </div>
                <p className="text-2xl font-bold text-primary-900">{totalQuestions}</p>
              </div>
            </div>

            {/* Sections List */}
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Template Structure
              </p>
              <div className="space-y-2">
                {template?.sections.map((section, index) => {
                  const subjectColor = getSubjectColor(section.subjects.name)

                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border',
                        subjectColor.bg,
                        subjectColor.border
                      )}
                    >
                      <div className={cn(
                        'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 font-bold text-xs',
                        subjectColor.text,
                        'bg-white/70'
                      )}>
                        {section.section_order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('font-semibold text-xs truncate', subjectColor.text)}>
                          {section.section_name}
                        </p>
                        <p className="text-xs text-neutral-600 truncate">
                          {section.subjects.name}
                        </p>
                      </div>
                      <div className={cn(
                        'px-2 py-0.5 rounded text-xs font-bold',
                        'bg-white/70',
                        subjectColor.text
                      )}>
                        {section.default_question_count}Q
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-primary-50 border border-primary-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary-900 mb-1">Next Steps</h4>
                <p className="text-xs text-primary-700 leading-relaxed">
                  After creating the paper, you'll assign chapters to each section and then generate questions.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
