'use client'

/**
 * Upload Material Page
 *
 * Form for uploading new study materials
 * - Title, material type, chapters, file upload
 * - Validates all fields before submission
 * - Redirects to materials browse after success
 */

import { useRequireAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { MultiSelect, MultiSelectOption } from '@/components/ui/MultiSelect'
import { Input } from '@/components/ui/Input'

interface MaterialType {
  id: string
  name: string
}

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
  const { teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireAuth()
  const router = useRouter()
  const params = useParams()
  const subject_id = params.subject_id as string

  // Form state
  const [title, setTitle] = useState('')
  const [materialTypeId, setMaterialTypeId] = useState('')
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([])
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)

  // Options data
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([])
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

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setUploadError('Session expired. Please sign in again.')
        return
      }

      // Fetch material types
      const typesResponse = await fetch('/api/material-types', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!typesResponse.ok) {
        throw new Error('Failed to fetch material types')
      }

      const typesData = await typesResponse.json()
      setMaterialTypes(typesData.materialTypes || [])

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

      // Fetch classes for multi-select
      const classesResponse = await fetch('/api/classes', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (classesResponse.ok) {
        const classesData = await classesResponse.json()
        console.log('[UPLOAD_CLASSES_DATA]', classesData)
        if (classesData.classes && classesData.classes.length > 0) {
          setClasses(classesData.classes)
          // Derive stream_id from first class (all classes should have same stream for this subject)
          setStreamId(classesData.classes[0].stream_id)
          console.log('[UPLOAD_STREAM_ID]', classesData.classes[0].stream_id)
        } else {
          console.error('[UPLOAD_NO_CLASSES]', 'No classes found for institute')
          setUploadError('No classes found. Please contact your administrator.')
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

    if (!materialTypeId) {
      errors.materialTypeId = 'Material type is required'
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

      const { data: { session } } = await supabase.auth.getSession()
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
        material_type_id: materialTypeId,
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
          material_type_id: materialTypeId,
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
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-saffron border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/materials/${subject_id}`}>
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">Upload Material</h1>
                <p className="text-sm text-neutral-600 mt-0.5">Add a new study material</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {uploadError && (
          <div className="bg-error/10 border border-error/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-error text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-error font-medium">Upload Failed</p>
                <p className="text-error/80 text-sm mt-1">{uploadError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Input
              label="Material Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 1 Notes - Cell Biology"
              required
              error={fieldErrors.title}
              helperText="Give a descriptive title for this material"
            />

            {/* Material Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Type <span className="text-red-500">*</span>
              </label>
              <select
                value={materialTypeId}
                onChange={(e) => setMaterialTypeId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-saffron focus:border-transparent transition-colors ${
                  fieldErrors.materialTypeId ? 'border-error' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select material type...</option>
                {materialTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {fieldErrors.materialTypeId && (
                <p className="mt-1 text-sm text-error">{fieldErrors.materialTypeId}</p>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PDF File <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                fieldErrors.file ? 'border-error bg-error/5' : 'border-gray-300 hover:border-brand-saffron'
              } transition-colors`}>
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
                    <div className="space-y-2">
                      <svg className="mx-auto h-12 w-12 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-neutral-800">{file.name}</p>
                      <p className="text-xs text-neutral-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p className="text-xs text-brand-blue hover:underline">Click to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        <span className="text-brand-blue hover:underline">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF files only, max 50MB</p>
                    </div>
                  )}
                </label>
              </div>
              {fieldErrors.file && (
                <p className="mt-1 text-sm text-error">{fieldErrors.file}</p>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Uploading...</span>
                  <span className="text-neutral-800 font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-white">{uploading ? 'Uploading...' : 'Upload Material'}</span>
              </button>
              <Link
                href={`/dashboard/materials/${subject_id}`}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-blue-600 text-xl">💡</span>
            <div>
              <p className="text-sm text-blue-800 font-medium">Tips for Uploading Materials</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>Use clear, descriptive titles to easily find materials later</li>
                <li>Select all chapters that this material covers</li>
                <li>Only one file per upload to maintain data accuracy</li>
                <li>Materials are used by AI for generating test questions</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
