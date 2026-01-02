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

import { useRequireSession } from '@/hooks/useSession'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { Modal } from '@/components/ui/Modal'
import { SectionStatusBadge } from '@/components/ui/SectionStatusBadge'
import { Button } from '@/components/ui/Button'
import { createBrowserClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/toast'

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
  const { session, teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const paper_id = params.paper_id as string
  const section_id = searchParams.get('section_id') // Extract section_id from URL query params
  const supabase = createBrowserClient()

  const [paper, setPaper] = useState<PaperInfo | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [sections, setSections] = useState<Section[]>([]) // Section data with statuses
  const [currentSection, setCurrentSection] = useState<Section | null>(null) // Current section being viewed
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

  useEffect(() => {
    if (teacher && !loading && !teacherLoading && paper_id) {
      fetchQuestions()
    }
  }, [teacher, loading, teacherLoading, paper_id])

  // Validate section_id for multi-section papers
  useEffect(() => {
    if (!loadingData && paper) {
      // For multi-section papers, require section_id parameter
      if (paper.has_sections && !section_id) {
        setPageError('This paper has multiple sections. Please select a specific section to review from the dashboard.')
        setTimeout(() => {
          router.push(`/dashboard/test-papers/${paper_id}`)
        }, 3000)
      }
    }
  }, [loadingData, paper, section_id, paper_id, router])

  // Keep currentSection in sync with sections array
  // This ensures finalize button appears when section status changes from 'finalized' to 'in_review'
  useEffect(() => {
    if (section_id && sections.length > 0) {
      const updatedSection = sections.find(s => s.id === section_id)
      if (updatedSection) {
        setCurrentSection(updatedSection)
      }
    }
  }, [section_id, sections])

  const fetchQuestions = async () => {
    try {
      setLoadingData(true)

      // Using centralized session from useRequireSession hook (no redundant getSession call)
      if (!session) {
        setPageError('Session expired. Please sign in again.')
        return
      }

      // Build API URL with section_id if provided
      const apiUrl = section_id
        ? `/api/test-papers/${paper_id}/questions?section_id=${section_id}`
        : `/api/test-papers/${paper_id}/questions`

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch questions')
      }

      console.log('[REVIEW_QUESTIONS_UI] Fetched', data.questions.length, 'questions', section_id ? `for section ${section_id}` : 'for all sections')

      setPaper(data.paper)
      setQuestions(data.questions)
      setSections(data.sections || []) // Set sections if available
      setCurrentSection(data.current_section || null) // Set current section if viewing specific section
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
            toast.warning(`${sectionName} already has ${sectionTargetCount}/${sectionTargetCount} questions selected. Deselect a question first.`, {
              duration: 4000,
            })
            return
          }
        } else {
          // Legacy single-section paper: validate globally
          const currentSelectedCount = questions.filter(q => q.is_selected).length
          const targetCount = statistics?.target_count || 0

          if (currentSelectedCount >= targetCount) {
            toast.warning(`You've already selected ${targetCount} questions. Deselect a question first to select another.`, {
              duration: 4000,
            })
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

      // Using centralized session (no redundant getSession call)
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
      toast.error('Section not found')
      return
    }

    // Calculate expected question count for this section (question_count is the actual count, not marks)
    const expectedCount = section.question_count

    // Count selected questions in this section
    const sectionQuestions = questions.filter(q => q.section_id === sectionId)
    const selectedCount = sectionQuestions.filter(q => q.is_selected).length

    if (selectedCount < expectedCount) {
      toast.warning(`Please select all ${expectedCount} questions for "${sectionName}" before finalizing. Currently selected: ${selectedCount}`, {
        duration: 5000,
      })
      return
    }

    try {
      setFinalizingSectionId(sectionId)

      // Using centralized session (no redundant getSession call)
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

      // Show success toast
      toast.success(`Section "${sectionName}" finalized successfully!`, {
        duration: 4000,
      })

      // Redirect back to paper dashboard
      router.push(`/dashboard/test-papers/${paper_id}`)
    } catch (err) {
      console.error('[FINALIZE_SECTION_ERROR]', err)
      toast.error(err instanceof Error ? err.message : 'Failed to finalize section')
    } finally {
      setFinalizingSectionId(null)
    }
  }

  const handleFinalize = async () => {
    if (!statistics || statistics.selected_count !== statistics.target_count) {
      toast.warning(`Please select exactly ${statistics?.target_count} questions before finalizing.`, {
        duration: 5000,
      })
      return
    }

    try {
      setFinalizing(true)

      // Using centralized session (no redundant getSession call)
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

      // Show success toast
      toast.success('Selection finalized and PDF generated successfully!', {
        duration: 5000,
      })

      router.push(`/dashboard/test-papers/${paper_id}`)
    } catch (err) {
      console.error('[FINALIZE_ERROR]', err)
      toast.error(err instanceof Error ? err.message : 'Failed to finalize selection')
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
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          </div>
          <p className="text-base font-medium text-neutral-900">Loading questions...</p>
          <p className="text-sm text-neutral-600 mt-1">Please wait</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (pageError || !paper) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-gradient-to-br from-error-50 to-error-100/50 border border-error-200/80 p-6">
            <p className="text-error-800 font-semibold mb-4">{pageError || 'Paper not found'}</p>
            <Link
              href={paper_id ? `/dashboard/test-papers/${paper_id}` : '/dashboard/test-papers'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-error-600 text-white rounded-xl hover:bg-error-700 transition-all font-medium"
            >
              ← Back to Papers
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <main className="space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link href={`/dashboard/test-papers/${paper_id}`}>
              ← Back to Paper Dashboard
            </Link>
          </Button>

          {/* Unified Section Control Panel */}
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200/60 p-6">
            {/* Section Header with Finalize Button */}
            {section_id && currentSection && (
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200/60">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-neutral-900">
                    Section {currentSection.section_order}: {currentSection.section_name}
                  </h2>
                  <SectionStatusBadge status={currentSection.status} size="sm" />
                </div>
                {currentSection.status !== 'finalized' && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleFinalizeSection(section_id, currentSection.section_name)}
                    disabled={
                      !statistics ||
                      statistics.selected_count < statistics.target_count ||
                      finalizingSectionId === section_id
                    }
                    isLoading={finalizingSectionId === section_id}
                    loadingText="Finalizing..."
                    className={
                      statistics && statistics.selected_count >= statistics.target_count
                        ? 'bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700'
                        : ''
                    }
                  >
                    Finalize Section ✓
                  </Button>
                )}
              </div>
            )}

            {/* Global finalize button for single-section papers */}
            {!section_id && !paper.has_sections && (
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200/60">
                <h2 className="text-2xl font-bold text-neutral-900">{paper.title}</h2>
                {statistics && statistics.selected_count === statistics.target_count && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleFinalize}
                    disabled={finalizing}
                    isLoading={finalizing}
                    loadingText="Finalizing & Generating PDF..."
                    className="bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700"
                  >
                    Finalize Selection ✓
                  </Button>
                )}
              </div>
            )}

            {/* Statistics - Simplified */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`rounded-2xl p-4 border-2 ${
                statistics && statistics.selected_count === statistics.target_count
                  ? 'bg-gradient-to-br from-success-50 to-success-100/80 border-success-300'
                  : 'bg-gradient-to-br from-primary-50 to-primary-100/80 border-primary-300'
              }`}>
                <p className="text-sm font-semibold text-neutral-600 mb-2">Progress</p>
                <p className={`text-3xl font-bold ${
                  statistics && statistics.selected_count === statistics.target_count
                    ? 'text-success-700'
                    : 'text-primary-700'
                }`}>
                  {statistics?.selected_count} / {statistics?.target_count}
                </p>
                <p className="text-xs font-semibold text-neutral-600 mt-1">Selected</p>
              </div>
              <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/80 rounded-2xl p-4 border border-neutral-200/60">
                <p className="text-sm font-semibold text-neutral-600 mb-2">Total Generated</p>
                <p className="text-3xl font-bold text-neutral-900">{statistics?.total_generated}</p>
              </div>
              <div className="bg-gradient-to-br from-primary-50 to-primary-100/80 rounded-2xl p-4 border border-primary-200/60">
                <p className="text-sm font-semibold text-primary-700 mb-2">Target</p>
                <p className="text-3xl font-bold text-primary-600">{statistics?.target_count}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="pt-4 border-t border-neutral-200/60">
              <div className="grid grid-cols-4 gap-4">
                {/* Chapter Filter */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Chapter</label>
                  <select
                    value={filterChapter}
                    onChange={(e) => setFilterChapter(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100/80 border border-neutral-200/80 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 font-medium text-neutral-700"
                  >
                    <option value="all">All Chapters</option>
                    {uniqueChapters.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Difficulty</label>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100/80 border border-neutral-200/80 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 font-medium text-neutral-700"
                  >
                    <option value="all">All Difficulties</option>
                    {uniqueDifficulties.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Archetype Filter */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Archetype</label>
                  <select
                    value={filterArchetype}
                    onChange={(e) => setFilterArchetype(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100/80 border border-neutral-200/80 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 font-medium text-neutral-700"
                  >
                    <option value="all">All Archetypes</option>
                    {uniqueArchetypes.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                {/* Show Only Selected */}
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-2xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100/50 transition-all duration-300">
                    <input
                      type="checkbox"
                      checked={showOnlySelected}
                      onChange={(e) => setShowOnlySelected(e.target.checked)}
                      className="w-5 h-5 text-primary-600 focus:ring-2 focus:ring-primary-500/30 rounded-lg border-neutral-300"
                    />
                    <span className="text-sm font-semibold text-neutral-700">Show only selected</span>
                  </label>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200/60">
                <p className="text-sm font-semibold text-neutral-600">
                  Showing <span className="text-primary-600">{filteredQuestions.length}</span> of <span className="text-neutral-900">{questions.length}</span> questions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-neutral-300 p-16 text-center hover:border-primary-300 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-neutral-400">📝</span>
            </div>
            <p className="text-xl font-bold text-neutral-900 mb-2">No questions match your filters</p>
            <p className="text-neutral-600">Try adjusting your filter criteria</p>
          </div>
        ) : section_id ? (
          // Single section view: Show flat list (already filtered by API)
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index + 1}
                onToggleSelection={toggleSelection}
                onEdit={setEditingQuestion}
                onRegenerate={setRegeneratingQuestion}
                canSelect={!!question.is_selected || (statistics ? statistics.selected_count < statistics.target_count : false)}
              />
            ))}
          </div>
        ) : paper?.has_sections ? (
          // Multi-section paper (all sections view): Group by sections
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
                  <div key={section.section_id || 'no-section'} className="space-y-6">
                    {/* Section Header */}
                    <div className="bg-white border-l-4 border-primary-500 rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-neutral-900">
                              Section {sectionIndex + 1}: {section.section_name}
                            </h3>
                            {sectionData && <SectionStatusBadge status={sectionStatus} size="sm" />}
                          </div>
                          <p className="text-sm font-semibold text-neutral-600">
                            {section.questions.length} {section.questions.length === 1 ? 'question' : 'questions'} generated <span className="text-neutral-300 mx-2">•</span>{' '}
                            <span className="text-primary-600">{selectedInSection}</span> / {expectedCount} selected
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className={`text-3xl font-bold ${selectedInSection >= expectedCount ? 'text-success-600' : 'text-primary-600'}`}>
                              {selectedInSection}/{expectedCount}
                            </div>
                            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Selected</div>
                          </div>
                          {section.section_id && sectionStatus !== 'finalized' && (
                            <Button
                              variant="primary"
                              size="md"
                              onClick={() => handleFinalizeSection(section.section_id!, section.section_name)}
                              disabled={!canFinalize || finalizingSectionId === section.section_id}
                              isLoading={finalizingSectionId === section.section_id}
                              loadingText="Finalizing..."
                              className={
                                canFinalize
                                  ? 'bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700'
                                  : ''
                              }
                            >
                              Finalize Section
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                  {/* Section Questions */}
                  <div className="space-y-5 pl-6 border-l-4 border-primary-500/30">
                    {section.questions.map((question, index) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        index={index + 1}
                        onToggleSelection={toggleSelection}
                        onEdit={setEditingQuestion}
                        onRegenerate={setRegeneratingQuestion}
                        canSelect={!!question.is_selected || selectedInSection < expectedCount}
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
                canSelect={!!question.is_selected || (statistics ? statistics.selected_count < statistics.target_count : false)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          session={session}
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
          session={session}
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
    <div className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
      question.is_selected ? 'border-success-400 shadow-success-500/10' : 'border-neutral-200/60 hover:border-primary-300 hover:shadow-xl'
    }`}>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-4 flex-1">
            <div className="px-3 py-1.5 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl">
              <span className="text-sm font-bold text-neutral-700">Q{question.question_order}</span>
            </div>
            <div className="flex-1">
              <div className="prose prose-sm max-w-none">
                <p className="text-lg font-medium text-neutral-900 whitespace-pre-wrap leading-relaxed">{question.question_text}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {question.is_selected && (
              <span className="px-4 py-2 bg-gradient-to-br from-success-500 to-success-600 text-white text-sm font-semibold rounded-xl border border-success-400 shadow-md">
                ✓ Selected
              </span>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-2 text-neutral-600 hover:text-primary-600 hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100/50 rounded-xl transition-all duration-300"
            >
              {expanded ? '▼' : '▶'}
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {Object.entries(question.options).map(([key, value]) => (
            <div
              key={key}
              className={`px-5 py-3 rounded-2xl border-2 transition-all duration-300 ${
                key === question.correct_answer
                  ? 'bg-gradient-to-br from-success-50 to-success-100/80 border-success-300 shadow-sm'
                  : 'bg-gradient-to-br from-neutral-50 to-neutral-100/50 border-neutral-200/60 hover:border-primary-200'
              }`}
            >
              <span className="font-bold text-neutral-900 text-sm">{key}.</span>
              <span className="ml-3 text-neutral-900 font-medium">{value}</span>
              {key === question.correct_answer && (
                <span className="ml-3 text-success-600 font-bold text-sm">✓ Correct Answer</span>
              )}
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1.5 bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg border border-neutral-200/60">
            {question.chapter_name}
          </span>
          <span className="px-3 py-1.5 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 text-xs font-semibold rounded-lg border border-primary-200/60">
            {question.archetype}
          </span>
          <span className="px-3 py-1.5 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 text-xs font-semibold rounded-lg border border-purple-200/60">
            {question.structural_form}
          </span>
          <span className="px-3 py-1.5 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200/60">
            {question.difficulty}
          </span>
          <span className="px-3 py-1.5 bg-gradient-to-br from-warning-50 to-warning-100 text-warning-700 text-xs font-semibold rounded-lg border border-warning-200/60">
            {question.cognitive_load} load
          </span>
        </div>

        {/* Explanation (expandable) */}
        {expanded && question.explanation && (
          <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 border-2 border-primary-200/60 rounded-2xl p-6 mb-6">
            <p className="text-sm font-bold text-primary-900 mb-3">Explanation:</p>
            <p className="text-sm text-primary-800 whitespace-pre-wrap leading-relaxed">{question.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-6 border-t border-neutral-200/60">
          <Button
            variant={question.is_selected ? "destructive" : "primary"}
            size="sm"
            onClick={() => onToggleSelection(question.id, question.is_selected)}
            disabled={!canSelect}
            className={!question.is_selected && canSelect ? "bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700" : ""}
          >
            {question.is_selected ? 'Remove' : 'Select'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onEdit(question)}
          >
            Edit
          </Button>
          <Button
            variant="ai"
            size="sm"
            onClick={() => onRegenerate(question)}
          >
            Regenerate with AI
          </Button>
        </div>
      </div>
    </div>
  )
}

// Edit Question Modal Component
interface EditQuestionModalProps {
  question: Question
  session: any // Session from parent (centralized)
  onClose: () => void
  onSave: () => void
}

function EditQuestionModal({ question, session, onClose, onSave }: EditQuestionModalProps) {
  const [questionText, setQuestionText] = useState(question.question_text)
  const [options, setOptions] = useState(question.options)
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer)
  const [explanation, setExplanation] = useState(question.explanation)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)

      // Using centralized session passed from parent (no redundant getSession call)
      if (!session) {
        toast.error('Session expired. Please sign in again.')
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
      toast.error(err instanceof Error ? err.message : 'Failed to save question')
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
            className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        ))}

        {/* Correct Answer */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Correct Answer</label>
          <select
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={saving}
            isLoading={saving}
            loadingText="Saving..."
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// Regenerate Question Modal Component
interface RegenerateQuestionModalProps {
  question: Question
  session: any // Session from parent (centralized)
  onClose: () => void
  onRegenerate: () => void
}

function RegenerateQuestionModal({ question, session, onClose, onRegenerate }: RegenerateQuestionModalProps) {
  const [instruction, setInstruction] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  const handleRegenerate = async () => {
    if (!instruction.trim()) {
      toast.warning('Please provide instructions for regeneration')
      return
    }

    try {
      setRegenerating(true)

      // Using centralized session passed from parent (no redundant getSession call)
      if (!session) {
        toast.error('Session expired. Please sign in again.')
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
      toast.error(err instanceof Error ? err.message : 'Failed to regenerate question')
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
            className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="ai"
            size="md"
            onClick={handleRegenerate}
            disabled={regenerating || !instruction.trim()}
            isLoading={regenerating}
            loadingText="Regenerating..."
          >
            Regenerate Question
          </Button>
        </div>
      </div>
    </Modal>
  )
}
