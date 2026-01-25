'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { BookOpen, Upload, FileText, ChevronDown, Eye, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSession } from '@/hooks/useSession'
import { toast } from '@/components/ui/toast'

interface Material {
  id: string
  title: string
  file_url: string
  created_at: string
  material_types?: { name: string }
  chapter_count: number
  all_chapters: string[]
}

interface ChapterSectionProps {
  chapter: {
    id: string
    name: string
    material_count: number
    materials: Material[]
  }
  subjectId: string
  onUpload: (chapterId: string) => void
  onDelete?: (chapterId: string) => void
  isDefaultExpanded?: boolean
}

export function ChapterSection({
  chapter,
  subjectId,
  onUpload,
  onDelete,
  isDefaultExpanded = false
}: ChapterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(isDefaultExpanded)
  const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null)
  const [signedViewUrl, setSignedViewUrl] = useState<string | null>(null)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { session } = useSession()

  // Fetch signed URL when material is selected for viewing
  useEffect(() => {
    async function fetchSignedUrl() {
      if (!viewingMaterial || !session) return

      setLoadingUrl(true)
      try {
        const response = await fetch(`/api/materials/${viewingMaterial.id}/view-url`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('[MATERIAL_VIEW_URL_ERROR]', errorData)
          toast.error(`Failed to load PDF: ${errorData.error || 'Unknown error'}`)
          setViewingMaterial(null) // Close modal on error
          return
        }

        const data = await response.json()
        console.log('[MATERIAL_VIEW_URL_RECEIVED]', data.view_url)
        setSignedViewUrl(data.view_url)
      } catch (error) {
        console.error('[MATERIAL_VIEW_URL_EXCEPTION]', error)
        toast.error(`Failed to load PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setViewingMaterial(null)
      } finally {
        setLoadingUrl(false)
      }
    }

    fetchSignedUrl()
  }, [viewingMaterial, session])

  // Reset signed URL when closing modal
  const handleCloseViewer = () => {
    setViewingMaterial(null)
    setSignedViewUrl(null)
  }

  // Handle chapter deletion
  const handleDeleteChapter = async () => {
    if (!session || !onDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/chapters/${chapter.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[CHAPTER_DELETE_ERROR]', errorData)
        toast.error(errorData.error || 'Failed to delete chapter')
        return
      }

      const data = await response.json()
      console.log('[CHAPTER_DELETE_SUCCESS]', data)

      // Build detailed description for toast
      const { details } = data
      const summary = [
        details.materials_deleted > 0 && `${details.materials_deleted} material(s) deleted`,
        details.files_deleted > 0 && `${details.files_deleted} file(s) removed from storage`,
        details.links_removed > 0 && `${details.links_removed} material link(s) removed`,
        details.questions_deleted > 0 && `${details.questions_deleted} question(s) deleted`,
      ].filter(Boolean).join(', ')

      // Show success toast with description
      toast.success(`Chapter "${chapter.name}" deleted successfully`, {
        description: summary || 'No associated data found.',
      })

      // Call parent's onDelete to refresh the list
      onDelete(chapter.id)
    } catch (error) {
      console.error('[CHAPTER_DELETE_EXCEPTION]', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete chapter')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Chapter Header */}
      <div className="w-full px-8 py-6 flex items-center justify-between hover:bg-neutral-50 transition-colors group">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-4 flex-1"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-shadow">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
              {chapter.name}
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              {chapter.material_count} {chapter.material_count === 1 ? 'material' : 'materials'}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteConfirm(true)
              }}
              className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete chapter"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2"
          >
            <ChevronDown
              className={cn(
                'w-5 h-5 text-neutral-400 transition-transform duration-300',
                isExpanded && 'rotate-180'
              )}
            />
          </button>
        </div>
      </div>

      {/* Chapter Content (Materials) */}
      {isExpanded && (
        <div className="px-8 pb-6 space-y-4 border-t border-neutral-100 bg-gradient-to-br from-white to-neutral-50/50">
          {chapter.materials.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-neutral-400" />
              </div>
              <p className="text-neutral-600 mb-4">No materials yet</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onUpload(chapter.id)}
                className="inline-flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Material
              </Button>
            </div>
          ) : (
            <>
              {/* Materials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                {chapter.materials.map((material) => (
                  <div
                    key={material.id}
                    className="group relative bg-white border border-neutral-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-primary-600 flex-shrink-0" />
                          <h4 className="font-semibold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
                            {material.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md">
                            {material.material_types?.name || 'Material'}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {new Date(material.created_at).toLocaleDateString()}
                          </span>
                          {material.chapter_count > 1 && (
                            <span
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium"
                              title={`Also in: ${material.all_chapters.filter(c => c !== chapter.name).join(', ')}`}
                            >
                              +{material.chapter_count - 1} more
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setViewingMaterial(material)}
                        className="flex-shrink-0 p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View PDF"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              <div className="pt-2">
                <button
                  onClick={() => onUpload(chapter.id)}
                  className="w-full py-3 px-4 border-2 border-dashed border-neutral-300 rounded-xl hover:border-primary-400 hover:bg-primary-50/50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center gap-2 text-neutral-600 group-hover:text-primary-600">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm font-medium">Upload More Materials</span>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingMaterial && (
        <Dialog open={!!viewingMaterial} onOpenChange={(open) => !open && handleCloseViewer()}>
          <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 overflow-hidden flex flex-col">
            <DialogHeader className="px-6 py-4 border-b border-neutral-200 flex-shrink-0">
              <DialogTitle className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                {viewingMaterial.title}
              </DialogTitle>
            </DialogHeader>
            {loadingUrl || !signedViewUrl ? (
              <div className="flex-1 bg-neutral-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                  <p className="mt-4 text-neutral-600 font-medium">Loading PDF...</p>
                </div>
              </div>
            ) : (
              <div
                className="flex-1 bg-neutral-100 relative"
                onContextMenu={(e) => e.preventDefault()} // Disable right-click
              >
                <iframe
                  src={signedViewUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  title={viewingMaterial.title}
                />
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-neutral-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg pointer-events-none">
              <p className="text-white text-xs font-medium">View Only</p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                Delete Chapter
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-neutral-700">
                Are you sure you want to delete <span className="font-bold">"{chapter.name}"</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-red-900">This will permanently delete:</p>
                <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
                  <li>All materials exclusively linked to this chapter</li>
                  <li>All PDF files from storage</li>
                  <li>All questions associated with this chapter</li>
                  <li>All test paper section links</li>
                </ul>
                <p className="text-sm font-semibold text-red-900 mt-3">
                  Materials linked to other chapters will remain but will be unlinked from this chapter.
                </p>
              </div>
              <p className="text-sm text-neutral-600 font-medium">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteChapter}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Chapter
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
