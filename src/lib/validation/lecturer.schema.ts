import { z } from 'zod'

export const academicTitles = [
  'Prof.',
  'Assoc. Prof.',
  'Dr.',
  'Mr.',
  'Mrs.',
  'Ms.',
  'Eng.',
  'Rev.',
  'Other',
] as const

export const publicationStatuses = [
  'draft',
  'published',
  'unpublished',
  'archived',
] as const

export const verificationStatuses = [
  'unverified',
  'pending_review',
  'verified',
  'outdated',
  'rejected',
] as const

export const lecturerSchema = z.object({
  title: z
    .enum(academicTitles)
    .optional()
    .nullable()
    .or(z.literal('')),
  first_name: z
    .string()
    .trim()
    .min(1, 'First name is required'),
  middle_name: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  last_name: z
    .string()
    .trim()
    .min(1, 'Last name is required'),
  display_name: z
    .string()
    .trim()
    .min(1, 'Display name is required'),
  institution_id: z
    .string()
    .uuid('Please select a valid institution'),
  department_id: z
    .string()
    .uuid('Invalid department selection')
    .optional()
    .nullable()
    .or(z.literal('')),
  office_location: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  office_hours: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  biography: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  publication_status: z
    .enum(publicationStatuses)
    .default('draft'),
  verification_status: z
    .enum(verificationStatuses)
    .default('unverified'),
})

export type LecturerFormData = z.infer<typeof lecturerSchema>

// Uppercase aliases for backwards compatibility
export const ACADEMIC_TITLES = academicTitles
export const PUBLICATION_STATUSES = publicationStatuses
export const VERIFICATION_STATUSES = verificationStatuses

/** Auto-compute display name from title and the lecturer's name parts. */
export function computeDisplayName(
  title: string | null | undefined,
  firstName: string,
  middleName: string,
  lastName: string
): string {
  const parts = [title, firstName, middleName, lastName].filter(Boolean)
  return parts.join(' ').trim()
}
