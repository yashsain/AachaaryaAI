'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase'

interface TeacherSubject {
  subject_id: string
  subjects: {
    id: string
    name: string
  }
}

interface Teacher {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  created_at: string
  teacher_subjects: TeacherSubject[]
}

interface TeacherTableProps {
  teachers: Teacher[]
  onDeleteSuccess: () => void
}

export function TeacherTable({ teachers, onDeleteSuccess }: TeacherTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const openDeleteModal = (teacher: Teacher) => {
    setTeacherToDelete(teacher)
    setDeleteModalOpen(true)
    setDeleteError('')
  }

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false)
      setTeacherToDelete(null)
      setDeleteError('')
    }
  }

  const handleDelete = async () => {
    if (!teacherToDelete) return

    setIsDeleting(true)
    setDeleteError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setDeleteError('No active session')
        return
      }

      const response = await fetch(`/api/admin/teachers/${teacherToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        setDeleteError(data.error || 'Failed to delete teacher')
        return
      }

      // Success
      closeDeleteModal()
      onDeleteSuccess()
    } catch (error) {
      console.error('Error deleting teacher:', error)
      setDeleteError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new teacher account.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjects
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{teacher.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{teacher.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        teacher.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {teacher.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.teacher_subjects.map((ts) => (
                        <span
                          key={ts.subject_id}
                          className="inline-flex px-2 py-1 text-xs bg-gray-900 text-white rounded-md"
                        >
                          {ts.subjects.name}
                        </span>
                      ))}
                      {teacher.teacher_subjects.length === 0 && (
                        <span className="text-xs text-gray-400">No subjects assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/admin/teachers/${teacher.id}/edit`}
                      className="text-gray-900 hover:text-gray-700 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => openDeleteModal(teacher)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Teacher"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{deleteError}</p>
            </div>
          )}
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>{teacherToDelete?.name}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            This will:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Soft delete the teacher record</li>
            <li>Free up their email for reuse</li>
            <li>Preserve test papers and materials for records</li>
          </ul>
          <p className="text-sm font-medium text-red-600">
            This action cannot be easily undone.
          </p>
        </div>
      </Modal>
    </>
  )
}
