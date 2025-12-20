'use client'

/**
 * Teacher Review Interface (Phase 5)
 *
 * Allows teachers to:
 * - Review all generated questions
 * - Select/deselect questions for the final paper
 * - Edit questions manually
 * - Regenerate questions with AI assistance
 * - Filter by chapter, difficulty, archetype
 * - Finalize selection when exactly targetCount questions selected
 */

import { useRequireAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { Modal } from '@/components/ui/Modal'

interface Question {
  id: string
  question_text: string
  options: Record<string, string>
  correct_answer: string
  explanation: string
  marks: number
  negative_marks: number
  question_order: number
  is_selected: boolean
  created_at: string
  chapter_id: string
  chapter_name: string
  archetype: string
  structural_form: string
  cognitive_load: string
  difficulty: string
  ncert_fidelity: string
}

interface PaperInfo {
  id: string
  title: string
  question_count: number
  difficulty_level: string
  status: string
  subject_id: string
}

interface Statistics {
  total_generated: number
  selected_count: number
  target_count: number
  remaining: number
}

export default function ReviewQuestionsPage() {
  const { teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireAuth()
  const router = useRouter()
  const params = useParams()
  const paper_id = params.paper_id as string

  const [paper, setPaper] = useState<PaperInfo | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  // Filter states
  const [filterChapter, setFilterChapter] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterArchetype, setFilterArchetype] = useState<string>('all')
  const [showOnlySelected, setShowOnlySelected] = useState(false)

  // Modal states
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [regeneratingQuestion, setRegeneratingQuestion] = useState<Question | null>(null)
  const [regenerationInstruction, setRegenerationInstruction] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Finalize states
  const [finalizing, setFinalizing] = useState(false)

  useEffect(() => {
    if (teacher && !loading && !teacherLoading && paper_id) {
      fetchQuestions()
    }
  }, [teacher, loading, teacherLoading, paper_id])

  const fetchQuestions = async () => {
    try {
      setLoadingData(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setPageError('Session expired. Please sign in again.')
        return
      }

      const response = await fetch(`/api/test-papers/${paper_id}/questions`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch questions')
      }

      console.log('[REVIEW_QUESTIONS_UI] Fetched', data.questions.length, 'questions')

      setPaper(data.paper)
      setQuestions(data.questions)
      setStatistics(data.statistics)
    } catch (err) {
      console.error('[FETCH_QUESTIONS_ERROR]', err)
      setPageError(err instanceof Error ? err.message : 'Failed to load questions')
    } finally {
      setLoadingData(false)
    }
  }

  const toggleSelection = async (questionId: string, currentSelection: boolean) => {
    try {
      // Optimistic update
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, is_selected: !currentSelection } : q
      ))

      const newSelectedCount = questions.filter(q =>
        q.id === questionId ? !currentSelection : q.is_selected
      ).length

      setStatistics(prev => prev ? {
        ...prev,
        selected_count: newSelectedCount,
        remaining: Math.max(0, prev.target_count - newSelectedCount),
      } : null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setPageError('Session expired')
        return
      }

      // Update in database
      const { error } = await supabase
        .from('questions')
        .update({ is_selected: !currentSelection })
        .eq('id', questionId)

      if (error) {
        console.error('[TOGGLE_SELECTION_ERROR]', error)
        // Rollback optimistic update
        fetchQuestions()
      }
    } catch (err) {
      console.error('[TOGGLE_SELECTION_ERROR]', err)
      fetchQuestions()
    }
  }

  const handleFinalize = async () => {
    if (!statistics || statistics.selected_count !== statistics.target_count) {
      alert(`Please select exactly ${statistics?.target_count} questions before finalizing.`)
      return
    }

    if (!confirm(`Finalize selection of ${statistics.selected_count} questions? This will generate a PDF and change the paper status to "finalized".`)) {
      return
    }

    try {
      setFinalizing(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setPageError('Session expired')
        return
      }

      console.log('[FINALIZE] Step 1: Finalizing paper status...')

      // Step 1: Finalize paper (change status to finalized)
      const finalizeResponse = await fetch(`/api/test-papers/${paper_id}/finalize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const finalizeData = await finalizeResponse.json()

      if (!finalizeResponse.ok) {
        throw new Error(finalizeData.error || 'Failed to finalize selection')
      }

      console.log('[FINALIZE] Step 2: Generating PDF...')

      // Step 2: Generate PDF automatically
      const pdfResponse = await fetch(`/api/test-papers/${paper_id}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const pdfData = await pdfResponse.json()

      if (!pdfResponse.ok) {
        console.error('[FINALIZE] PDF generation failed, rolling back...')

        // ROLLBACK: Reopen paper (change status back to review)
        await fetch(`/api/test-papers/${paper_id}/reopen`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        })

        throw new Error(`PDF generation failed: ${pdfData.error || 'Unknown error'}. Paper not finalized.`)
      }

      console.log('[FINALIZE] Success! PDF generated:', pdfData.pdf_url)

      alert('Selection finalized and PDF generated successfully!')
      router.push(`/dashboard/test-papers/subject/${paper.subject_id}`)
    } catch (err) {
      console.error('[FINALIZE_ERROR]', err)
      alert(err instanceof Error ? err.message : 'Failed to finalize selection')
    } finally {
      setFinalizing(false)
    }
  }

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    if (filterChapter !== 'all' && q.chapter_id !== filterChapter) return false
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false
    if (filterArchetype !== 'all' && q.archetype !== filterArchetype) return false
    if (showOnlySelected && !q.is_selected) return false
    return true
  })

  // Get unique values for filters
  const uniqueChapters = Array.from(new Set(questions.map(q => ({ id: q.chapter_id, name: q.chapter_name }))))
  const uniqueDifficulties = Array.from(new Set(questions.map(q => q.difficulty)))
  const uniqueArchetypes = Array.from(new Set(questions.map(q => q.archetype)))

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state
  if (loading || teacherLoading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-saffron border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (pageError || !paper) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-red-50 border border-red-200 p-6">
            <p className="text-red-800 font-medium">{pageError || 'Paper not found'}</p>
            <Link
              href={paper?.subject_id ? `/dashboard/test-papers/subject/${paper.subject_id}` : '/dashboard/test-papers'}
              className="mt-4 inline-block text-brand-saffron hover:underline"
            >
              ← Back to Papers
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/dashboard/test-papers/subject/${paper.subject_id}`} className="text-brand-saffron hover:underline mb-4 inline-block">
            ← Back to Papers
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{paper.title}</h1>
              <p className="text-neutral-600 mt-2">Review and select questions for your test paper</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`px-4 py-2 rounded-lg ${
                statistics && statistics.selected_count === statistics.target_count
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : 'bg-blue-50 border-blue-300 text-blue-800'
              } border-2 font-semibold text-lg`}>
                {statistics?.selected_count} / {statistics?.target_count} selected
              </div>
              {statistics && statistics.selected_count === statistics.target_count && (
                <button
                  onClick={handleFinalize}
                  disabled={finalizing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {finalizing ? (
                    <span className="flex items-center gap-2">
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      Finalizing & Generating PDF...
                    </span>
                  ) : (
                    'Finalize Selection ✓'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Statistics</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-neutral-600">Total Generated</p>
              <p className="text-2xl font-bold text-neutral-900">{statistics?.total_generated}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Selected</p>
              <p className="text-2xl font-bold text-green-600">{statistics?.selected_count}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Target</p>
              <p className="text-2xl font-bold text-blue-600">{statistics?.target_count}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Remaining</p>
              <p className="text-2xl font-bold text-orange-600">{statistics?.remaining}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Filters</h2>
          <div className="grid grid-cols-4 gap-4">
            {/* Chapter Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Chapter</label>
              <select
                value={filterChapter}
                onChange={(e) => setFilterChapter(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-saffron"
              >
                <option value="all">All Chapters</option>
                {uniqueChapters.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.name}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Difficulty</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-saffron"
              >
                <option value="all">All Difficulties</option>
                {uniqueDifficulties.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Archetype Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Archetype</label>
              <select
                value={filterArchetype}
                onChange={(e) => setFilterArchetype(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-saffron"
              >
                <option value="all">All Archetypes</option>
                {uniqueArchetypes.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Show Only Selected */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlySelected}
                  onChange={(e) => setShowOnlySelected(e.target.checked)}
                  className="w-5 h-5 text-brand-saffron focus:ring-brand-saffron rounded"
                />
                <span className="text-sm font-medium text-neutral-700">Show only selected</span>
              </label>
            </div>
          </div>
          <p className="text-sm text-neutral-600 mt-3">
            Showing {filteredQuestions.length} of {questions.length} questions
          </p>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
              <p className="text-neutral-600">No questions match your filters</p>
            </div>
          ) : (
            filteredQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index + 1}
                onToggleSelection={toggleSelection}
                onEdit={setEditingQuestion}
                onRegenerate={setRegeneratingQuestion}
                canSelect={!question.is_selected || statistics!.selected_count <= statistics!.target_count}
              />
            ))
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSave={() => {
            setEditingQuestion(null)
            fetchQuestions()
          }}
        />
      )}

      {/* Regenerate Modal */}
      {regeneratingQuestion && (
        <RegenerateQuestionModal
          question={regeneratingQuestion}
          onClose={() => {
            setRegeneratingQuestion(null)
            setRegenerationInstruction('')
          }}
          onRegenerate={() => {
            setRegeneratingQuestion(null)
            setRegenerationInstruction('')
            fetchQuestions()
          }}
        />
      )}
    </div>
  )
}

// Question Card Component
interface QuestionCardProps {
  question: Question
  index: number
  onToggleSelection: (id: string, currentSelection: boolean) => void
  onEdit: (question: Question) => void
  onRegenerate: (question: Question) => void
  canSelect: boolean
}

function QuestionCard({ question, index, onToggleSelection, onEdit, onRegenerate, canSelect }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
      question.is_selected ? 'border-green-400' : 'border-neutral-200'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-sm font-bold text-neutral-500">Q{question.question_order}</span>
            <div className="flex-1">
              <div className="prose prose-sm max-w-none">
                <p className="text-neutral-900 whitespace-pre-wrap">{question.question_text}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {question.is_selected && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                ✓ Selected
              </span>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              {expanded ? '▼' : '▶'}
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2 mb-4">
          {Object.entries(question.options).map(([key, value]) => (
            <div
              key={key}
              className={`px-4 py-2 rounded-lg ${
                key === question.correct_answer
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-neutral-50 border border-neutral-200'
              }`}
            >
              <span className="font-medium text-neutral-700">{key}</span>
              <span className="ml-2 text-neutral-900">{value}</span>
              {key === question.correct_answer && (
                <span className="ml-2 text-green-600 font-medium">✓ Correct</span>
              )}
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
            {question.chapter_name}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
            {question.archetype}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
            {question.structural_form}
          </span>
          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
            {question.difficulty}
          </span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
            {question.cognitive_load} load
          </span>
        </div>

        {/* Explanation (expandable) */}
        {expanded && question.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Explanation:</p>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">{question.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleSelection(question.id, question.is_selected)}
            disabled={!canSelect && !question.is_selected}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              question.is_selected
                ? 'bg-red-600 text-white hover:bg-red-700'
                : canSelect
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {question.is_selected ? 'Remove' : 'Select'}
          </button>
          <button
            onClick={() => onEdit(question)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => onRegenerate(question)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700"
          >
            Regenerate with AI
          </button>
        </div>
      </div>
    </div>
  )
}

// Edit Question Modal Component
interface EditQuestionModalProps {
  question: Question
  onClose: () => void
  onSave: () => void
}

function EditQuestionModal({ question, onClose, onSave }: EditQuestionModalProps) {
  const [questionText, setQuestionText] = useState(question.question_text)
  const [options, setOptions] = useState(question.options)
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer)
  const [explanation, setExplanation] = useState(question.explanation)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Session expired')
        return
      }

      const response = await fetch(`/api/questions/${question.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_text: questionText,
          options,
          correct_answer: correctAnswer,
          explanation,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update question')
      }

      onSave()
    } catch (err) {
      console.error('[SAVE_QUESTION_ERROR]', err)
      alert(err instanceof Error ? err.message : 'Failed to save question')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Question"
    >
      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Question Text</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-saffron"
          />
        </div>

        {/* Options */}
        {Object.entries(options).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Option {key}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-saffron"
            />
          </div>
        ))}

        {/* Correct Answer */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Correct Answer</label>
          <select
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-saffron"
          >
            {Object.keys(options).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Explanation</label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-saffron"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// Regenerate Question Modal Component
interface RegenerateQuestionModalProps {
  question: Question
  onClose: () => void
  onRegenerate: () => void
}

function RegenerateQuestionModal({ question, onClose, onRegenerate }: RegenerateQuestionModalProps) {
  const [instruction, setInstruction] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  const handleRegenerate = async () => {
    if (!instruction.trim()) {
      alert('Please provide instructions for regeneration')
      return
    }

    try {
      setRegenerating(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Session expired')
        return
      }

      const response = await fetch(`/api/questions/${question.id}/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instruction }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate question')
      }

      onRegenerate()
    } catch (err) {
      console.error('[REGENERATE_QUESTION_ERROR]', err)
      alert(err instanceof Error ? err.message : 'Failed to regenerate question')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Regenerate Question with AI"
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-600">
          Provide instructions to guide AI in regenerating this question. For example:
          "Make it harder", "Add more technical terms", "Change the focus to mechanism instead of definition"
        </p>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Instructions</label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="E.g., Make this question harder and focus on application"
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-saffron"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleRegenerate}
            disabled={regenerating || !instruction.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
          >
            {regenerating ? 'Regenerating...' : 'Regenerate Question'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
