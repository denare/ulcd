import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { SearchBar } from '@/components/search/SearchBar'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/LoadingSkeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/hooks/useAuth'
import {
  createCourse,
  getAdminCourses,
  updateCourse,
  type CourseWithDepartment,
} from '@/services/courses.service'
import { getAdminDepartments } from '@/services/departments.service'
import supabase from '@/lib/supabase'

interface CourseFormState {
  course_code: string
  course_name: string
  department_id: string
  description: string
  academic_year: string
  semester: string
}

const EMPTY_FORM: CourseFormState = {
  course_code: '',
  course_name: '',
  department_id: '',
  description: '',
  academic_year: '',
  semester: '',
}

export default function CoursesAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [localQ, setLocalQ] = React.useState(searchParams.get('q') ?? '')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingCourse, setEditingCourse] = React.useState<CourseWithDepartment | null>(null)
  const [form, setForm] = React.useState<CourseFormState>(EMPTY_FORM)
  const [pageError, setPageError] = React.useState<string | null>(null)
  const debouncedQ = useDebounce(localQ, 350)

  const { data: defaultInstitutionId, error: institutionError } = useQuery({
    queryKey: ['udom-institution-id'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('id')
        .eq('slug', 'udom')
        .single()
      if (error) throw new Error(`Failed to load institution: ${error.message}`)
      return data.id
    },
  })
  const institutionId = user?.institution_id ?? defaultInstitutionId

  React.useEffect(() => {
    const p = new URLSearchParams(searchParams)
    if (debouncedQ) p.set('q', debouncedQ)
    else p.delete('q')
    setSearchParams(p, { replace: true })
  }, [debouncedQ]) // eslint-disable-line react-hooks/exhaustive-deps

  const q = searchParams.get('q') ?? ''
  const { data: courses = [], isLoading, error: coursesError } = useQuery({
    queryKey: ['admin-courses', q, institutionId],
    queryFn: () => getAdminCourses({ query: q, instId: institutionId }),
    staleTime: 60_000,
    enabled: Boolean(institutionId),
  })
  const { data: departments = [], error: departmentsError } = useQuery({
    queryKey: ['admin-departments', institutionId],
    queryFn: () => getAdminDepartments(institutionId),
    enabled: Boolean(institutionId),
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!institutionId) throw new Error('No institution is available for this administrator.')
      if (!form.course_code.trim() || !form.course_name.trim()) {
        throw new Error('Course code and course name are required.')
      }

      const details = {
        department_id: form.department_id || null,
        course_code: form.course_code.trim().toUpperCase(),
        course_name: form.course_name.trim(),
        description: form.description.trim() || null,
        academic_year: form.academic_year.trim() || null,
        semester: form.semester ? Number(form.semester) : null,
      }

      if (editingCourse) {
        await updateCourse(editingCourse.id, details)
      } else {
        await createCourse({ ...details, institution_id: institutionId })
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      setDialogOpen(false)
      setEditingCourse(null)
      setForm(EMPTY_FORM)
      setPageError(null)
    },
    onError: (error) => {
      setPageError(error instanceof Error ? error.message : 'Failed to save course.')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCourse(id, { is_active: isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-courses'] }),
    onError: (error) => {
      setPageError(error instanceof Error ? error.message : 'Failed to update course status.')
    },
  })

  const openNewCourse = () => {
    setEditingCourse(null)
    setForm(EMPTY_FORM)
    setPageError(null)
    setDialogOpen(true)
  }

  const openEditCourse = (course: CourseWithDepartment) => {
    setEditingCourse(course)
    setForm({
      course_code: course.course_code,
      course_name: course.course_name,
      department_id: course.department_id ?? '',
      description: course.description ?? '',
      academic_year: course.academic_year ?? '',
      semester: course.semester?.toString() ?? '',
    })
    setPageError(null)
    setDialogOpen(true)
  }

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    saveMutation.mutate()
  }

  return (
    <>
      <title>Courses | UniConnect Admin</title>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-text-primary">Courses</h1>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openNewCourse}>
            Add course
          </Button>
        </div>

        <SearchBar value={localQ} onChange={setLocalQ} placeholder="Search by code or name..." />
        {(pageError || institutionError || coursesError || departmentsError) && (
          <p role="alert" className="text-sm text-danger">
            {pageError
              ?? (institutionError instanceof Error ? institutionError.message : null)
              ?? (coursesError instanceof Error ? coursesError.message : null)
              ?? (departmentsError instanceof Error ? departmentsError.message : 'Failed to load course data.')}
          </p>
        )}

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Code</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">Department</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || !institutionId ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[1,2,3,4].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                  </tr>
                ))
              ) : courses.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-text-muted">No courses found.</td></tr>
              ) : (
                courses.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3 font-mono font-medium text-brand-700">{c.course_code}</td>
                    <td className="px-4 py-3 text-text-primary">{c.course_name}</td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{c.departments?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.is_active ? 'green' : 'gray'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditCourse(c)}
                        className="p-2 text-text-muted hover:text-brand-600"
                        aria-label={`Edit ${c.course_code}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => statusMutation.mutate({ id: c.id, isActive: !c.is_active })}
                        disabled={statusMutation.isPending}
                        className="px-2 py-1 text-xs text-text-secondary hover:text-brand-600"
                      >
                        {c.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingCourse ? 'Edit Course' : 'Add Course'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Course code"
            required
            value={form.course_code}
            onChange={(event) => setForm((current) => ({ ...current, course_code: event.target.value }))}
          />
          <Input
            label="Course name"
            required
            value={form.course_name}
            onChange={(event) => setForm((current) => ({ ...current, course_name: event.target.value }))}
          />
          <Select
            label="Department"
            value={form.department_id}
            options={[
              { value: '', label: 'No department' },
              ...departments.map((department) => ({ value: department.id, label: department.name })),
            ]}
            onChange={(event) => setForm((current) => ({ ...current, department_id: event.target.value }))}
          />
          <Input
            label="Academic year"
            placeholder="2025/2026"
            value={form.academic_year}
            onChange={(event) => setForm((current) => ({ ...current, academic_year: event.target.value }))}
          />
          <Select
            label="Semester"
            value={form.semester}
            options={[
              { value: '', label: 'Not specified' },
              { value: '1', label: 'Semester 1' },
              { value: '2', label: 'Semester 2' },
              { value: '3', label: 'Semester 3' },
            ]}
            onChange={(event) => setForm((current) => ({ ...current, semester: event.target.value }))}
          />
          <Textarea
            label="Description"
            rows={3}
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          {pageError && <p role="alert" className="text-sm text-danger">{pageError}</p>}
          <div className="flex gap-2">
            <Button type="submit" loading={saveMutation.isPending}>
              {editingCourse ? 'Save changes' : 'Create course'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
