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
import { SectionStatusBadge } from '@/components/ui/SectionStatusBadge'

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
  section_id: string | null
  section_name: string | null
  section_order: number | null
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
  paper_template_id: string | null
  has_sections: boolean
}

interface Statistics {
  total_generated: number
  selected_count: number
  target_count: number
  remaining: number
}

interface Section {
  id: string
  section_name: string
  section_order: number
  status: 'pending' | 'ready' | 'in_review' | 'finalized'
  question_count: number
  marks_per_question: number
}

export default function ReviewQuestionsPage() {
  const { teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireAuth()
  const router = useRouter()
  const params = useParams()
  const paper_id = params.paper_id as string

  const [paper, setPaper] = useState<PaperInfo | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [sections, setSections] = useState<Section[]>([]) // NEW: Section data with statuses
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
  const [finalizingSectionId, setFinalizingSectionId] = useState<string | null>(null)

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

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
      setSections(data.sections || []) // Set sections if available
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
      // If trying to select (not deselect), check if we've reached the limit
      if (!currentSelection) {
        // Find the question to determine its section
        const question = questions.find(q => q.id === questionId)

        if (paper?.has_sections && question?.section_id) {
          // Multi-section paper: validate per-section
          const sectionQuestions = questions.filter(q => q.section_id === question.section_id)
          const sectionSelectedCount = sectionQuestions.filter(q => q.is_selected).length
          const sectionData = sections.find(s => s.id === question.section_id)
          const sectionTargetCount = sectionData?.question_count || 0

          if (sectionSelectedCount >= sectionTargetCount) {
            const sectionName = sectionData?.section_name || 'This section'
            showToast(`${sectionName} already has ${sectionTargetCount}/${sectionTargetCount} questions selected. Deselect a question first.`, 'warning')
            return
          }
        } else {
          // Legacy single-section paper: validate globally
          const currentSelectedCount = questions.filter(q => q.is_selected).length
          const targetCount = statistics?.target_count || 0

          if (currentSelectedCount >= targetCount) {
            showToast(`You've already selected ${targetCount} questions. Deselect a question first to select another.`, 'warning')
            return
          }
        }
      }

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
        return
      }

      // NEW: If multi-section paper, revert section status to 'in_review' when questions are edited
      if (paper?.has_sections) {
        const question = questions.find(q => q.id === questionId)
        if (question?.section_id) {
          const section = sections.find(s => s.id === question.section_id)
          if (section && section.status === 'finalized') {
            // Revert section to in_review
            await supabase
              .from('test_paper_sections')
              .update({ status: 'in_review', updated_at: new Date().toISOString() })
              .eq('id', question.section_id)

            // Update local state
            setSections(prev => prev.map(s =>
              s.id === question.section_id ? { ...s, status: 'in_review' } : s
            ))

            console.log('[TOGGLE_SELECTION] Reverted section to in_review:', section.section_name)
          }
        }
      }
    } catch (err) {
      console.error('[TOGGLE_SELECTION_ERROR]', err)
      fetchQuestions()
    }
  }

  const handleFinalizeSection = async (sectionId: string, sectionName: string) => {
    // Find section data
    const section = sections.find(s => s.id === sectionId)
    if (!section) {
      alert('Section not found')
      return
    }

    // Calculate expected question count for this section (question_count is the actual count, not marks)
    const expectedCount = section.question_count

    // Count selected questions in this section
    const sectionQuestions = questions.filter(q => q.section_id === sectionId)
    const selectedCount = sectionQuestions.filter(q => q.is_selected).length

    if (selectedCount < expectedCount) {
      alert(`Please select all ${expectedCount} questions for "${sectionName}" before finalizing. Currently selected: ${selectedCount}`)
      return
    }

    if (!confirm(`Finalize section "${sectionName}"? You have selected ${selectedCount} questions.`)) {
      return
    }

    try {
      setFinalizingSectionId(sectionId)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setPageError('Session expired')
        return
      }

      console.log('[FINALIZE_SECTION] Finalizing section:', sectionName)

      const response = await fetch(`/api/test-papers/${paper_id}/sections/${sectionId}/finalize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to finalize section')
      }

      console.log('[FINALIZE_SECTION] Success:', sectionName)

      // Update local section status
      setSections(prev => prev.map(s =>
        s.id === sectionId ? { ...s, status: 'finalized' } : s
      ))

      alert(`Section "${sectionName}" finalized successfully!`)

      // Redirect back to paper dashboard
      router.push(`/dashboard/test-papers/${paper_id}`)
    } catch (err) {
      console.error('[FINALIZE_SECTION_ERROR]', err)
      alert(err instanceof Error ? err.message : 'Failed to finalize section')
    } finally {
      setFinalizingSectionId(null)
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
      router.push(`/dashboard/test-papers/${paper_id}`)
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
  // Use Map for proper chapter deduplication (Set doesn't work with objects)
  const chapterMap = new Map<string, { id: string; name: string }>()
  questions.forEach(q => {
    if (!chapterMap.has(q.chapter_id)) {
      chapterMap.set(q.chapter_id, { id: q.chapter_id, name: q.chapter_name })
    }
  })
  const uniqueChapters = Array.from(chapterMap.values())
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
              href={paper_id ? `/dashboard/test-papers/${paper_id}` : '/dashboard/test-papers'}
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
          <Link href={`/dashboard/test-papers/${paper_id}`} className="text-brand-saffron hover:underline mb-4 inline-block">
            ← Back to Paper Dashboard
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
              {/* Hide global finalize button for multi-section papers (finalize at section level instead) */}
              {!paper.has_sections && statistics && statistics.selected_count === statistics.target_count && (
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
              {/* Show helper text for multi-section papers */}
              {paper.has_sections && (
                <p className="text-sm text-gray-600 text-right">
                  Finalize each section individually below
                </p>
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
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
            <p className="text-neutral-600">No questions match your filters</p>
          </div>
        ) : paper?.has_sections ? (
          // Multi-section paper: Group by sections
          <div className="space-y-8">
            {(() => {
              // Group questions by section
              const sectionGroups = filteredQuestions.reduce((groups, question) => {
                const sectionKey = question.section_id || 'no-section'
                if (!groups[sectionKey]) {
                  groups[sectionKey] = {
                    section_id: question.section_id,
                    section_name: question.section_name || 'Other Questions',
                    section_order: question.section_order ?? 999,
                    questions: []
                  }
                }
                groups[sectionKey].questions.push(question)
                return groups
              }, {} as Record<string, { section_id: string | null; section_name: string; section_order: number; questions: Question[] }>)

              // Sort sections by section_order
              const sortedSections = Object.values(sectionGroups).sort((a, b) => a.section_order - b.section_order)

              return sortedSections.map((section, sectionIndex) => {
                // Find section status data
                const sectionData = sections.find(s => s.id === section.section_id)
                const sectionStatus = sectionData?.status || 'in_review'
                const expectedCount = sectionData ? sectionData.question_count : section.questions.length
                const selectedInSection = section.questions.filter(q => q.is_selected).length
                const canFinalize = selectedInSection >= expectedCount && sectionStatus === 'in_review'

                return (
                  <div key={section.section_id || 'no-section'} className="space-y-4">
                    {/* Section Header */}
                    <div className="bg-white border-l-4 border-brand-saffron rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-gray-900">
                              Section {sectionIndex + 1}: {section.section_name}
                            </h3>
                            {sectionData && <SectionStatusBadge status={sectionStatus} size="sm" />}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {section.questions.length} {section.questions.length === 1 ? 'question' : 'questions'} generated •{' '}
                            {selectedInSection} / {expectedCount} selected
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${selectedInSection >= expectedCount ? 'text-green-600' : 'text-brand-saffron'}`}>
                              {selectedInSection}/{expectedCount}
                            </div>
                            <div className="text-xs text-gray-500">Selected</div>
                          </div>
                          {section.section_id && sectionStatus !== 'finalized' && (
                            <button
                              onClick={() => handleFinalizeSection(section.section_id!, section.section_name)}
                              disabled={!canFinalize || finalizingSectionId === section.section_id}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                canFinalize
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {finalizingSectionId === section.section_id ? (
                                <span className="flex items-center gap-2">
                                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                                  Finalizing...
                                </span>
                              ) : (
                                'Finalize Section'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                  {/* Section Questions */}
                  <div className="space-y-4 pl-4 border-l-4 border-brand-saffron/30">
                    {section.questions.map((question, index) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        index={index + 1}
                        onToggleSelection={toggleSelection}
                        onEdit={setEditingQuestion}
                        onRegenerate={setRegeneratingQuestion}
                        canSelect={question.is_selected || selectedInSection < expectedCount}
                      />
                    ))}
                  </div>
                </div>
              )
              }
              )
            })()}
          </div>
        ) : (
          // Legacy single-subject paper: Show flat list
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index + 1}
                onToggleSelection={toggleSelection}
                onEdit={setEditingQuestion}
                onRegenerate={setRegeneratingQuestion}
                canSelect={question.is_selected || statistics!.selected_count < statistics!.target_count}
              />
            ))}
          </div>
        )}
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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`rounded-lg shadow-lg px-6 py-4 max-w-md ${
            toast.type === 'success' ? 'bg-green-600 text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' :
            'bg-yellow-500 text-white'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {toast.type === 'success' && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {toast.type === 'error' && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {toast.type === 'warning' && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="flex-shrink-0 ml-2 hover:opacity-75"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
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
            disabled={!canSelect}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              question.is_selected
                ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed'
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
