'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { BookOpen, Upload, Download, FileText, ChevronDown, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  isDefaultExpanded?: boolean
}

export function ChapterSection({
  chapter,
  subjectId,
  onUpload,
  isDefaultExpanded = false
}: ChapterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(isDefaultExpanded)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Chapter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-8 py-6 flex items-center justify-between hover:bg-neutral-50 transition-colors group"
      >
        <div className="flex items-center gap-4">
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
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-neutral-400 transition-transform duration-300',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

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
                      <Link
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </Link>
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
    </div>
  )
}
