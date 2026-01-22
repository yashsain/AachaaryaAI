'use client'

/**
 * Modern Paper Dashboard
 *
 * Central hub for managing a multi-section test paper
 * Features:
 * - Modern card-based layout with animations
 * - Visual progress tracking with circular progress
 * - Enhanced section tiles with status workflow
 * - Smooth transitions and hover effects
 * - Clear action buttons and navigation
 */

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, FileText, Download, CheckCircle2, Clock, AlertCircle, Layers, BookOpen, Hash, Zap, BarChart3, Trophy, Eye, RefreshCw, Plus, FileCheck } from 'lucide-react'
import { useRequireSession } from '@/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/skeleton'
import { createBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { GenerateQuestionsModal } from '@/components/modals/GenerateQuestionsModal'

interface PaperDashboardProps {
  params: Promise<{
    paper_id: string
  }>
}

interface Section {
  id: string
  section_name: string
  section_order: number
  status: 'pending' | 'ready' | 'generating' | 'in_review' | 'finalized'
  chapter_count: number
  question_count: number
  subject_id: string
  subject_name?: string
  assigned_chapters?: Array<{ id: string; name: string }>
  generation_started_at?: string
}

interface Paper {
  id: string
  title: string
  status: 'draft' | 'review' | 'finalized'
  difficulty_level: 'easy' | 'balanced' | 'hard'
  created_at: string
  paper_template_id: string | null
  pdf_url: string | null
  answer_key_url: string | null
  institutes: {
    name: string
  }
  paper_templates?: {
    name: string
  }
}

// Status configuration
const getSectionStatusConfig = (status: Section['status']) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        icon: Clock,
        color: 'text-neutral-600',
        bg: 'bg-neutral-50',
        border: 'border-neutral-200'
      }
    case 'ready':
      return {
        label: 'Ready',
        icon: Zap,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      }
    case 'generating':
      return {
        label: 'Generating',
        icon: RefreshCw,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200'
      }
    case 'in_review':
      return {
        label: 'In Review',
        icon: Eye,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200'
      }
    case 'finalized':
      return {
        label: 'Finalized',
        icon: CheckCircle2,
        color: 'text-success-600',
        bg: 'bg-success-50',
        border: 'border-success-200'
      }
  }
}

// Difficulty configuration
const getDifficultyConfig = (difficulty: Paper['difficulty_level']) => {
  switch (difficulty) {
    case 'easy':
      return {
        label: 'Easy',
        icon: Zap,
        color: 'text-success-700',
        bg: 'bg-success-50',
        border: 'border-success-200'
      }
    case 'balanced':
      return {
        label: 'Balanced',
        icon: BarChart3,
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      }
    case 'hard':
      return {
        label: 'Hard',
        icon: Trophy,
        color: 'text-error-700',
        bg: 'bg-error-50',
        border: 'border-error-200'
      }
  }
}

// Paper status configuration
const getPaperStatusConfig = (status: Paper['status']) => {
  switch (status) {
    case 'draft':
      return {
        label: 'Draft',
        color: 'text-neutral-700',
        bg: 'bg-neutral-100',
        border: 'border-neutral-300'
      }
    case 'review':
      return {
        label: 'In Review',
        color: 'text-amber-700',
        bg: 'bg-amber-100',
        border: 'border-amber-300'
      }
    case 'finalized':
      return {
        label: 'Finalized',
        color: 'text-success-700',
        bg: 'bg-success-100',
        border: 'border-success-300'
      }
  }
}

