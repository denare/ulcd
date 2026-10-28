import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ContactForm } from '@/components/admin/ContactForm'
import { lecturerSchema, ACADEMIC_TITLES, PUBLICATION_STATUSES, VERIFICATION_STATUSES, type LecturerFormData, computeDisplayName } from '@/lib/validation/lecturer.schema'
import { getAdminLecturer, createLecturer, updateLecturer } from '@/services/lecturers.service'
import { getLecturerContacts, deleteContact } from '@/services/contacts.service'
import { getPublicDepartments } from '@/services/departments.service'
import { formatContactType } from '@/utils/formatting'
import supabase from '@/lib/supabase'

export default function LecturerFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showContactForm, setShowContactForm] = React.useState(false)
  const [deleteContact_, setDeleteContact_] = React.useState<{ id: string; value: string } | null>(null)

  // Institution (for now hard-code to UDOM id from query)
  const [institutionId, setInstitutionId] = React.useState<string>('')
  React.useEffect(() => {
    supabase.from('institutions').select('id').eq('slug', 'udom').single()
      .then(({ data }) => { if (data) setInstitutionId(data.id) })
  }, [])

  // Fetch existing if editing
  const { data: existing } = useQuery({
    queryKey: ['admin-lecturer-single', id],
    queryFn: () => getAdminLecturer(id!),
    enabled: isEdit,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['departments-public'],
    queryFn: () => getPublicDepartments(),
  })

  const { data: contacts = [], refetch: refetchContacts } = useQuery({
    queryKey: ['admin-contacts', id],
    queryFn: () => getLecturerContacts(id!),
    enabled: isEdit,
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<LecturerFormData>({
    resolver: zodResolver(lecturerSchema),
    defaultValues: {
      publication_status: 'draft',
      verification_status: 'unverified',
    },
  })

  // Populate form when existing data loads
  React.useEffect(() => {
    if (existing) {
      setValue('first_name', existing.first_name)
      setValue('last_name', existing.last_name)
      setValue('middle_name', existing.middle_name ?? '')
      setValue('display_name', existing.display_name)
      setValue('title', existing.title ?? undefined)
      setValue('department_id', existing.department_id ?? undefined)
      setValue('institution_id', existing.institution_id)
      setValue('office_location', existing.office_location ?? '')
      setValue('office_hours', existing.office_hours ?? '')
      setValue('biography', existing.biography ?? '')
      setValue('publication_status', existing.publication_status)
      setValue('verification_status', existing.verification_status)
    }
  }, [existing, setValue])

  // Auto-compute display name
  const firstName = watch('first_name')
  const middleName = watch('middle_name')
  const lastName = watch('last_name')
  const title = watch('title')
  React.useEffect(() => {
    if (firstName || lastName) {
      setValue(
        'display_name',
        computeDisplayName(title, firstName ?? '', middleName ?? '', lastName ?? '')
      )
    }
  }, [firstName, middleName, lastName, title, setValue])

  // Set institution_id when loaded
  React.useEffect(() => {
    if (institutionId) setValue('institution_id', institutionId)
  }, [institutionId, setValue])

  const saveMutation = useMutation({
    mutationFn: (data: LecturerFormData) =>
      isEdit ? updateLecturer(id!, data) : createLecturer(data).then(() => undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lecturers'] })
      navigate('/admin/lecturers')
    },
  })

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) => deleteContact(contactId),
    onSuccess: () => {
      refetchContacts()
      setDeleteContact_(null)
    },
  })

  return (
    <>
      <title>{isEdit ? 'Edit Lecturer' : 'Add Lecturer'} | UniConnect Admin</title>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/lecturers')} className="btn-ghost btn-sm p-1.5" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            {isEdit ? 'Edit Lecturer' : 'Add Lecturer'}
          </h1>
        </div>

        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6">
          {/* Basic info */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-text-primary">Basic Information</h2>
            <Select
              label="Academic title"
              options={ACADEMIC_TITLES.map((t: string) => ({ value: t, label: t }))}
              {...register('title')}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="First name" required error={errors.first_name?.message} {...register('first_name')} />
              <Input label="Last name" required error={errors.last_name?.message} {...register('last_name')} />
            </div>
            <Input label="Middle name" error={errors.middle_name?.message} {...register('middle_name')} />
            <Input label="Display name" required hint="Auto-computed but editable." error={errors.display_name?.message} {...register('display_name')} />
          </div>

          {/* Placement */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-text-primary">Placement</h2>
            <Select
              label="Department"
              options={departments.map(d => ({ value: d.id, label: d.name }))}
              {...register('department_id')}
              placeholder="No department"
            />
          </div>

          {/* Details */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-text-primary">Details</h2>
            <Input label="Office location" error={errors.office_location?.message} {...register('office_location')} />
            <Input label="Office hours" error={errors.office_hours?.message} {...register('office_hours')} />
            <Textarea label="Biography" rows={4} error={errors.biography?.message} {...register('biography')} />
          </div>

          {/* Status */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-text-primary">Status</h2>
            <Select
              label="Publication status"
              options={PUBLICATION_STATUSES.map((s: string) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
              error={errors.publication_status?.message}
              {...register('publication_status')}
            />
            <Select
              label="Verification status"
              options={VERIFICATION_STATUSES.map((s: string) => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) }))}
              error={errors.verification_status?.message}
              {...register('verification_status')}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" loading={saveMutation.isPending}>
              {isEdit ? 'Save Changes' : 'Create Lecturer'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/lecturers')}>
              Cancel
            </Button>
          </div>
        </form>

        {/* Contacts (only when editing) */}
        {isEdit && (
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">Contact Information</h2>
              <Button size="sm" variant="secondary" leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setShowContactForm(true)}>
                Add Contact
              </Button>
            </div>

            {showContactForm && (
              <ContactForm
                lecturerId={id!}
                onSuccess={() => { setShowContactForm(false); refetchContacts() }}
                onCancel={() => setShowContactForm(false)}
              />
            )}

            {contacts.length === 0 ? (
              <p className="text-sm text-text-muted">No contacts added yet.</p>
            ) : (
              <ul className="space-y-2">
                {contacts.map((c) => (
                  <li key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-muted/40">
                    <div>
                      <span className="text-xs text-text-muted">{formatContactType(c.contact_type)}: </span>
                      <span className="font-mono text-sm">{c.contact_value}</span>
                      <div className="flex gap-1 mt-1">
                        <Badge variant={c.verification_status === 'verified' ? 'green' : 'gray'} className="text-[10px]">
                          {c.verification_status}
                        </Badge>
                        {c.is_public && <Badge variant="blue" className="text-[10px]">Public</Badge>}
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteContact_({ id: c.id, value: c.contact_value })}
                      className="btn-ghost btn-sm p-1.5 text-danger hover:text-danger"
                      aria-label="Delete contact"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {deleteContact_ && (
        <ConfirmDialog
          open={!!deleteContact_}
          onOpenChange={(o) => !o && setDeleteContact_(null)}
          title="Delete Contact"
          description={`Are you sure you want to delete "${deleteContact_.value}"? This cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          loading={deleteContactMutation.isPending}
          onConfirm={() => deleteContactMutation.mutate(deleteContact_.id)}
        />
      )}
    </>
  )
}
