'use client'

/**
 * Create Test Paper - Multi-Step Form
 *
 * Step 1: Select Classes (one or many)
 * Step 2: Select Paper Format (DPP, JEE Mains, JEE Advanced, NEET)
 * Step 3: Select Chapters
 * Final: Display coming soon with all selections
 */

import { useRequireSession } from '@/hooks/useSession'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { MultiSelect, MultiSelectOption } from '@/components/ui/MultiSelect'
import { Input } from '@/components/ui/Input'

interface Chapter {
  id: string
  name: string
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

interface Subject {
  id: string
  name: string
  stream_id: string
}

type Step = 'classes' | 'format' | 'chapters' | 'review'

export default function CreateTestPaperPage() {
  const { session, teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireSession()
  const router = useRouter()
  const params = useParams()
  const subject_id = params.subject_id as string
  const supabase = createBrowserClient()

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>('classes')

  // Form data
  const [title, setTitle] = useState('')
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState<number>(30)
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'balanced' | 'hard'>('balanced')

  // Options data
  const [subject, setSubject] = useState<Subject | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])

  // UI state
  const [loadingData, setLoadingData] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [creating, setCreating] = useState(false)
  const [materialCount, setMaterialCount] = useState<number | null>(null)
  const [loadingMaterialCount, setLoadingMaterialCount] = useState(false)

  useEffect(() => {
    if (teacher && !loading && !teacherLoading && subject_id) {
      fetchFormData()
    }
  }, [teacher, loading, teacherLoading, subject_id])

  useEffect(() => {
    if (currentStep === 'review' && selectedChapterIds.length > 0) {
      fetchMaterialCount()
    }
  }, [currentStep, selectedChapterIds])

  const fetchMaterialCount = async () => {
    try {
      setLoadingMaterialCount(true)

      // Using centralized session (no redundant getSession call)
      if (!session || !teacher) return

      // Query materials via material_chapters junction
      const { data: materials, error } = await supabase
        .from('material_chapters')
        .select('material_id')
        .in('chapter_id', selectedChapterIds)

      if (error) {
        console.error('[MATERIAL_COUNT_ERROR]', error)
        return
      }

      // Count unique material_ids
      const uniqueMaterialIds = new Set(materials?.map(m => m.material_id) || [])
      setMaterialCount(uniqueMaterialIds.size)
    } catch (err) {
      console.error('[MATERIAL_COUNT_EXCEPTION]', err)
    } finally {
      setLoadingMaterialCount(false)
    }
  }

