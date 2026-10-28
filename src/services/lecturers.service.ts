import supabase from '@/lib/supabase'
import type {
  Lecturer,
  SearchLecturerRow,
  PublicLecturerRow,
  PublicationStatus,
  AcademicTitle,
  Database,
} from '@/types/database'
import type { LecturerFormData } from '@/lib/validation/lecturer.schema'

export interface SearchLecturersParams {
  query?: string
  deptId?: string
  schoolId?: string
  instId?: string
  pageSize?: number
  offset?: number
}

export interface LecturerCountParams {
  query?: string
  deptId?: string
  schoolId?: string
  instId?: string
}

export interface AdminLecturersParams {
  query?: string
  deptId?: string
  status?: string
  page?: number
  pageSize?: number
}

export type AdminLecturer = Lecturer & {
  departments?: {
    name: string
    schools?: {
      name: string
    } | null
  } | null
}

/**
 * Searches published lecturers via database RPC.
 */
export async function searchLecturers(
  params: SearchLecturersParams = {}
): Promise<SearchLecturerRow[]> {
  const { data, error } = await supabase.rpc('search_lecturers', {
    search_query: params.query?.trim() || undefined,
    dept_filter: params.deptId || undefined,
    school_filter: params.schoolId || undefined,
    inst_filter: params.instId || undefined,
    page_size: params.pageSize ?? 20,
    page_offset: params.offset ?? 0,
  })

  if (error) {
    throw new Error(`Failed to search lecturers: ${error.message}`)
  }

  return (data as SearchLecturerRow[]) ?? []
}

/**
 * Gets total count of published lecturers matching the given filter criteria.
 */
export async function getLecturerCount(
  params: LecturerCountParams = {}
): Promise<number> {
  let query = supabase
    .from('lecturers')
    .select('id', { count: 'exact', head: true })
    .eq('publication_status', 'published')

  if (params.instId) {
    query = query.eq('institution_id', params.instId)
  }

  if (params.deptId) {
    query = query.eq('department_id', params.deptId)
  }

  if (params.schoolId) {
    const { data: depts, error: deptError } = await supabase
      .from('departments')
      .select('id')
      .eq('school_id', params.schoolId)

    if (deptError) {
      throw new Error(`Failed to load school departments for lecturer count: ${deptError.message}`)
    }

    if (!depts || depts.length === 0) {
      return 0
    }

    const deptIds = depts.map((d) => d.id)
    query = query.in('department_id', deptIds)
  }

  if (params.query && params.query.trim()) {
    const q = params.query.trim()
    query = query.or(`display_name.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
  }

  const { count, error } = await query

  if (error) {
    throw new Error(`Failed to get lecturer count: ${error.message}`)
  }

  return count ?? 0
}

/**
 * Retrieves public lecturer profile with verified contacts and active courses.
 */
export async function getPublicLecturer(id: string): Promise<PublicLecturerRow | null> {
  const { data, error } = await supabase.rpc('get_public_lecturer', {
    lecturer_uuid: id,
  })

  if (error) {
    throw new Error(`Failed to fetch public lecturer: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return null
  }

  return data[0] as PublicLecturerRow
}

/**
 * Retrieves all lecturers for administrative management with department and school details.
 */
export async function getAdminLecturers(
  params: AdminLecturersParams = {}
): Promise<{ data: AdminLecturer[]; count: number }> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('lecturers')
    .select('*, departments(name, schools(name))', { count: 'exact' })

  if (params.deptId) {
    query = query.eq('department_id', params.deptId)
  }

  if (params.status) {
    query = query.eq('publication_status', params.status as PublicationStatus)
  }

  if (params.query && params.query.trim()) {
    const q = params.query.trim()
    query = query.or(`display_name.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
  }

  query = query.order('display_name', { ascending: true }).range(from, to)

  const { data, count, error } = await query

  if (error) {
    throw new Error(`Failed to fetch admin lecturers: ${error.message}`)
  }

  return {
    data: (data as AdminLecturer[]) ?? [],
    count: count ?? 0,
  }
}

export async function getAdminLecturer(id: string): Promise<AdminLecturer | null> {
  const { data, error } = await supabase
    .from('lecturers')
    .select('*, departments(name, schools(name))')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch lecturer: ${error.message}`)
  }

  return data
}

/**
 * Creates a new lecturer profile in the directory.
 */
export async function createLecturer(data: LecturerFormData): Promise<{ id: string }> {
  const insertPayload = {
    institution_id: data.institution_id,
    department_id: data.department_id || null,
    title: (data.title as AcademicTitle) || null,
    first_name: data.first_name.trim(),
    middle_name: data.middle_name?.trim() || null,
    last_name: data.last_name.trim(),
    display_name: data.display_name.trim(),
    office_location: data.office_location?.trim() || null,
    office_hours: data.office_hours?.trim() || null,
    biography: data.biography?.trim() || null,
    publication_status: data.publication_status,
    verification_status: data.verification_status,
  }

  const { data: created, error } = await supabase
    .from('lecturers')
    .insert(insertPayload)
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create lecturer: ${error.message}`)
  }

  return { id: created.id }
}

/**
 * Updates an existing lecturer profile.
 */
export async function updateLecturer(
  id: string,
  data: Partial<LecturerFormData>
): Promise<void> {
  const updatePayload: Database['public']['Tables']['lecturers']['Update'] = {}

  if (data.first_name !== undefined) updatePayload.first_name = data.first_name.trim()
  if (data.middle_name !== undefined) updatePayload.middle_name = data.middle_name?.trim() || null
  if (data.last_name !== undefined) updatePayload.last_name = data.last_name.trim()
  if (data.display_name !== undefined) updatePayload.display_name = data.display_name.trim()
  if (data.title !== undefined) updatePayload.title = data.title || null
  if (data.department_id !== undefined) updatePayload.department_id = data.department_id || null
  if (data.institution_id !== undefined) updatePayload.institution_id = data.institution_id
  if (data.office_location !== undefined) updatePayload.office_location = data.office_location?.trim() || null
  if (data.office_hours !== undefined) updatePayload.office_hours = data.office_hours?.trim() || null
  if (data.biography !== undefined) updatePayload.biography = data.biography?.trim() || null
  if (data.publication_status !== undefined) updatePayload.publication_status = data.publication_status
  if (data.verification_status !== undefined) updatePayload.verification_status = data.verification_status

  const { error } = await supabase
    .from('lecturers')
    .update(updatePayload)
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update lecturer: ${error.message}`)
  }
}

/**
 * Publishes a lecturer so they appear in public search and profiles.
 */
export async function publishLecturer(id: string): Promise<void> {
  const { error } = await supabase
    .from('lecturers')
    .update({ publication_status: 'published' })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to publish lecturer: ${error.message}`)
  }
}

/**
 * Unpublishes a lecturer, hiding them from the public directory.
 */
export async function unpublishLecturer(id: string): Promise<void> {
  const { error } = await supabase
    .from('lecturers')
    .update({ publication_status: 'unpublished' })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to unpublish lecturer: ${error.message}`)
  }
}

/**
 * Deletes a lecturer by soft-deleting / archiving their profile.
 */
export async function deleteLecturer(id: string): Promise<void> {
  const { error } = await supabase
    .from('lecturers')
    .update({ publication_status: 'archived' })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete lecturer: ${error.message}`)
  }
}
