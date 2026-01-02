'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { Session } from '@supabase/supabase-js'
import {
  Users,
  Mail,
  Phone,
  Edit2,
  Trash2,
  BookOpen,
  Shield,
  UserCircle,
  AlertCircle
} from 'lucide-react'

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
  session: Session  // Session from parent (centralized)
  onDeleteSuccess: () => void
}

export function TeacherTable({ teachers, session, onDeleteSuccess }: TeacherTableProps) {
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-neutral-300"
      >
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="h-10 w-10 text-neutral-400" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 mb-2">No teachers yet</h3>
        <p className="text-sm text-neutral-600 mb-6 max-w-md mx-auto">
          Get started by creating a new teacher account for your institute.
        </p>
      </motion.div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {teachers.map((teacher, index) => (
          <motion.div
            key={teacher.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group bg-white rounded-2xl shadow-sm border border-neutral-200 hover:shadow-lg hover:border-primary-300 transition-all duration-300 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                {/* Left: Teacher Info */}
                <div className="flex-1 space-y-4">
                  {/* Name and Role */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserCircle className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                          {teacher.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg ${
                            teacher.role === 'admin'
                              ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border border-purple-300'
                              : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                          }`}
                        >
                          {teacher.role === 'admin' && <Shield className="h-3 w-3" />}
                          {teacher.role}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 mt-2">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                        {teacher.phone && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{teacher.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                      <BookOpen className="h-3.5 w-3.5" />
                      Subjects
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {teacher.teacher_subjects.length > 0 ? (
                        teacher.teacher_subjects.map((ts) => (
                          <span
                            key={ts.subject_id}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-lg shadow-sm"
                          >
                            {ts.subjects.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-neutral-400 italic">No subjects assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/dashboard/admin/teachers/${teacher.id}/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-primary-50 text-neutral-700 hover:text-primary-600 rounded-xl transition-all font-medium text-sm border border-neutral-200 hover:border-primary-300"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => openDeleteModal(teacher)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-error-50 hover:bg-error-100 text-error-600 hover:text-error-700 rounded-xl transition-all font-medium text-sm border border-error-200 hover:border-error-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
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
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={isDeleting}
              disabled={isDeleting}
              className="px-6 py-2.5 bg-gradient-to-r from-error-600 to-error-700 hover:from-error-700 hover:to-error-800 shadow-lg hover:shadow-xl"
            >
              Delete Teacher
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="bg-error-50 border border-error-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-error-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-error-600" />
                </div>
                <p className="text-sm text-error-800 mt-0.5">{deleteError}</p>
              </div>
            </div>
          )}
          <p className="text-sm text-neutral-700 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-neutral-900">{teacherToDelete?.name}</span>?
          </p>
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-neutral-700 mb-2 uppercase tracking-wide">This will:</p>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Soft delete the teacher record</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Free up their email for reuse</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Preserve test papers and materials for records</span>
              </li>
            </ul>
          </div>
          <div className="bg-error-50 border border-error-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-error-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              This action cannot be easily undone.
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
