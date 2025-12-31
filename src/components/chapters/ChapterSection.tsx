'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

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
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Chapter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📘</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{chapter.name}</h3>
            <p className="text-sm text-gray-500">
              {chapter.material_count} {chapter.material_count === 1 ? 'material' : 'materials'}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Chapter Content (Materials) */}
      {isExpanded && (
        <div className="px-6 pb-4 space-y-3">
          {chapter.materials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No materials yet</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onUpload(chapter.id)}
              >
                📤 Upload Material
              </Button>
            </div>
          ) : (
            <>
              {/* Materials List */}
              <div className="space-y-2">
                {chapter.materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {material.title}
                        </h4>
                        {material.chapter_count > 1 && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            title={`Also in: ${material.all_chapters.filter(c => c !== chapter.name).join(', ')}`}
                          >
                            +{material.chapter_count - 1} more
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {material.material_types?.name || 'Material'} • {new Date(material.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 text-gray-600 hover:text-gray-900"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onUpload(chapter.id)}
                  className="w-full"
                >
                  📤 Upload More Materials
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