export default function PaperDashboardPage({ params }: PaperDashboardProps) {
  const resolvedParams = use(params)
  const paperId = resolvedParams.paper_id
  const { session, loading, teacherLoading } = useRequireSession()
  const router = useRouter()
  const supabase = createBrowserClient()

  const [paper, setPaper] = useState<Paper | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)

  useEffect(() => {
    // Only fetch when auth is fully loaded
    // Prevents race condition with useRequireSession redirect logic
    if (session && !loading && !teacherLoading) {
      fetchPaperData()
    }
  }, [session, loading, teacherLoading, paperId])

  // Auto-cleanup stuck sections when dashboard loads
  useEffect(() => {
    if (!session || sections.length === 0) return

    const cleanupStuckSections = async () => {
      // Find sections stuck in 'generating' for > 7 minutes
      const sevenMinutesAgo = new Date(Date.now() - 7 * 60 * 1000).toISOString()

      const stuckSections = sections.filter(s =>
        s.status === 'generating' &&
        s.generation_started_at &&
        s.generation_started_at < sevenMinutesAgo
      )

      if (stuckSections.length === 0) return

      console.log(`[AUTO_CLEANUP] Found ${stuckSections.length} stuck section(s)`)

      // Clean up each stuck section
      for (const section of stuckSections) {
        try {
          const response = await fetch(`/api/test-papers/${paperId}/sections/${section.id}/cleanup`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            console.log(`[AUTO_CLEANUP] Cleaned section ${section.id}`)
          }
        } catch (err) {
          console.error(`[AUTO_CLEANUP] Error cleaning section ${section.id}:`, err)
        }
      }

      // Refresh data if we cleaned anything
      if (stuckSections.length > 0) {
        setTimeout(() => fetchPaperData(), 1000)
      }
    }

    cleanupStuckSections()
  }, [sections, session, paperId])

  const fetchPaperData = async () => {
    try {
      setIsLoading(true)

      // Session is guaranteed to exist here due to useEffect guard above
      // No need for manual redirect - useRequireSession handles it

      // Fetch paper details
      const { data: paperData, error: paperError } = await supabase
        .from('test_papers')
        .select(`
          id,
          title,
          status,
          difficulty_level,
          created_at,
          paper_template_id,
          pdf_url,
          answer_key_url,
          institutes (
            name
          ),
          paper_templates (
            name
          )
        `)
        .eq('id', paperId)
        .single()

      if (paperError) {
        console.error('Error fetching paper:', paperError)
        setError('Failed to load paper')
        return
      }

      setPaper(paperData as any)

      // Fetch sections with subject info
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('test_paper_sections')
        .select(`
          id,
          section_name,
          section_order,
          status,
          question_count,
          subject_id,
          generation_started_at,
          subjects (
            name
          )
        `)
        .eq('paper_id', paperId)
        .order('section_order', { ascending: true })

      if (sectionsError) {
        console.error('Error fetching sections:', sectionsError)
        setError('Failed to load sections')
        return
      }

      // Fetch assigned chapters for each section
      const { data: sectionChapters, error: chaptersError } = await supabase
        .from('section_chapters')
        .select(`
          section_id,
          chapters (
            id,
            name
          )
        `)
        .in('section_id', sectionsData.map(s => s.id))

      // Build chapters map
      const chaptersMap = new Map<string, Array<{ id: string; name: string }>>()
      if (!chaptersError && sectionChapters) {
        sectionChapters.forEach(sc => {
          if (!chaptersMap.has(sc.section_id)) {
            chaptersMap.set(sc.section_id, [])
          }
          chaptersMap.get(sc.section_id)?.push(sc.chapters as any)
        })
      }

      const sectionsWithData: Section[] = sectionsData.map(section => ({
        ...section,
        subject_name: (section.subjects as any)?.name,
        chapter_count: chaptersMap.get(section.id)?.length || 0,
        assigned_chapters: chaptersMap.get(section.id) || []
      }))

      setSections(sectionsWithData)

    } catch (err) {
      console.error('Error loading paper:', err)
      setError('Failed to load paper dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSectionAction = (sectionId: string, action: 'assign' | 'generate' | 'regenerate' | 'view') => {
    switch (action) {
      case 'assign':
        router.push(`/dashboard/test-papers/${paperId}/section/${sectionId}/chapters`)
        break
      case 'generate':
      case 'regenerate':
        // Open modal instead of navigating
        const section = sections.find(s => s.id === sectionId)
        if (section) {
          setSelectedSection(section)
          setGenerateModalOpen(true)
        }
        break
      case 'view':
        // Navigate to review page with section_id for isolated section review
        router.push(`/dashboard/test-papers/${paperId}/review?section_id=${sectionId}`)
        break
    }
  }

  const handleGenerateFinalPDF = async () => {
    // Check if all sections are finalized
    const allFinalized = sections.every(s => s.status === 'finalized')
    if (!allFinalized) {
      const unfinalizedSections = sections.filter(s => s.status !== 'finalized')
      const unfinalizedNames = unfinalizedSections.map(s => s.section_name).join(', ')
      toast.warning(`All sections must be finalized before generating PDF. Unfinalized sections: ${unfinalizedNames}`, {
        duration: 6000,
      })
      return
    }

    try {
      setGeneratingPDF(true)

      // Session is guaranteed to exist here - useRequireSession handles auth
      console.log('[GENERATE_FINAL_PDF] Step 1: Finalizing paper...')

      // Step 1: Finalize paper (validates all sections are finalized)
      const finalizeResponse = await fetch(`/api/test-papers/${paperId}/finalize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const finalizeData = await finalizeResponse.json()

      if (!finalizeResponse.ok) {
        throw new Error(finalizeData.error || 'Failed to finalize paper')
      }

      console.log('[GENERATE_FINAL_PDF] Step 2: Generating PDF...')

      // Step 2: Generate PDF
      const pdfResponse = await fetch(`/api/test-papers/${paperId}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const pdfData = await pdfResponse.json()

      if (!pdfResponse.ok) {
        // If PDF generation fails, try to reopen the paper
        console.error('[GENERATE_FINAL_PDF] PDF generation failed, rolling back...')
        await fetch(`/api/test-papers/${paperId}/reopen`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        })
        throw new Error(pdfData.error || 'Failed to generate PDF')
      }

      console.log('[GENERATE_FINAL_PDF] Success! PDF:', pdfData.pdf_url)

      toast.success('Final PDF generated successfully!', {
        duration: 5000,
      })

      // Refresh paper data to show finalized status
      fetchPaperData()
    } catch (err) {
      console.error('[GENERATE_FINAL_PDF_ERROR]', err)
      toast.error(err instanceof Error ? err.message : 'Failed to generate PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error || !paper) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center"
      >
        <div className="w-20 h-20 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-error-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-3">Error Loading Paper</h2>
        <p className="text-neutral-600 mb-6 max-w-md mx-auto">{error || 'Paper not found'}</p>
        <Button onClick={() => router.push('/dashboard/test-papers')}>Go Back</Button>
      </motion.div>
    )
  }

  const finalizedSections = sections.filter(s => s.status === 'finalized').length
  const totalSections = sections.length
  const progressPercentage = totalSections > 0 ? (finalizedSections / totalSections) * 100 : 0
  const allFinalized = sections.every(s => s.status === 'finalized')

  const difficultyConfig = getDifficultyConfig(paper.difficulty_level)
  const statusConfig = getPaperStatusConfig(paper.status)
  const DifficultyIcon = difficultyConfig.icon

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 text-neutral-600">
          <button
            onClick={() => {
              // Navigate to template page if paper was created from template
              // Otherwise go to main test papers list
              if (paper.paper_template_id) {
                router.push(`/dashboard/test-papers/template/${paper.paper_template_id}`)
              } else {
                router.push('/dashboard/test-papers')
              }
            }}
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary-600 transition-colors text-gray-900 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </button>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-neutral-900 mb-3">{paper.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border',
                statusConfig.bg,
                statusConfig.color,
                statusConfig.border
              )}>
                {statusConfig.label}
              </span>
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border',
                difficultyConfig.bg,
                difficultyConfig.color,
                difficultyConfig.border
              )}>
                <DifficultyIcon className="h-3.5 w-3.5" />
                {difficultyConfig.label}
              </span>
              {paper.paper_templates && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border bg-neutral-50 text-neutral-700 border-neutral-200">
                  <Layers className="h-3.5 w-3.5" />
                  {paper.paper_templates.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {allFinalized && !paper.pdf_url && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerateFinalPDF}
                isLoading={generatingPDF}
                disabled={generatingPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                {generatingPDF ? 'Generating PDF...' : 'Generate Final PDF'}
              </Button>
            )}
            {paper.pdf_url && (
              <Button
                size="lg"
                onClick={() => router.push(`/dashboard/test-papers/${paperId}/pdf`)}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                View PDF
              </Button>
            )}
            {paper.pdf_url && paper.answer_key_url && (
              <Button
                size="lg"
                onClick={() => router.push(`/dashboard/test-papers/${paperId}/answer-key`)}
                className="bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                View Answer Key
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Progress Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-1">Section Progress</h2>
            <p className="text-sm text-neutral-600">
              {finalizedSections} of {totalSections} sections finalized
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-neutral-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
                  className="text-success-500 transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-neutral-900">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Banners */}
        <AnimatePresence>
          {allFinalized && paper.status !== 'finalized' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-success-50 border border-success-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-success-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-success-900 mb-1">All Sections Complete!</h4>
                  <p className="text-sm text-success-700">
                    All sections have been finalized. You can now generate the final PDF for this test paper.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          {allFinalized && paper.pdf_url && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Paper Finalized</h4>
                  <p className="text-sm text-blue-700">
                    This paper has been finalized and the PDF is ready for viewing and distribution.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sections Grid */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Sections</h2>
        {sections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <SectionCard
                key={section.id}
                section={section}
                paperId={paperId}
                onActionClick={handleSectionAction}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border-2 border-dashed border-neutral-300 p-12 text-center"
          >
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Layers className="h-10 w-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No Sections Found</h3>
            <p className="text-neutral-600 max-w-md mx-auto">
              This paper doesn't have any sections yet. Sections should be created automatically from the template.
            </p>
          </motion.div>
        )}
      </div>

      {/* Generate Questions Modal */}
      {selectedSection && (
        <GenerateQuestionsModal
          isOpen={generateModalOpen}
          onClose={() => {
            setGenerateModalOpen(false)
            setSelectedSection(null)
            // Refresh data when modal closes
            fetchPaperData()
          }}
          paperId={paperId}
          sectionId={selectedSection.id}
          sectionName={selectedSection.section_name}
          subjectName={selectedSection.subject_name || ''}
          questionCount={selectedSection.question_count}
          assignedChapters={selectedSection.assigned_chapters || []}
          isRegenerate={selectedSection.status === 'in_review' || selectedSection.status === 'finalized'}
          session={session}
        />
      )}
    </div>
  )
}

// Modern Section Card Component
interface SectionCardProps {
  section: Section
  paperId: string
  onActionClick: (sectionId: string, action: 'assign' | 'generate' | 'regenerate' | 'view') => void
  index: number
}

function SectionCard({ section, paperId, onActionClick, index }: SectionCardProps) {
  const statusConfig = getSectionStatusConfig(section.status)
  const StatusIcon = statusConfig.icon

  // Determine primary action button
  const getPrimaryAction = (): { label: string; action: 'assign' | 'generate' | 'view'; icon: any; disabled?: boolean } => {
    switch (section.status) {
      case 'pending':
        return { label: 'Assign Chapters', action: 'assign', icon: Plus }
      case 'ready':
        return { label: 'Generate Questions', action: 'generate', icon: Zap }
      case 'generating':
        return { label: 'Generating...', action: 'view', icon: RefreshCw, disabled: true }
      case 'in_review':
        return { label: 'Review & Finalize', action: 'view', icon: Eye }
      case 'finalized':
      default:
        return { label: 'View Questions', action: 'view', icon: Eye }
    }
  }

  const primaryAction = getPrimaryAction()
  const PrimaryIcon = primaryAction.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      className="group bg-white rounded-2xl shadow-sm border border-neutral-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Section {section.section_order}
              </span>
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border',
                statusConfig.bg,
                statusConfig.color,
                statusConfig.border
              )}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
              {section.section_name}
            </h3>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-600">Chapters</p>
              <p className="font-semibold text-neutral-900">{section.chapter_count}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Hash className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-600">Questions</p>
              <p className="font-semibold text-neutral-900">
                {section.status === 'in_review' || section.status === 'finalized'
                  ? section.question_count
                  : `~${section.question_count}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 bg-neutral-50">
        <div className="flex items-center gap-2">
          <Button
            variant={section.status === 'finalized' ? 'secondary' : 'primary'}
            size="sm"
            className="flex-1"
            onClick={() => onActionClick(section.id, primaryAction.action)}
            disabled={primaryAction.disabled || section.status === 'generating'}
          >
            <PrimaryIcon className={cn("h-4 w-4 mr-2", section.status === 'generating' && "animate-spin")} />
            {primaryAction.label}
          </Button>

          {(section.status === 'in_review' || section.status === 'finalized') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onActionClick(section.id, 'regenerate')}
              title="Regenerate questions"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
