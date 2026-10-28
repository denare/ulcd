import { describe, expect, it } from 'vitest'
import { CSV_TEMPLATE_HEADER, validateImportRow } from '@/lib/validation/import.schema'

describe('validateImportRow', () => {
  it('accepts a complete row and builds a display name from its name parts', () => {
    const result = validateImportRow({
      title: 'Dr.',
      first_name: 'Ada',
      middle_name: 'Lovelace',
      last_name: 'Byron',
      department_slug: 'cs-se',
    })

    expect(result.errors).toBeUndefined()
    expect(result.data).toMatchObject({
      display_name: 'Dr. Ada Lovelace Byron',
      middle_name: 'Lovelace',
      department_slug: 'cs-se',
    })
  })

  it('keeps an explicitly provided display name', () => {
    const result = validateImportRow({
      first_name: 'Ada',
      last_name: 'Byron',
      display_name: 'Professor Ada Byron',
    })

    expect(result.data?.display_name).toBe('Professor Ada Byron')
  })

  it('reports missing names and malformed email addresses', () => {
    const result = validateImportRow({
      first_name: '',
      last_name: 'Byron',
      email: 'not-an-email',
    })

    expect(result.errors).toContain('first_name: First name is required')
    expect(result.errors).toContain('email: Invalid email address')
  })

  it('provides a header-only template without fabricated contact data', () => {
    expect(CSV_TEMPLATE_HEADER).toBe(
      'title,first_name,middle_name,last_name,display_name,department_slug,mobile_phone,office_phone,email'
    )
  })
})
