import { z } from 'zod'

export const reportTypeEnum = z.enum([
  'incorrect_phone',
  'incorrect_email',
  'incorrect_office_phone',
  'outdated_information',
  'missing_lecturer',
  'duplicate_profile',
  'privacy_concern',
  'other',
])

export const reportSchema = z.object({
  lecturer_id: z.string().uuid('Please select a valid lecturer'),
  contact_id: z.string().uuid('Invalid contact reference').optional().or(z.literal('')),
  report_type: reportTypeEnum,
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  reporter_email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
})

export type ReportFormData = z.infer<typeof reportSchema>

// Array alias for use in select options
export const REPORT_TYPES = reportTypeEnum.options
