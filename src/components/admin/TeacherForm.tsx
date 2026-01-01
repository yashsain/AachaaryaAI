'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MultiSelect, MultiSelectOption } from '@/components/ui/MultiSelect'
import type { Session } from '@supabase/supabase-js'

interface TeacherFormProps {
  mode: 'create' | 'edit'
  session: Session // Session from parent (centralized)
  teacherId?: string
  initialData?: {
    name: string
    email: string
    phone?: string
    role: 'teacher' | 'admin'
    subject_ids: string[]
    class_ids: string[]
  }
  onSuccess: () => void
  onCancel: () => void
}

interface Subject {
  id: string
  name: string
  streams?: { name: string }
}

interface Class {
  id: string
  batch_name: string
  streams?: { name: string }
  class_levels?: { name: string }
}

export function TeacherForm({
  mode,
  session,
  teacherId,
  initialData,
  onSuccess,
  onCancel,
}: TeacherFormProps) {
  // Form state
  const [name, setName] = useState(initialData?.name || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [phone, setPhone] = useState(initialData?.phone || '')
  const [role, setRole] = useState<'teacher' | 'admin'>(initialData?.role || 'teacher')
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(initialData?.subject_ids || [])
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(initialData?.class_ids || [])

  // Data state
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classes, setClasses] = useState<Class[]>([])

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Fetch subjects and classes on mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Using centralized session passed from parent (no redundant getSession call)
        if (!session) {
          setError('No active session')
          return
        }

        const token = session.access_token

        // Fetch subjects
        const subjectsRes = await fetch('/api/admin/subjects', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (subjectsRes.ok) {
          const { subjects: fetchedSubjects } = await subjectsRes.json()
          setSubjects(fetchedSubjects || [])
        }

        // Fetch classes
        const classesRes = await fetch('/api/admin/classes', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (classesRes.ok) {
          const { classes: fetchedClasses } = await classesRes.json()
          setClasses(fetchedClasses || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load form data')
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [])

  // Validate form
  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!name.trim()) errors.name = 'Name is required'
    if (!email.trim()) errors.email = 'Email is required'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format'
    }
    // Subjects are now optional
    // if (selectedSubjectIds.length === 0) {
    //   errors.subjects = 'At least one subject must be selected'
    // }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setIsLoading(true)

    try {
      // Using centralized session passed from parent (no redundant getSession call)
      if (!session) {
        setError('No active session. Please log in again.')
        return
      }

      const token = session.access_token
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        role,
        subject_ids: selectedSubjectIds,
        class_ids: selectedClassIds,
      }

      let response
      if (mode === 'create') {
        response = await fetch('/api/admin/teachers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch(`/api/admin/teachers/${teacherId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })
      }

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'An error occurred')
        return
      }

      onSuccess()
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const subjectOptions: MultiSelectOption[] = subjects.map(subject => ({
    id: subject.id,
    name: subject.name,
    meta: subject.streams?.name,
  }))

  const classOptions: MultiSelectOption[] = classes.map(cls => ({
    id: cls.id,
    name: cls.batch_name || `${cls.streams?.name} - ${cls.class_levels?.name}`,
    meta: `${cls.streams?.name} - ${cls.class_levels?.name}`,
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Input
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter teacher's full name"
        required
        error={fieldErrors.name}
        disabled={isLoading}
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="teacher@example.com"
        required
        error={fieldErrors.email}
        disabled={isLoading || mode === 'edit'} // Can't change email in edit mode
        helperText={mode === 'edit' ? 'Email cannot be changed' : undefined}
      />

      <Input
        label="Phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+91 98765 43210"
        error={fieldErrors.phone}
        disabled={isLoading}
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'teacher' | 'admin')}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-100"
        >
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Admins can manage teachers and institute settings
        </p>
      </div>

      <MultiSelect
        label="Subjects"
        options={subjectOptions}
        selectedIds={selectedSubjectIds}
        onChange={setSelectedSubjectIds}
        placeholder="Select subjects this teacher will teach (optional)"
        required={false}
        error={fieldErrors.subjects}
        disabled={isLoading}
      />

      <MultiSelect
        label="Classes (Optional)"
        options={classOptions}
        selectedIds={selectedClassIds}
        onChange={setSelectedClassIds}
        placeholder="Select classes to assign (optional)"
        disabled={isLoading}
      />

      {mode === 'create' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> An invitation email will be sent to {email || 'the provided email'}.
            The teacher can set their password using the link in the email.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {mode === 'create' ? 'Create Teacher & Send Invitation' : 'Update Teacher'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