  const fetchFormData = async () => {
    try {
      setLoadingData(true)

      // Using centralized session (no redundant getSession call)
      if (!session) {
        setFormError('Session expired. Please sign in again.')
        return
      }

      // Query subject directly to get stream_id and stream name
      const { data: subjectData, error: subjectError } = await supabaseAdmin
        .from('subjects')
        .select(`
          id,
          name,
          stream_id,
          streams (
            id,
            name
          )
        `)
        .eq('id', subject_id)
        .single()

      if (subjectError || !subjectData) {
        throw new Error('Failed to fetch subject')
      }

      setSubject(subjectData)
      const subjectStreamId = subjectData.stream_id
      const streamName = (subjectData.streams as any)?.name

      if (!subjectStreamId || !streamName) {
        throw new Error('Subject stream_id or stream name not found')
      }

      console.log('[TEST_PAPER_FORM] subject_id=%s stream_id=%s stream_name=%s', subject_id, subjectStreamId, streamName)

      // Fetch classes filtered by stream_id
      const classesResponse = await fetch(`/api/classes?stream_id=${subjectStreamId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!classesResponse.ok) {
        throw new Error('Failed to fetch classes')
      }

      const classesData = await classesResponse.json()
      setClasses(classesData.classes || [])
      console.log('[TEST_PAPER_FORM] classes_count=%s', classesData.classes?.length || 0)

      // Fetch chapters for this subject
      const chaptersResponse = await fetch(`/api/chapters?subject_id=${subject_id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!chaptersResponse.ok) {
        throw new Error('Failed to fetch chapters')
      }

      const chaptersData = await chaptersResponse.json()
      setChapters(chaptersData.chapters || [])
    } catch (err) {
      console.error('[CREATE_PAPER_FETCH_ERROR]', err)
      setFormError(err instanceof Error ? err.message : 'Failed to load form data')
    } finally {
      setLoadingData(false)
    }
  }

  const validateStep = (step: Step): boolean => {
    const errors: Record<string, string> = {}

    if (step === 'classes') {
      if (selectedClassIds.length === 0) {
        errors.classes = 'At least one class must be selected'
      }
    } else if (step === 'format') {
      if (!title.trim()) {
        errors.title = 'Title is required'
      } else if (title.trim().length < 3) {
        errors.title = 'Title must be at least 3 characters'
      }
      if (!questionCount || questionCount < 10 || questionCount > 100) {
        errors.questionCount = 'Question count must be between 10 and 100'
      }
      if (!difficultyLevel || !['easy', 'balanced', 'hard'].includes(difficultyLevel)) {
        errors.difficultyLevel = 'Please select a difficulty level'
      }
    } else if (step === 'chapters') {
      if (selectedChapterIds.length === 0) {
        errors.chapters = 'At least one chapter must be selected'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return
    }

    if (currentStep === 'classes') {
      setCurrentStep('format')
    } else if (currentStep === 'format') {
      setCurrentStep('chapters')
    } else if (currentStep === 'chapters') {
      setCurrentStep('review')
    }
  }

  const handleBack = () => {
    setFieldErrors({})
    if (currentStep === 'format') {
      setCurrentStep('classes')
    } else if (currentStep === 'chapters') {
      setCurrentStep('format')
    } else if (currentStep === 'review') {
      setCurrentStep('chapters')
    }
  }

  const handleCreate = async () => {
    try {
      setCreating(true)
      setFormError(null)

      // Using centralized session (no redundant getSession call)
      if (!session) {
        setFormError('Session expired. Please sign in again.')
        return
      }

      const response = await fetch('/api/test-papers/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          subject_id,
          class_ids: selectedClassIds,
          chapter_ids: selectedChapterIds,
          question_count: questionCount,
          difficulty_level: difficultyLevel,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setFieldErrors(data.errors)
        }
        throw new Error(data.error || 'Failed to create test paper')
      }

      console.log('[CREATE_PAPER_SUCCESS]', data)

      // Redirect to generation page
      router.push(`/dashboard/test-papers/${data.paper_id}/generate`)

    } catch (err) {
      console.error('[CREATE_PAPER_ERROR]', err)
      setFormError(err instanceof Error ? err.message : 'Failed to create test paper')
    } finally {
      setCreating(false)
    }
  }

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state
  if (loading || teacherLoading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  const classOptions: MultiSelectOption[] = classes.map(cls => {
    const stream = cls.streams
    const classLevel = cls.class_levels
    const displayName = `${stream.name} - ${classLevel.name}${cls.batch_name ? ` (${cls.batch_name})` : ''}`
    return {
      id: cls.id,
      name: displayName
    }
  })

  const chapterOptions: MultiSelectOption[] = chapters.map(ch => ({
    id: ch.id,
    name: ch.name
  }))

  const getSelectedClasses = () => {
    return classes.filter(c => selectedClassIds.includes(c.id))
  }

  const getSelectedChapters = () => {
    return chapters.filter(ch => selectedChapterIds.includes(ch.id))
  }

  const getStepNumber = () => {
    switch (currentStep) {
      case 'classes': return 1
      case 'format': return 2
      case 'chapters': return 3
      case 'review': return 4
      default: return 1
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/test-papers/subject/${subject_id}`}>
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-gray-900 hover:text-gray-900">
                  <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">Create Test Paper</h1>
                <p className="text-sm text-neutral-600 mt-0.5">
                  {subject?.name || 'Loading...'} • Step {getStepNumber()} of 4
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {formError && (
          <div className="bg-error/10 border border-error/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-error text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-error font-medium">Error</p>
                <p className="text-error/80 text-sm mt-1">{formError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Progress</span>
            <span className="text-sm text-neutral-600">{getStepNumber()} of 4</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getStepNumber() / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Step 1: Classes */}
          {currentStep === 'classes' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-800 mb-2">Select Classes</h2>
                <p className="text-neutral-600 text-sm">Choose one or more classes for this test paper</p>
              </div>

              <MultiSelect
                label="Classes / Batches"
                options={classOptions}
                selectedIds={selectedClassIds}
                onChange={setSelectedClassIds}
                placeholder="Select classes this paper is for..."
                required
                error={fieldErrors.classes}
              />

              {classes.length === 0 && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                  <p className="text-warning text-sm">No classes found. Please contact your administrator.</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNext}
                  disabled={classes.length === 0}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-white">Next: Paper Format</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Paper Format */}
          {currentStep === 'format' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-800 mb-2">Paper Details</h2>
                <p className="text-neutral-600 text-sm">Enter paper title and select format</p>
              </div>

              {/* Title Input */}
              <Input
                label="Paper Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Physics DPP - Motion in a Straight Line"
                required
                error={fieldErrors.title}
                helperText="Give a descriptive title for this test paper"
              />

              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Questions <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    fieldErrors.questionCount ? 'border-error' : 'border-gray-300'
                  }`}
                  required
                />
                {fieldErrors.questionCount && (
                  <p className="mt-1 text-sm text-error">{fieldErrors.questionCount}</p>
                )}
                <p className="mt-1 text-sm text-neutral-600">
                  Range: 10-100 questions
                </p>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="difficultyLevel"
                      value="easy"
                      checked={difficultyLevel === 'easy'}
                      onChange={(e) => setDifficultyLevel(e.target.value as 'easy' | 'balanced' | 'hard')}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Easy</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="difficultyLevel"
                      value="balanced"
                      checked={difficultyLevel === 'balanced'}
                      onChange={(e) => setDifficultyLevel(e.target.value as 'easy' | 'balanced' | 'hard')}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Balanced</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="difficultyLevel"
                      value="hard"
                      checked={difficultyLevel === 'hard'}
                      onChange={(e) => setDifficultyLevel(e.target.value as 'easy' | 'balanced' | 'hard')}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Hard</span>
                  </label>
                </div>
                {fieldErrors.difficultyLevel && (
                  <p className="mt-1 text-sm text-error">{fieldErrors.difficultyLevel}</p>
                )}
                <p className="mt-1 text-sm text-neutral-600">
                  Affects question complexity and discriminator distribution
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                >
                  <span className="text-white">Next: Select Chapters</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Chapters */}
          {currentStep === 'chapters' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-800 mb-2">Select Chapters</h2>
                <p className="text-neutral-600 text-sm">Choose chapters to include in this paper</p>
              </div>

              <MultiSelect
                label="Chapters"
                options={chapterOptions}
                selectedIds={selectedChapterIds}
                onChange={setSelectedChapterIds}
                placeholder="Select chapters this paper will cover..."
                required
                error={fieldErrors.chapters}
              />

              {chapters.length === 0 && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                  <p className="text-warning text-sm">No chapters found for this subject. Please contact your administrator.</p>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={chapters.length === 0}
                  className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-white">Review & Create</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review (Coming Soon) */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🚀</span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">Coming Soon!</h2>
                <p className="text-neutral-600 mb-8">Here's a summary of your test paper configuration</p>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                {/* Title */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-neutral-600 mb-1">Paper Title</p>
                  <p className="text-lg font-semibold text-neutral-800">{title}</p>
                </div>

                {/* Subject */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-neutral-600 mb-1">Subject</p>
                  <p className="text-lg font-semibold text-neutral-800">{subject?.name}</p>
                </div>

                {/* Test Configuration */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-neutral-600 mb-2">Test Configuration</p>
                  <div className="flex items-center gap-2 text-neutral-800">
                    <span className="text-base font-semibold">{questionCount} questions</span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-base font-semibold capitalize">{difficultyLevel} difficulty</span>
                  </div>
                </div>

                {/* Study Materials */}
                <div className={`border rounded-lg p-4 ${materialCount === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`text-xl ${materialCount === 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {materialCount === 0 ? '⚠️' : '✅'}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium mb-1 ${materialCount === 0 ? 'text-yellow-800' : 'text-green-800'}`}>
                        Study Materials Status
                      </p>
                      {loadingMaterialCount ? (
                        <p className="text-sm text-neutral-700">Checking materials...</p>
                      ) : materialCount !== null ? (
                        <>
                          <p className={`text-sm ${materialCount === 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                            {materialCount} {materialCount === 1 ? 'material' : 'materials'} found across {selectedChapterIds.length} selected {selectedChapterIds.length === 1 ? 'chapter' : 'chapters'}
                          </p>
                          {materialCount === 0 && (
                            <p className="text-sm text-yellow-800 mt-2 font-medium">
                              No materials found. Please upload materials before generating questions.
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-green-700">
                          Materials from {selectedChapterIds.length} selected {selectedChapterIds.length === 1 ? 'chapter' : 'chapters'} will be used
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Classes */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-neutral-600 mb-2">Classes ({selectedClassIds.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {getSelectedClasses().map((cls) => (
                      <span
                        key={cls.id}
                        className="px-3 py-1 bg-white text-neutral-700 rounded-lg border border-neutral-200 text-sm font-medium"
                      >
                        {cls.class_levels.name}{cls.batch_name ? ` - ${cls.batch_name}` : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Chapters */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-neutral-600 mb-2">Chapters ({selectedChapterIds.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {getSelectedChapters().map((chapter) => (
                      <span
                        key={chapter.id}
                        className="px-3 py-1 bg-white text-neutral-700 rounded-lg border border-neutral-200 text-sm font-medium"
                      >
                        {chapter.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={materialCount === 0 || creating}
                  className={`flex-1 px-6 py-3 rounded-lg transition-all font-medium shadow-md ${
                    materialCount === 0 || creating
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700'
                  }`}
                  title={materialCount === 0 ? 'Please upload materials before creating test paper' : ''}
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2 text-gray-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-gray-500 border-r-transparent"></div>
                      Creating...
                    </span>
                  ) : (
                    <span className={materialCount === 0 ? 'text-gray-500' : 'text-white'}>Create Test Paper</span>
                  )}
                </button>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex gap-3">
                  <span className="text-blue-600 text-xl">💡</span>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">What happens next?</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Once this feature is complete, you'll be able to generate AI-powered questions,
                      select from the generated pool, and export professional PDFs with solution sheets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
