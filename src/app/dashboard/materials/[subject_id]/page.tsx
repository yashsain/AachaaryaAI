'use client'

/**
 * Materials Browse Page
 *
 * Displays materials organized by chapters in an accordion layout
 * - Chapters collapsed by default, expandable
 * - Compact material rows with actions
 * - Upload button in top right
 * - Role-based access control enforced
 */

import { useRequireAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'

interface Material {
  id: string
  title: string
  file_url: string
  created_at: string
  material_type: {
    id: string
    name: string
  }
  chapters: Array<{
    id: string
    name: string
  }>
  classes: Array<{
    id: string
    batch_name: string
    medium: string
    class_level: string
    stream: string
  }>
  uploaded_by: {
    id: string
    name: string
  }
}

interface Chapter {
  id: string
  name: string
  materials: Material[]
}

interface MaterialsData {
  subject: {
    id: string
    name: string
  }
  chapters: Chapter[]
}

export default function MaterialsBrowsePage() {
  const { teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireAuth()
  const router = useRouter()
  const params = useParams()
  const subject_id = params.subject_id as string

  const [materialsData, setMaterialsData] = useState<MaterialsData | null>(null)
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  const [materialsError, setMaterialsError] = useState<string | null>(null)
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({})
  const [deletingMaterial, setDeletingMaterial] = useState<string | null>(null)
  const [hasOnlyOneSubject, setHasOnlyOneSubject] = useState<boolean>(false)

  useEffect(() => {
    if (teacher && !loading && !teacherLoading && subject_id) {
      fetchMaterials()
      checkSubjectCount()
    }
  }, [teacher, loading, teacherLoading, subject_id])

  const fetchMaterials = async () => {
    try {
      setLoadingMaterials(true)
      setMaterialsError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setMaterialsError('Session expired. Please sign in again.')
        return
      }

      const response = await fetch(`/api/materials?subject_id=${subject_id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch materials')
      }

      const data = await response.json()
      setMaterialsData(data)
    } catch (err) {
      console.error('[MATERIALS_BROWSE_ERROR]', err)
      setMaterialsError(err instanceof Error ? err.message : 'Failed to load materials')
    } finally {
      setLoadingMaterials(false)
    }
  }

  const checkSubjectCount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHasOnlyOneSubject(data.subjects?.length === 1)
      }
    } catch (err) {
      console.error('[CHECK_SUBJECT_COUNT_ERROR]', err)
      // Non-critical error, don't show to user
    }
  }

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }))
  }

  const handleDelete = async (materialId: string, materialTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${materialTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingMaterial(materialId)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Session expired. Please sign in again.')
        return
      }

      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete material')
      }

      // Refresh materials list
      await fetchMaterials()
    } catch (err) {
      console.error('[MATERIALS_DELETE_ERROR]', err)
      alert(err instanceof Error ? err.message : 'Failed to delete material')
    } finally {
      setDeletingMaterial(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const getMaterialTypeColor = (typeName: string) => {
    const colors: Record<string, string> = {
      'Notes': 'bg-blue-100 text-blue-800',
      'DPP': 'bg-purple-100 text-purple-800',
      'Past Papers': 'bg-green-100 text-green-800',
      'Question Bank': 'bg-yellow-100 text-yellow-800',
      'Practice Sets': 'bg-pink-100 text-pink-800',
    }
    return colors[typeName] || 'bg-gray-100 text-gray-800'
  }

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state
  if (loading || teacherLoading || loadingMaterials) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-saffron border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Loading materials...</p>
        </div>
      </div>
    )
  }

  const totalMaterials = materialsData?.chapters.reduce((sum, chapter) => sum + chapter.materials.length, 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={hasOnlyOneSubject ? "/dashboard" : "/dashboard/materials"}>
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">
                  {materialsData?.subject.name || 'Materials'}
                </h1>
                <p className="text-sm text-neutral-600 mt-0.5">
                  {totalMaterials} {totalMaterials === 1 ? 'material' : 'materials'} •{' '}
                  {materialsData?.chapters.length || 0} {materialsData?.chapters.length === 1 ? 'chapter' : 'chapters'}
                </p>
              </div>
            </div>

            <Link
              href={`/dashboard/materials/${subject_id}/upload`}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-white">Upload Material</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {materialsError && (
          <div className="bg-error/10 border border-error/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-error text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-error font-medium">Error Loading Materials</p>
                <p className="text-error/80 text-sm mt-1">{materialsError}</p>
                <button
                  onClick={fetchMaterials}
                  className="mt-3 text-sm text-error hover:underline font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!materialsError && materialsData && totalMaterials === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">No Materials Yet</h2>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Start by uploading study materials like notes, DPPs, or past papers for this subject.
            </p>
            <Link
              href={`/dashboard/materials/${subject_id}/upload`}
              className="inline-block px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <span className="text-white">Upload Your First Material</span>
            </Link>
          </div>
        )}

        {/* Chapters Accordion */}
        {!materialsError && materialsData && totalMaterials > 0 && (
          <div className="space-y-4">
            {materialsData.chapters.map((chapter) => {
              if (chapter.materials.length === 0) return null
              const isExpanded = expandedChapters[chapter.id]

              return (
                <div key={chapter.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200">
                  {/* Chapter Header */}
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {chapter.materials.length}
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-neutral-800">{chapter.name}</h3>
                        <p className="text-sm text-neutral-600">
                          {chapter.materials.length} {chapter.materials.length === 1 ? 'material' : 'materials'}
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`w-6 h-6 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Materials List */}
                  {isExpanded && (
                    <div className="border-t border-neutral-200">
                      {chapter.materials.map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0"
                        >
                          {/* Material Info */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* PDF Icon */}
                            <div className="flex-shrink-0">
                              <svg className="w-10 h-10 text-error" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                            </div>

                            {/* Title and Metadata */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-neutral-800 truncate">{material.title}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getMaterialTypeColor(material.material_type.name)}`}>
                                  {material.material_type.name}
                                </span>
                                <span className="text-sm text-neutral-600">{formatDate(material.created_at)}</span>
                                {material.uploaded_by && (
                                  <span className="text-sm text-neutral-500">by {material.uploaded_by.name}</span>
                                )}
                              </div>
                              {/* Class Badges */}
                              {material.classes && material.classes.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                  <span className="text-xs text-neutral-500">Classes:</span>
                                  {material.classes.map((cls) => (
                                    <span
                                      key={cls.id}
                                      className="px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700 rounded border border-neutral-200"
                                    >
                                      {cls.class_level}{cls.batch_name ? ` - ${cls.batch_name}` : ''}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                              href={material.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-sm font-medium text-brand-blue hover:bg-brand-blue/10 rounded transition-colors"
                            >
                              View
                            </a>
                            <button
                              onClick={() => handleDelete(material.id, material.title)}
                              disabled={deletingMaterial === material.id}
                              className="px-3 py-1.5 text-sm font-medium text-error hover:bg-error/10 rounded transition-colors disabled:opacity-50"
                            >
                              {deletingMaterial === material.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
