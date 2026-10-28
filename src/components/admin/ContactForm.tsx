import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import {
  contactSchema,
  CONTACT_TYPES, CONSENT_STATUSES, SOURCE_TYPES, VERIFICATION_STATUSES,
  type ContactFormData,
} from '@/lib/validation/contact.schema'
import { createContact, updateContact } from '@/services/contacts.service'
import { formatContactType } from '@/utils/formatting'
import type { Database } from '@/types/database'

type LecturerContact = Database['public']['Tables']['lecturer_contacts']['Row']

interface ContactFormProps {
  lecturerId: string
  contact?: LecturerContact
  onSuccess: () => void
  onCancel: () => void
}

export function ContactForm({ lecturerId, contact, onSuccess, onCancel }: ContactFormProps) {
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const isEdit = !!contact

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact
      ? {
          contact_type: contact.contact_type,
          contact_value: contact.contact_value,
          display_value: contact.display_value ?? '',
          is_public: contact.is_public,
          verification_status: contact.verification_status,
          consent_status: contact.consent_status,
          source_type: contact.source_type ?? undefined,
          notes: contact.notes ?? '',
        }
      : {
          contact_type: 'mobile_phone',
          contact_value: '',
          is_public: false,
          verification_status: 'unverified',
          consent_status: 'unknown',
        },
  })

  const watchedStatus = watch('verification_status')
  const watchedPublic = watch('is_public')

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null)
    try {
      if (isEdit) {
        await updateContact(contact.id, data)
      } else {
        await createContact({ ...data, lecturer_id: lecturerId })
      }
      onSuccess()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save contact')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border border-brand-200 rounded-lg p-4 bg-brand-50/30 space-y-4">
      <h3 className="font-semibold text-text-primary text-sm">{isEdit ? 'Edit Contact' : 'Add Contact'}</h3>

      <Select
        label="Contact type"
        required
        options={CONTACT_TYPES.map(t => ({ value: t, label: formatContactType(t) }))}
        error={errors.contact_type?.message}
        {...register('contact_type')}
      />

      <Input
        label="Contact value"
        required
        hint="Phone: include country code e.g. +255712345678. Email: full address."
        error={errors.contact_value?.message}
        {...register('contact_value')}
      />

      <Input
        label="Display value (optional)"
        hint="Overrides how the value is shown to students e.g. to mask part of a number."
        error={errors.display_value?.message}
        {...register('display_value')}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Select
          label="Verification status"
          options={VERIFICATION_STATUSES.map(s => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }))}
          error={errors.verification_status?.message}
          {...register('verification_status')}
        />
        <Select
          label="Source"
          options={SOURCE_TYPES.map(s => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }))}
          error={errors.source_type?.message}
          {...register('source_type')}
        />
      </div>

      <Select
        label="Consent status"
        options={CONSENT_STATUSES.map(s => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }))}
        error={errors.consent_status?.message}
        {...register('consent_status')}
      />

      <div className="flex items-start gap-3">
        <input
          id="is_public"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
          {...register('is_public')}
        />
        <label htmlFor="is_public" className="text-sm text-text-secondary leading-snug">
          Make this contact publicly visible
          <span className="block text-xs text-text-muted mt-0.5">
            Contact must be set to <strong>Verified</strong> before it can be published.
          </span>
        </label>
      </div>

      {watchedPublic && watchedStatus !== 'verified' && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-warning-light text-warning text-xs">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          This contact cannot be published until verification status is set to Verified.
        </div>
      )}

      <Textarea
        label="Admin notes (optional)"
        rows={2}
        hint="Internal notes — not visible to students."
        error={errors.notes?.message}
        {...register('notes')}
      />

      {submitError && (
        <p className="text-sm text-danger flex items-center gap-1">
          <AlertCircle className="h-4 w-4" aria-hidden="true" /> {submitError}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" loading={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Add Contact'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
