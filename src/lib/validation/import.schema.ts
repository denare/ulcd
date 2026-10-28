import { z } from 'zod'

export const importRowSchema = z
  .object({
    title: z.string().trim().optional().nullable().or(z.literal('')),
    first_name: z.string().trim().min(1, 'First name is required'),
    middle_name: z.string().trim().optional().nullable().or(z.literal('')),
    last_name: z.string().trim().min(1, 'Last name is required'),
    display_name: z.string().trim().optional().nullable().or(z.literal('')),
    department_slug: z.string().trim().optional().nullable().or(z.literal('')),
    mobile_phone: z.string().trim().optional().nullable().or(z.literal('')),
    office_phone: z.string().trim().optional().nullable().or(z.literal('')),
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .optional()
      .nullable()
      .or(z.literal('')),
  })
  .transform((data) => {
    const titlePart = data.title ? `${data.title} ` : ''
    const computedDisplayName =
      data.display_name && data.display_name.trim().length > 0
        ? data.display_name.trim()
        : `${titlePart}${[data.first_name, data.middle_name, data.last_name]
            .filter(Boolean)
            .join(' ')}`

    return {
      ...data,
      display_name: computedDisplayName,
    }
  })

export type ImportRowData = z.infer<typeof importRowSchema>

/**
 * Validates a CSV row record against the importRowSchema.
 * Automatically handles key trimming and whitespace.
 */
export function validateImportRow(
  row: Record<string, string>
): { data?: ImportRowData; errors?: string[] } {
  // Normalize row keys to handle common variations (e.g. 'First Name' -> 'first_name')
  const normalized: Record<string, string> = {}
  for (const [key, val] of Object.entries(row)) {
    const normKey = key.trim().toLowerCase().replace(/[\s-]+/g, '_')
    normalized[normKey] = val !== undefined && val !== null ? String(val).trim() : ''
  }

  const result = importRowSchema.safeParse(normalized)
  if (!result.success) {
    return {
      errors: result.error.errors.map(
        (e) => `${e.path.join('.') || 'row'}: ${e.message}`
      ),
    }
  }

  return { data: result.data }
}

// CSV template helpers
export const CSV_TEMPLATE_HEADER =
  'title,first_name,middle_name,last_name,display_name,department_slug,mobile_phone,office_phone,email'
