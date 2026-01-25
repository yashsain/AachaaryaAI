'use client'

/**
 * Upload Material Page
 *
 * Form for uploading new study materials
 * - Title, material type, chapters, file upload
 * - Validates all fields before submission
 * - Redirects to materials browse after success
 */

import { useRequireSession } from '@/hooks/useSession'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { MultiSelect, MultiSelectOption } from '@/components/ui/MultiSelect'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react'

interface Chapter {
  id: string
  name: string
}

interface Class {
  id: string
  batch_name: string
  medium: string
  streams: {
    id: string
    name: string
  }
  class_levels: {
    id: string
    name: string
  }
}

export default function UploadMaterialPage() {
  const supabase = createBrowserClient()
  const { session, teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const subject_id = params.subject_id as string
  const preselectedChapterId = searchParams.get('chapter_id')

  // Form state
  const [title, setTitle] = useState('')
  const [materialType, setMaterialType] = useState<'scope' | 'style' | ''>('')
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([])
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)

  // Options data
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [classes, setClasses] = useState<Class[]>([])

  // UI state
  const [loadingData, setLoadingData] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Additional context (for API call)
  const [streamId, setStreamId] = useState('')

  useEffect(() => {
    if (teacher && !loading && !teacherLoading && subject_id) {
      fetchFormData()
    }
  }, [teacher, loading, teacherLoading, subject_id])

  const fetchFormData = async () => {
    try {
      setLoadingData(true)

      if (!session) {
        setUploadError('Session expired. Please sign in again.')
        return
      }

      // Fetch subject via API to get stream_id
      // FIX: Using API endpoint instead of direct supabaseAdmin query (client-side security)
      const subjectResponse = await fetch(`/api/subjects/${subject_id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!subjectResponse.ok) {
        throw new Error('Failed to fetch subject')
      }

      const { subject: subjectData } = await subjectResponse.json()
      const subjectStreamId = subjectData.stream_id

      if (!subjectStreamId) {
        throw new Error('Subject stream_id not found')
      }

      // Set stream_id from subject (not from classes)
      setStreamId(subjectStreamId)
      console.log('[UPLOAD_STREAM_ID]', subjectStreamId)

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
      const fetchedChapters = chaptersData.chapters || []
      setChapters(fetchedChapters)

      // Pre-select chapter if chapter_id is in URL
      if (preselectedChapterId) {
        const chapterExists = fetchedChapters.some((ch: Chapter) => ch.id === preselectedChapterId)
        if (chapterExists) {
          setSelectedChapterIds([preselectedChapterId])
        }
      }

      // Fetch classes filtered by stream_id
      const classesResponse = await fetch(`/api/classes?stream_id=${subjectStreamId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (classesResponse.ok) {
        const classesData = await classesResponse.json()
        console.log('[UPLOAD_CLASSES_DATA]', classesData)
        if (classesData.classes && classesData.classes.length > 0) {
          setClasses(classesData.classes)
          console.log('[UPLOAD_CLASSES_COUNT]', classesData.classes.length)
        } else {
          console.error('[UPLOAD_NO_CLASSES]', 'No classes found for this stream')
          setUploadError('No classes found for this stream. Please contact your administrator.')
        }
      } else {
        console.error('[UPLOAD_CLASSES_ERROR]', await classesResponse.text())
      }
    } catch (err) {
      console.error('[UPLOAD_FETCH_ERROR]', err)
      setUploadError(err instanceof Error ? err.message : 'Failed to load form data')
    } finally {
      setLoadingData(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        setFieldErrors(prev => ({ ...prev, file: 'Only PDF files are allowed' }))
        setFile(null)
        return
      }

      // Validate file size (50MB limit - matches Supabase bucket)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setFieldErrors(prev => ({ ...prev, file: 'File size must not exceed 50MB' }))
        setFile(null)
        return
      }

      setFieldErrors(prev => ({ ...prev, file: '' }))
      setFile(selectedFile)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!title.trim()) {
      errors.title = 'Title is required'
    } else if (title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters'
    }

    if (!materialType) {
      errors.materialType = 'Material type is required'
    }

    if (selectedChapterIds.length === 0) {
      errors.chapters = 'At least one chapter must be selected'
    }

    if (selectedClassIds.length === 0) {
      errors.classes = 'At least one class must be selected'
    }

    if (!file) {
      errors.file = 'File is required'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setUploading(true)
      setUploadError(null)
      setUploadProgress(0)

      if (!session) {
        setUploadError('Session expired. Please sign in again.')
        return
      }

      // Step 1: Request signed upload URL (10% progress)
      console.log('[UPLOAD_START] Requesting signed URL...')
      setUploadProgress(10)

      const signedUrlResponse = await fetch('/api/materials/signed-upload-url', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file!.name,
          subject_id: subject_id,
        }),
      })

      const signedUrlData = await signedUrlResponse.json()

      if (!signedUrlResponse.ok) {
        throw new Error(signedUrlData.error || 'Failed to get upload URL')
      }

      console.log('[UPLOAD_SIGNED_URL] Received signed URL')
      setUploadProgress(20)

      // Step 2: Upload file directly to Supabase Storage (20% -> 80% progress)
      console.log('[UPLOAD_FILE] Uploading to storage...')

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('materials_bucket')
        .uploadToSignedUrl(
          signedUrlData.path,
          signedUrlData.token,
          file!
        )

      if (uploadError) {
        console.error('[UPLOAD_FILE_ERROR]', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log('[UPLOAD_FILE_SUCCESS] File uploaded to storage')
      setUploadProgress(80)

      // Step 3: Finalize upload (create database records)
      console.log('[UPLOAD_FINALIZE] Creating database records...')
      console.log('[UPLOAD_FINALIZE_DATA]', {
        stream_id: streamId,
        class_ids: selectedClassIds,
        material_type: materialType,
        chapter_ids: selectedChapterIds
      })

      const finalizeResponse = await fetch('/api/materials/finalize-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          material_id: signedUrlData.material_id,
          institute_id: signedUrlData.institute_id,
          storage_path: signedUrlData.path,
          title: title.trim(),
          material_type: materialType,
          subject_id: subject_id,
          stream_id: streamId,
          class_ids: selectedClassIds,
          chapter_ids: selectedChapterIds,
        }),
      })

      const finalizeData = await finalizeResponse.json()

      if (!finalizeResponse.ok) {
        if (finalizeData.errors) {
          setFieldErrors(finalizeData.errors)
        }
        throw new Error(finalizeData.error || 'Failed to finalize upload')
      }

      console.log('[UPLOAD_COMPLETE] Upload successful!')
      setUploadProgress(100)

      // Success! Redirect to materials browse page
      setTimeout(() => {
        router.push(`/dashboard/materials/${subject_id}`)
      }, 500)
    } catch (err) {
      console.error('[UPLOAD_ERROR]', err)
      setUploadError(err instanceof Error ? err.message : 'Failed to upload material')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state
  if (loading || teacherLoading || loadingData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  const chapterOptions: MultiSelectOption[] = chapters.map(ch => ({
    id: ch.id,
    name: ch.name
  }))

  const classOptions: MultiSelectOption[] = classes.map(cls => {
    const stream = cls.streams
    const classLevel = cls.class_levels
    const displayName = `${stream.name} - ${classLevel.name}${cls.batch_name ? ` (${cls.batch_name})` : ''}`
    return {
      id: cls.id,
      name: displayName
    }
  })

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3 text-neutral-600">
          <Link
            href={`/dashboard/materials/${subject_id}`}
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Materials
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UploadIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">Upload Material</h1>
            <p className="text-lg text-neutral-600 mt-1">Add a new study material</p>
          </div>
        </div>
      </motion.div>
      {/* Error Alert */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-error-50 border border-error-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-error-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-error-900 mb-1">Upload Failed</h3>
              <p className="text-error-700 text-sm">{uploadError}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upload Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-700">
              Material Title <span className="text-error-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 1 Notes - Cell Biology"
              required
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-neutral-900 placeholder:text-neutral-400"
            />
            <p className="text-xs text-neutral-600">Give a descriptive title for this material</p>
            {fieldErrors.title && (
              <p className="text-sm text-error-600">{fieldErrors.title}</p>
            )}
          </div>

          {/* Material Type */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-700">
              Material Type <span className="text-error-600">*</span>
            </label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value as 'scope' | 'style' | '')}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-neutral-900"
              required
            >
              <option value="">Select material type...</option>
              <option value="scope">Theory and examples (notes/Books)</option>
              <option value="style">Papers (practice sets, PYQs, DPPs etc)</option>
            </select>
            {fieldErrors.materialType && (
              <p className="text-sm text-error-600">{fieldErrors.materialType}</p>
            )}
          </div>

            {/* Classes */}
            <MultiSelect
              label="Classes / Batches"
              options={classOptions}
              selectedIds={selectedClassIds}
              onChange={setSelectedClassIds}
              placeholder="Select classes this material is for..."
              required
              error={fieldErrors.classes}
            />
            {classes.length === 0 && (
              <p className="text-sm text-warning">No classes found. Please contact your administrator.</p>
            )}

            {/* Chapters */}
            <MultiSelect
              label="Chapters"
              options={chapterOptions}
              selectedIds={selectedChapterIds}
              onChange={setSelectedChapterIds}
              placeholder="Select chapters this material covers..."
              required
              error={fieldErrors.chapters}
            />
            {chapters.length === 0 && (
              <p className="text-sm text-warning">No chapters found for this subject. Please contact your administrator.</p>
            )}

          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-700">
              PDF File <span className="text-error-600">*</span>
            </label>
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              fieldErrors.file ? 'border-error-300 bg-error-50' : 'border-neutral-300 hover:border-primary-400 hover:bg-primary-50/50'
            }`}>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                required
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {file ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-neutral-900">{file.name}</p>
                      <p className="text-sm text-neutral-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <p className="text-sm text-primary-600 hover:underline font-medium">Click to change file</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center">
                      <FileText className="h-8 w-8 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-base text-neutral-700">
                        <span className="text-primary-600 hover:underline font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-sm text-neutral-500 mt-1">PDF files only, max 50MB</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
            {fieldErrors.file && (
              <p className="text-sm text-error-600">{fieldErrors.file}</p>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && uploadProgress > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-900">Uploading...</span>
                <span className="text-sm font-bold text-blue-900">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadIcon className="h-5 w-5" />
                  <span>Upload Material</span>
                </>
              )}
            </button>
            <Link
              href={`/dashboard/materials/${subject_id}`}
              className="px-6 py-3.5 border-2 border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-semibold"
            >
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Tips for Uploading Materials</h3>
            <ul className="text-sm text-blue-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Use clear, descriptive titles to easily find materials later</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Select all chapters that this material covers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Only one file per upload to maintain data accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Materials are used by AI for generating test questions</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
