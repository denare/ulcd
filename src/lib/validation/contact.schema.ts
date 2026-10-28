import { z } from 'zod'

export const contactTypes = [
  'mobile_phone',
  'office_phone',
  'email',
  'other',
] as const

export const verificationStatuses = [
  'unverified',
  'pending_review',
  'verified',
  'outdated',
  'rejected',
] as const

export const consentStatuses = [
  'unknown',
  'consented',
  'not_consented',
  'withdrawn',
] as const

export const sourceTypes = [
  'self_submitted',
  'admin_added',
  'official_directory',
  'imported_csv',
  'other',
] as const

export const CONTACT_TYPES = contactTypes
export const VERIFICATION_STATUSES = verificationStatuses
export const CONSENT_STATUSES = consentStatuses
export const SOURCE_TYPES = sourceTypes

export const contactSchema = z.object({
  contact_type: z.enum(contactTypes, {
    required_error: 'Contact type is required',
  }),
  contact_value: z
    .string()
    .trim()
    .min(1, 'Contact value is required'),
  display_value: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  is_public: z.boolean().default(false),
  verification_status: z
    .enum(verificationStatuses)
    .default('unverified'),
  consent_status: z
    .enum(consentStatuses)
    .default('unknown'),
  source_type: z
    .enum(sourceTypes)
    .optional()
    .nullable()
    .or(z.literal('')),
  notes: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
})

export type ContactFormData = z.infer<typeof contactSchema>
