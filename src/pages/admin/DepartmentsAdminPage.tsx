import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/LoadingSkeleton'
import { useAuth } from '@/hooks/useAuth'
import {
  getAdminDepartments,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
  type DepartmentWithSchool,
} from '@/services/departments.service'
import supabase from '@/lib/supabase'

interface DeptFormData {
  name: string
  slug: string
  school_id: string
  description?: string
}

export default function DepartmentsAdminPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [showForm, setShowForm] = React.useState(false)
  const [editingDepartment, setEditingDepartment] = React.useState<DepartmentWithSchool | null>(null)
  const [deactivateTarget, setDeactivateTarget] = React.useState<{ id: string; name: string } | null>(null)
  const [formData, setFormData] = React.useState<DeptFormData>({
    name: '',
    slug: '',
    school_id: '',
    description: '',
  })
  const [formError, setFormError] = React.useState<string | null>(null)
  const [pageError, setPageError] = React.useState<string | null>(null)

  const { data: defaultInstitutionId } = useQuery({
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

  const { data: departments = [], isLoading, error: departmentsError } = useQuery({
    queryKey: ['admin-departments', institutionId],
    queryFn: () => getAdminDepartments(institutionId),
    enabled: Boolean(institutionId),
  })
  const { data: schools = [], error: schoolsError } = useQuery({
    queryKey: ['admin-schools', institutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('institution_id', institutionId!)
        .eq('is_active', true)
        .order('name', { ascending: true })
      if (error) throw new Error(`Failed to load schools: ${error.message}`)
      return data ?? []
    },
    enabled: Boolean(institutionId),
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!institutionId) throw new Error('No institution is available for this administrator.')
      if (!formData.name.trim() || !formData.slug.trim()) throw new Error('Name and slug are required')
      const details = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        school_id: formData.school_id || null,
        description: formData.description?.trim() || null,
      }
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, details)
      } else {
        await createDepartment({ ...details, institution_id: institutionId })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] })
      setShowForm(false)
      setEditingDepartment(null)
      setFormData({ name: '', slug: '', school_id: '', description: '' })
      setFormError(null)
    },
    onError: (e: Error) => setFormError(e.message),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] })
      setDeactivateTarget(null)
    },
    onError: (error) => {
      setPageError(error instanceof Error ? error.message : 'Failed to deactivate department.')
      setDeactivateTarget(null)
    },
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => updateDepartment(id, { is_active: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-departments'] }),
    onError: (error) => setPageError(error instanceof Error ? error.message : 'Failed to activate department.'),
  })

  const openNewDepartment = () => {
    setEditingDepartment(null)
    setFormData({ name: '', slug: '', school_id: '', description: '' })
    setFormError(null)
    setShowForm(true)
  }

  const openEditDepartment = (department: DepartmentWithSchool) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      slug: department.slug,
      school_id: department.school_id ?? '',
      description: department.description ?? '',
    })
    setFormError(null)
    setShowForm(true)
  }

  return (
    <>
      <title>Departments | UniConnect Admin</title>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-text-primary">Departments</h1>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openNewDepartment}>
            Add Department
          </Button>
        </div>
        {(pageError || departmentsError || schoolsError) && (
          <p role="alert" className="text-sm text-danger">
            {pageError
              ?? (departmentsError instanceof Error ? departmentsError.message : null)
              ?? (schoolsError instanceof Error ? schoolsError.message : 'Failed to load department data.')}
          </p>
        )}

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">School</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[1,2,3,4].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                  </tr>
                ))
              ) : departments.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-text-muted">No departments found.</td></tr>
              ) : (
                departments.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3 font-medium text-text-primary">{d.name}</td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{d.school_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={d.is_active ? 'green' : 'gray'}>{d.is_active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEditDepartment(d)}
                        className="p-2 text-text-muted hover:text-brand-600"
                        aria-label={`Edit ${d.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {d.is_active && (
                        <button onClick={() => setDeactivateTarget({ id: d.id, name: d.name })}
                          className="text-xs text-danger hover:text-red-700 font-medium transition-colors">
                          Deactivate
                        </button>
                      )}
                      {!d.is_active && (
                        <button
                          type="button"
                          onClick={() => activateMutation.mutate(d.id)}
                          disabled={activateMutation.isPending}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={showForm}
        onOpenChange={(open) => { setShowForm(open); setFormError(null) }}
        title={editingDepartment ? 'Edit Department' : 'Add Department'}
      >
        <div className="space-y-4">
          <Input label="Name" required value={formData.name}
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
          <Input label="Slug" required hint="e.g. cs-se" value={formData.slug}
            onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} />
          <Select
            label="School or college"
            value={formData.school_id}
            options={[
              { value: '', label: 'No school selected' },
              ...schools.map((school) => ({ value: school.id, label: school.name })),
            ]}
            onChange={(event) => setFormData((current) => ({ ...current, school_id: event.target.value }))}
          />
          <Input label="Description" value={formData.description}
            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <div className="flex gap-3 pt-1">
            <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
              {editingDepartment ? 'Save changes' : 'Create'}
            </Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      </Dialog>

      {deactivateTarget && (
        <ConfirmDialog open={!!deactivateTarget} onOpenChange={o => !o && setDeactivateTarget(null)}
          title="Deactivate Department"
          description={`Deactivate "${deactivateTarget.name}"? Lecturers in this department will not be affected.`}
          confirmLabel="Deactivate" variant="danger"
          loading={deactivateMutation.isPending}
          onConfirm={() => deactivateMutation.mutate(deactivateTarget.id)} />
      )}
    </>
  )
}
