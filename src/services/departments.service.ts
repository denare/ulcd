import supabase from '@/lib/supabase'
import type { Database, Department, SearchLecturerRow } from '@/types/database'
import { searchLecturers } from './lecturers.service'

export interface DepartmentWithSchool {
  id: string
  name: string
  slug: string
  description: string | null
  school_id: string | null
  school_name: string | null
  institution_id: string
  is_active: boolean
}

export interface DepartmentCreateInput {
  name: string
  slug: string
  institution_id: string
  school_id?: string | null
  description?: string | null
  is_active?: boolean
}

export interface DepartmentUpdateInput {
  name?: string
  slug?: string
  school_id?: string | null
  description?: string | null
  is_active?: boolean
}

interface RawDepartmentWithSchoolRow extends Department {
  schools?: {
    name: string
  } | null
}

/**
 * Retrieves all active departments for public view, including associated school name.
 */
export async function getPublicDepartments(
  institutionId?: string
): Promise<DepartmentWithSchool[]> {
  let query = supabase
    .from('departments')
    .select(`
      *,
      schools (
        name
      )
    `)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (institutionId) {
    query = query.eq('institution_id', institutionId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch public departments: ${error.message}`)
  }

  const rows = (data as RawDepartmentWithSchoolRow[] | null) ?? []

  return rows.map((dept) => ({
    id: dept.id,
    name: dept.name,
    slug: dept.slug,
    school_id: dept.school_id,
    description: dept.description ?? null,
    school_name: dept.schools?.name ?? null,
    institution_id: dept.institution_id,
    is_active: dept.is_active,
  }))
}

/**
 * Retrieves all departments for admin view (without is_active filter), including school name.
 */
export async function getAdminDepartments(
  institutionId?: string
): Promise<DepartmentWithSchool[]> {
  let query = supabase
    .from('departments')
    .select(`
      *,
      schools (
        name
      )
    `)
    .order('name', { ascending: true })

  if (institutionId) {
    query = query.eq('institution_id', institutionId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch admin departments: ${error.message}`)
  }

  const rows = (data as RawDepartmentWithSchoolRow[] | null) ?? []

  return rows.map((dept) => ({
    id: dept.id,
    name: dept.name,
    slug: dept.slug,
    school_id: dept.school_id,
    description: dept.description ?? null,
    school_name: dept.schools?.name ?? null,
    institution_id: dept.institution_id,
    is_active: dept.is_active,
  }))
}

/**
 * Retrieves a single department by its ID.
 */
export async function getDepartment(id: string): Promise<Department | null> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch department: ${error.message}`)
  }

  return data as Department
}

/**
 * Creates a new department record.
 */
export async function createDepartment(
  data: DepartmentCreateInput
): Promise<{ id: string }> {
  const { data: created, error } = await supabase
    .from('departments')
    .insert({
      institution_id: data.institution_id,
      school_id: data.school_id || null,
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      description: data.description?.trim() || null,
      is_active: data.is_active ?? true,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create department: ${error.message}`)
  }

  return { id: created.id }
}

/**
 * Updates an existing department record.
 */
export async function updateDepartment(
  id: string,
  data: DepartmentUpdateInput
): Promise<void> {
  const payload: Database['public']['Tables']['departments']['Update'] = {}

  if (data.school_id !== undefined) payload.school_id = data.school_id || null
  if (data.name !== undefined) payload.name = data.name.trim()
  if (data.slug !== undefined) payload.slug = data.slug.trim().toLowerCase()
  if (data.description !== undefined) payload.description = data.description?.trim() || null
  if (data.is_active !== undefined) payload.is_active = data.is_active

  const { error } = await supabase
    .from('departments')
    .update(payload)
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update department: ${error.message}`)
  }
}

/**
 * Deactivates a department (soft delete).
 */
export async function deactivateDepartment(id: string): Promise<void> {
  const { error } = await supabase
    .from('departments')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to deactivate department: ${error.message}`)
  }
}

/**
 * Retrieves published lecturers belonging to this department.
 */
export async function getDepartmentLecturers(id: string): Promise<SearchLecturerRow[]> {
  return searchLecturers({ deptId: id, pageSize: 100 })
}
