import supabase from '@/lib/supabase'
import type {
  AdminStats,
  AdminProfile,
  AuditLog,
  AcademicTitle,
  Database,
} from '@/types/database'
import type { ImportRowData } from '@/lib/validation/import.schema'

export interface AuditLogParams {
  entityType?: string
  entityId?: string
  limit?: number
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

/**
 * Retrieves aggregate system dashboard statistics for admins via RPC.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('get_admin_stats')

  if (error) {
    throw new Error(`Failed to fetch admin stats: ${error.message}`)
  }

  return data as unknown as AdminStats
}

/**
 * Retrieves the admin profile for the currently authenticated user.
 */
export async function getAdminProfile(): Promise<AdminProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch admin profile: ${error.message}`)
  }

  return data as AdminProfile
}

/**
 * Imports a batch of lecturer rows with associated contacts from parsed CSV data.
 * Matches department by slug, creates unverified and unpublished draft records.
 */
export async function importLecturers(
  institutionId: string,
  rows: ImportRowData[]
): Promise<ImportResult> {
  if (!institutionId) {
    throw new Error('Institution ID is required for import')
  }

  // Pre-load departments to map slugs quickly
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('id, slug')
    .eq('institution_id', institutionId)

  if (deptError) {
    throw new Error(`Failed to fetch departments for import: ${deptError.message}`)
  }

  const deptMap = new Map<string, string>()
  if (departments) {
    for (const d of departments as Array<{ id: string; slug: string }>) {
      deptMap.set(d.slug.toLowerCase(), d.id)
    }
  }

  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    const rowNum = index + 1
    const rowLabel = row.display_name || `${row.first_name} ${row.last_name}` || `Row #${rowNum}`

    try {
      const deptId = row.department_slug
        ? deptMap.get(row.department_slug.toLowerCase()) || null
        : null

      const { data: lecturer, error: lectError } = await supabase
        .from('lecturers')
        .insert({
          institution_id: institutionId,
          department_id: deptId,
          title: (row.title as AcademicTitle) || null,
          first_name: row.first_name.trim(),
          middle_name: row.middle_name?.trim() || null,
          last_name: row.last_name.trim(),
          display_name: row.display_name.trim(),
          publication_status: 'draft',
          verification_status: 'unverified',
        })
        .select('id')
        .single()

      if (lectError || !lecturer) {
        throw new Error(lectError?.message ?? 'Failed to insert lecturer record')
      }

      const contactsToInsert: Database['public']['Tables']['lecturer_contacts']['Insert'][] = []

      if (row.mobile_phone && row.mobile_phone.trim()) {
        contactsToInsert.push({
          lecturer_id: lecturer.id,
          contact_type: 'mobile_phone',
          contact_value: row.mobile_phone.trim(),
          source_type: 'imported_csv',
          verification_status: 'unverified',
          consent_status: 'unknown',
          is_public: false,
        })
      }

      if (row.office_phone && row.office_phone.trim()) {
        contactsToInsert.push({
          lecturer_id: lecturer.id,
          contact_type: 'office_phone',
          contact_value: row.office_phone.trim(),
          source_type: 'imported_csv',
          verification_status: 'unverified',
          consent_status: 'unknown',
          is_public: false,
        })
      }

      if (row.email && row.email.trim()) {
        contactsToInsert.push({
          lecturer_id: lecturer.id,
          contact_type: 'email',
          contact_value: row.email.trim(),
          source_type: 'imported_csv',
          verification_status: 'unverified',
          consent_status: 'unknown',
          is_public: false,
        })
      }

      if (contactsToInsert.length > 0) {
        const { error: contactError } = await supabase
          .from('lecturer_contacts')
          .insert(contactsToInsert)

        if (contactError) {
          throw new Error(`Lecturer created but contact insert failed: ${contactError.message}`)
        }
      }

      imported++
    } catch (err) {
      skipped++
      const message = err instanceof Error ? err.message : 'Unknown error'
      errors.push(`${rowLabel}: ${message}`)
    }
  }

  return {
    imported,
    skipped,
    errors,
  }
}

/**
 * Retrieves the system audit log for platform and institution actions.
 */
export async function getAuditLog(params: AuditLogParams = {}): Promise<AuditLog[]> {
  let query = supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params.limit ?? 50)

  if (params.entityType) {
    query = query.eq('entity_type', params.entityType)
  }

  if (params.entityId) {
    query = query.eq('entity_id', params.entityId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch audit log: ${error.message}`)
  }

  return (data as AuditLog[]) ?? []
}
