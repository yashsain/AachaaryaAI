'use client'

/**
 * Generate Questions Page
 *
 * Landing page after test paper creation
 * Shows paper summary and material count
 * Will trigger AI question generation in Phase 4
 */

import { useRequireSession } from '@/hooks/useSession'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { createBrowserClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/toast'

interface TestPaper {
  id: string
  title: string
  question_count: number
  difficulty_level: 'easy' | 'balanced' | 'hard'
  status: string
  subjects: {
    id: string
    name: string
  }
  material_types: {
    id: string
    name: string
  }
}

interface Chapter {
  chapter_id: string
  chapters: {
    id: string
    name: string
  }
}

export default function GenerateQuestionsPage() {
  const { session, teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireSession()
  const router = useRouter()
  const params = useParams()
  const paper_id = params.paper_id as string
  const supabase = createBrowserClient()

  const [paper, setPaper] = useState<TestPaper | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [materialCount, setMaterialCount] = useState<number | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [dryRunning, setDryRunning] = useState(false)
  const [actualGenerating, setActualGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  useEffect(() => {
    if (teacher && !loading && !teacherLoading && paper_id) {
      fetchPaperData()
    }
  }, [teacher, loading, teacherLoading, paper_id])

  const fetchPaperData = async () => {
    try {
      setLoadingData(true)

      if (!session) {
        setPageError('Session expired. Please sign in again.')
        return
      }

      // Fetch paper with subject and material type
      const { data: paperData, error: paperError } = await supabase
        .from('test_papers')
        .select(`
          id,
          title,
          question_count,
          difficulty_level,
          status,
          subjects (id, name),
          material_types (id, name)
        `)
        .eq('id', paper_id)
        .eq('institute_id', teacher!.institute_id)
        .single()

      if (paperError || !paperData) {
        setPageError('Test paper not found')
        return
      }

      setPaper(paperData as any)

      // Fetch chapters from section_chapters
      // First get section IDs for this paper
      const { data: sections, error: sectionsError } = await supabase
        .from('test_paper_sections')
        .select('id')
        .eq('paper_id', paper_id)

      let chaptersData: any[] = []

      if (sectionsError) {
        console.error('[FETCH_SECTIONS_ERROR]', sectionsError)
      } else {
        const sectionIds = sections?.map(s => s.id) || []

        if (sectionIds.length > 0) {
          // Fetch chapters for all sections
          const { data: sectionChaptersData, error: chaptersError } = await supabase
            .from('section_chapters')
            .select(`
              chapter_id,
              chapters (id, name)
            `)
            .in('section_id', sectionIds)

          if (chaptersError) {
            console.error('[FETCH_CHAPTERS_ERROR]', chaptersError)
          } else {
            // Deduplicate chapters (sections may share chapters)
            const uniqueChapters = Array.from(
              new Map(sectionChaptersData?.map(sc => [sc.chapter_id, sc]) || []).values()
            )
            chaptersData = uniqueChapters
            setChapters(uniqueChapters as any || [])
          }
        }
      }

      // Fetch material count for these chapters
      const chapterIds = chaptersData?.map((c: any) => c.chapter_id) || []
      if (chapterIds.length > 0) {
        const { data: materials } = await supabase
          .from('material_chapters')
          .select('material_id')
          .in('chapter_id', chapterIds)

        const uniqueMaterialIds = new Set(materials?.map(m => m.material_id) || [])
        setMaterialCount(uniqueMaterialIds.size)
      } else {
        setMaterialCount(0)
      }
    } catch (err) {
      console.error('[FETCH_PAPER_ERROR]', err)
      setPageError('Failed to load test paper')
    } finally {
      setLoadingData(false)
    }
  }

  const handleGenerate = async (dryRun: boolean = false) => {
    try {
      if (dryRun) {
        setDryRunning(true)
      } else {
        setActualGenerating(true)
      }
      setGenerateError(null)

      if (!session) {
        setGenerateError('Session expired. Please sign in again.')
        return
      }

      const endpoint = dryRun
        ? `/api/test-papers/${paper_id}/generate-questions-dry-run`
        : `/api/test-papers/${paper_id}/generate-questions`

      console.log(`[GENERATE_QUESTIONS_UI] Starting ${dryRun ? 'DRY RUN' : 'generation'} for paper:`, paper_id)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error('We encountered an issue generating questions. Please try again.')
      }

      console.log('[GENERATE_QUESTIONS_UI_SUCCESS]', data)

      if (dryRun) {
        // Show success message for dry run
        toast.success(`Dry Run Complete! Chapters: ${data.summary.chaptersProcessed}/${data.summary.totalChapters} | Questions: ${data.summary.totalQuestionsGenerated} | Errors: ${data.summary.validationErrors.length} | Warnings: ${data.summary.validationWarnings.length}`, {
          duration: 8000,
          description: 'Logs saved to debug_logs/. Check console for details.'
        })
      } else {
        // Redirect to review page
        router.push(`/dashboard/test-papers/${paper_id}/review`)
      }

    } catch (err) {
      console.error('[GENERATE_QUESTIONS_UI_ERROR]', err)
      setGenerateError(err instanceof Error ? err.message : 'We encountered an issue generating questions. Please try again.')
    } finally {
      if (dryRun) {
        setDryRunning(false)
      } else {
        setActualGenerating(false)
      }
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

  // Show error state
  if (pageError || !paper) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-red-50 border border-red-200 p-6">
            <p className="text-red-800 font-medium">{pageError || 'Test paper not found'}</p>
            <Link
              href={paper_id ? `/dashboard/test-papers/${paper_id}` : '/dashboard/test-papers'}
              className="mt-4 inline-block text-primary-600 hover:underline"
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
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/dashboard/test-papers/${paper_id}`} className="text-primary-600 hover:underline mb-4 inline-block">
            ← Back to Paper Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900">{paper.title}</h1>
          <p className="text-neutral-600 mt-2">Review details and generate questions</p>
        </div>

        {/* Paper Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Paper Details</h2>

          <div className="space-y-4">
            {/* Subject */}
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Subject</p>
              <p className="text-base text-neutral-900">{paper.subjects.name}</p>
            </div>

            {/* Paper Type */}
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Paper Type</p>
              <p className="text-base text-neutral-900">{paper.material_types.name}</p>
            </div>

            {/* Test Configuration */}
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-2">Test Configuration</p>
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="text-base font-semibold">{paper.question_count} questions</span>
                <span className="text-neutral-400">•</span>
                <span className="text-base font-semibold capitalize">{paper.difficulty_level} difficulty</span>
              </div>
            </div>

            {/* Chapters */}
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-2">
                Chapters ({chapters.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {chapters.map((ch) => (
                  <span
                    key={ch.chapter_id}
                    className="px-3 py-1 bg-neutral-50 text-neutral-700 rounded-lg border border-neutral-200 text-sm"
                  >
                    {ch.chapters.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Material Count */}
            <div className={`border rounded-lg p-4 ${materialCount === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-start gap-3">
                <span className={`text-xl ${materialCount === 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {materialCount === 0 ? '⚠️' : '✅'}
                </span>
                <div>
                  <p className={`text-sm font-medium mb-1 ${materialCount === 0 ? 'text-yellow-800' : 'text-green-800'}`}>
                    Study Materials
                  </p>
                  {materialCount !== null ? (
                    <>
                      <p className={`text-sm ${materialCount === 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                        {materialCount} {materialCount === 1 ? 'material' : 'materials'} available
                      </p>
                      {materialCount === 0 && (
                        <p className="text-sm text-yellow-800 mt-1">
                          Please upload materials before generating questions.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-neutral-600">Checking materials...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Next Steps</h2>
          <p className="text-neutral-600 mb-6">
            AI-powered question generation will analyze your study materials and create
            {Math.floor(paper.question_count * 1.5)} questions following the NEET protocol.
            You'll then select the best {paper.question_count} questions.
          </p>

          {/* Error Display */}
          {generateError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{generateError}</p>
            </div>
          )}

          {/* Dry Run Button */}
          <button
            onClick={() => handleGenerate(true)}
            disabled={dryRunning || actualGenerating || materialCount === 0}
            className={`w-full px-6 py-4 rounded-lg font-medium text-lg transition-colors mb-3 ${
              dryRunning || actualGenerating || materialCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {dryRunning ? (
              <span className="flex items-center justify-center gap-2">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
                Running Dry Run... (2-3 minutes)
              </span>
            ) : (
              'Test Run (No DB Save) 🧪'
            )}
          </button>

          {/* Actual Generate Button */}
          <button
            onClick={() => handleGenerate(false)}
            disabled={dryRunning || actualGenerating || materialCount === 0}
            className={`w-full px-6 py-4 rounded-lg font-medium text-lg transition-colors ${
              dryRunning || actualGenerating || materialCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {actualGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
                Generating Questions... (2-3 minutes)
              </span>
            ) : (
              'Generate Questions & Save to DB'
            )}
          </button>

          <p className="text-xs text-neutral-500 mt-3 text-center">
            💡 Tip: Use "Test Run" first to verify everything before saving to database
          </p>

          {(dryRunning || actualGenerating) && (
            <p className="text-sm text-neutral-600 mt-4 text-center">
              ⏳ Please wait while AI generates NEET-style questions from your materials. Do not close this tab.
            </p>
          )}

          {materialCount === 0 && !dryRunning && !actualGenerating && (
            <p className="text-sm text-yellow-700 mt-4 text-center">
              ⚠️ Upload materials before generating questions
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
