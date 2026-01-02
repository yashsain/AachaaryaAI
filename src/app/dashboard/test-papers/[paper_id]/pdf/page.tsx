'use client'

/**
 * PDF Viewer Page for Finalized Papers
 *
 * Displays the generated PDF in an embedded viewer
 * Allows downloading the PDF
 * No edit functionality (edit button is on papers list)
 */

import { useRequireSession } from '@/hooks/useSession'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { createBrowserClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/toast'

interface PaperInfo {
  id: string
  title: string
  pdf_url: string | null
  subject_id: string
}

interface SignedUrlResponse {
  success: boolean
  pdf_url: string
  expires_in: number
}

export default function PDFViewerPage() {
  const { session, teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireSession()
  const router = useRouter()
  const params = useParams()
  const paper_id = params.paper_id as string
  const supabase = createBrowserClient()

  const [paper, setPaper] = useState<PaperInfo | null>(null)
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  useEffect(() => {
    if (teacher && !loading && !teacherLoading && paper_id) {
      fetchPaper()
    }
  }, [teacher, loading, teacherLoading, paper_id])

  const fetchPaper = async () => {
    try {
      setLoadingData(true)

      if (!session) {
        setPageError('Session expired. Please sign in again.')
        return
      }

      // Fetch paper details (only need title, pdf_url, subject_id)
      const { data: paperData, error: paperError } = await supabase
        .from('test_papers')
        .select('id, title, pdf_url, subject_id')
        .eq('id', paper_id)
        .eq('institute_id', teacher!.institute_id)
        .single()

      if (paperError || !paperData) {
        setPageError('Paper not found')
        return
      }

      if (!paperData.pdf_url) {
        setPageError('PDF not generated yet. Please finalize the paper first.')
        return
      }

      setPaper(paperData as any)

      // Fetch signed URL for PDF viewing
      const signedUrlResponse = await fetch(`/api/test-papers/${paper_id}/pdf-url`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.json()
        setPageError(errorData.error || 'Failed to load PDF URL')
        return
      }

      const signedUrlData: SignedUrlResponse = await signedUrlResponse.json()
      setSignedPdfUrl(signedUrlData.pdf_url)

    } catch (err) {
      console.error('[FETCH_PAPER_ERROR]', err)
      setPageError(err instanceof Error ? err.message : 'Failed to load paper')
    } finally {
      setLoadingData(false)
    }
  }

  const handleDownload = () => {
    if (signedPdfUrl) {
      window.open(signedPdfUrl, '_blank')
    } else {
      toast.warning('PDF URL not available yet. Please wait...')
    }
  }

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state
  if (loading || teacherLoading || loadingData || !signedPdfUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Loading PDF...</p>
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
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/dashboard/test-papers/${paper_id}`}
                className="text-primary-600 hover:underline flex items-center gap-2"
              >
                ← Back to Paper Dashboard
              </Link>
              <div className="h-6 w-px bg-neutral-300"></div>
              <h1 className="text-xl font-bold text-neutral-900">{paper.title}</h1>
            </div>

            <button
              onClick={handleDownload}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </header>

      {/* PDF Viewer */}
      <main className="flex-1 overflow-hidden">
        <iframe
          src={signedPdfUrl}
          className="w-full h-full border-0"
          title={`${paper.title} - Test Paper PDF`}
        />
      </main>
    </div>
  )
}
