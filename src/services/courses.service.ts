import supabase from '@/lib/supabase'
import type {
  Course,
  Assignment,
  AssignmentType,
  Database,
  Department,
  SearchLecturerRow,
} from '@/types/database'

export interface GetCoursesParams {
  query?: string
  deptId?: string
  instId?: string
}

export interface CourseCreateInput {
  institution_id: string
  department_id?: string | null
  course_code: string
  course_name: string
  description?: string | null
  academic_year?: string | null
  semester?: number | null
}

export interface CourseUpdateInput {
  department_id?: string | null
  course_code?: string
  course_name?: string
  description?: string | null
  academic_year?: string | null
  semester?: number | null
  is_active?: boolean
}

export interface AssignmentCreateInput {
  lecturer_id: string
  course_id: string
  academic_year?: string | null
  semester?: number | null
  assignment_type?: AssignmentType
}

export type AssignmentWithCourse = Assignment & {
  courses?: Course | null
}

export type CourseWithDepartment = Course & {
  departments: Pick<Department, 'name'> | null
  department_name: string | null
}

interface RawLecturerWithRelations {
  id: string
  display_name: string
  title: string | null
  department_id: string | null
  institution_id: string
  verification_status: SearchLecturerRow['verification_status']
  last_verified_at: string | null
  departments: {
    id: string
    name: string
    school_id: string | null
    schools: {
      id: string
      name: string
    } | null
  } | null
  institutions: {
    id: string
    name: string
  } | null
  lecturer_contacts: Array<{
    contact_type: string
    is_public: boolean
    verification_status: string
  }> | null
  lecturer_course_assignments: Array<{
    is_active: boolean
    courses: {
      course_code: string
    } | null
  }> | null
}

/**
 * Retrieves courses filtered by optional search query, department, or institution.
 */
export async function getCourses(params: GetCoursesParams = {}): Promise<CourseWithDepartment[]> {
  let query = supabase
    .from('courses')
    .select('*, departments(name)')
    .eq('is_active', true)

  if (params.instId) {
    query = query.eq('institution_id', params.instId)
  }

  if (params.deptId) {
    query = query.eq('department_id', params.deptId)
  }

  if (params.query && params.query.trim()) {
    const q = params.query.trim()
    query = query.or(`course_code.ilike.%${q}%,course_name.ilike.%${q}%`)
  }

  query = query.order('course_code', { ascending: true })

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`)
  }

  return (data ?? []).map((course) => ({
    ...course,
    department_name: course.departments?.name ?? null,
  }))
}

export async function getAdminCourses(
  params: GetCoursesParams = {}
): Promise<CourseWithDepartment[]> {
  let query = supabase
    .from('courses')
    .select('*, departments(name)')

  if (params.instId) {
    query = query.eq('institution_id', params.instId)
  }

  if (params.deptId) {
    query = query.eq('department_id', params.deptId)
  }

  if (params.query?.trim()) {
    const term = params.query.trim()
    query = query.or(`course_code.ilike.%${term}%,course_name.ilike.%${term}%`)
  }

  const { data, error } = await query.order('course_code', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch admin courses: ${error.message}`)
  }

  return (data ?? []).map((course) => ({
    ...course,
    department_name: course.departments?.name ?? null,
  }))
}

/**
 * Retrieves a single course by its ID.
 */
export async function getCourse(id: string): Promise<CourseWithDepartment | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*, departments(name)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch course: ${error.message}`)
  }

  return {
    ...data,
    department_name: data.departments?.name ?? null,
  }
}

/**
 * Retrieves published lecturers assigned to a specific course.
 */
export async function getCourseLecturers(courseId: string): Promise<SearchLecturerRow[]> {
  const { data: assignments, error: assignError } = await supabase
    .from('lecturer_course_assignments')
    .select('lecturer_id')
    .eq('course_id', courseId)
    .eq('is_active', true)

  if (assignError) {
    throw new Error(`Failed to fetch course assignments: ${assignError.message}`)
  }

  if (!assignments || assignments.length === 0) {
    return []
  }

  const lecturerIds = Array.from(new Set(assignments.map((a) => a.lecturer_id)))

  const { data: lecturers, error: lectError } = await supabase
    .from('lecturers')
    .select(`
      id,
      display_name,
      title,
      department_id,
      institution_id,
      verification_status,
      last_verified_at,
      departments (
        id,
        name,
        school_id,
        schools (
          id,
          name
        )
      ),
      institutions (
        id,
        name
      ),
      lecturer_contacts (
        contact_type,
        is_public,
        verification_status
      ),
      lecturer_course_assignments (
        is_active,
        courses (
          course_code
        )
      )
    `)
    .in('id', lecturerIds)
    .eq('publication_status', 'published')

  if (lectError) {
    throw new Error(`Failed to fetch course lecturers: ${lectError.message}`)
  }

  const rows = (lecturers as unknown as RawLecturerWithRelations[] | null) ?? []

  return rows.map((l) => {
    const contacts = l.lecturer_contacts || []
    const hasPhone = contacts.some(
      (c) =>
        c.contact_type === 'mobile_phone' &&
        c.is_public &&
        c.verification_status === 'verified'
    )
    const hasEmail = contacts.some(
      (c) =>
        c.contact_type === 'email' &&
        c.is_public &&
        c.verification_status === 'verified'
    )
    const hasOfficePhone = contacts.some(
      (c) =>
        c.contact_type === 'office_phone' &&
        c.is_public &&
        c.verification_status === 'verified'
    )
    const activeAssignments = l.lecturer_course_assignments || []
    const courseCodes = activeAssignments
      .filter((a) => a.is_active && a.courses?.course_code)
      .map((a) => a.courses!.course_code)

    return {
      id: l.id,
      display_name: l.display_name,
      title: l.title,
      department_id: l.department_id,
      department_name: l.departments?.name ?? null,
      school_id: l.departments?.schools?.id ?? null,
      school_name: l.departments?.schools?.name ?? null,
      institution_id: l.institution_id,
      institution_name: l.institutions?.name ?? '',
      verification_status: l.verification_status,
      last_verified_at: l.last_verified_at,
      has_phone: hasPhone,
      has_email: hasEmail,
      has_office_phone: hasOfficePhone,
      course_codes: courseCodes,
    }
  })
}

/**
 * Creates a new course record.
 */
export async function createCourse(data: CourseCreateInput): Promise<{ id: string }> {
  const { data: created, error } = await supabase
    .from('courses')
    .insert({
      institution_id: data.institution_id,
      department_id: data.department_id || null,
      course_code: data.course_code.trim().toUpperCase(),
      course_name: data.course_name.trim(),
      description: data.description?.trim() || null,
      academic_year: data.academic_year?.trim() || null,
      semester: data.semester ?? null,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create course: ${error.message}`)
  }

  return { id: created.id }
}

/**
 * Updates an existing course record.
 */
export async function updateCourse(id: string, data: CourseUpdateInput): Promise<void> {
  const payload: Database['public']['Tables']['courses']['Update'] = {}

  if (data.department_id !== undefined) payload.department_id = data.department_id || null
  if (data.course_code !== undefined) payload.course_code = data.course_code.trim().toUpperCase()
  if (data.course_name !== undefined) payload.course_name = data.course_name.trim()
  if (data.description !== undefined) payload.description = data.description?.trim() || null
  if (data.academic_year !== undefined) payload.academic_year = data.academic_year?.trim() || null
  if (data.semester !== undefined) payload.semester = data.semester ?? null
  if (data.is_active !== undefined) payload.is_active = data.is_active

  const { error } = await supabase
    .from('courses')
    .update(payload)
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update course: ${error.message}`)
  }
}

/**
 * Retrieves course assignments for a lecturer.
 */
export async function getAssignments(lecturerId: string): Promise<AssignmentWithCourse[]> {
  const { data, error } = await supabase
    .from('lecturer_course_assignments')
    .select(`
      *,
      courses (*)
    `)
    .eq('lecturer_id', lecturerId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch lecturer assignments: ${error.message}`)
  }

  return data ?? []
}

/**
 * Creates a course-lecturer assignment.
 */
export async function createAssignment(
  data: AssignmentCreateInput
): Promise<{ id: string }> {
  const { data: created, error } = await supabase
    .from('lecturer_course_assignments')
    .insert({
      lecturer_id: data.lecturer_id,
      course_id: data.course_id,
      academic_year: data.academic_year?.trim() || null,
      semester: data.semester ?? null,
      assignment_type: data.assignment_type ?? 'lecturer',
      is_active: true,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create assignment: ${error.message}`)
  }

  return { id: created.id }
}

/**
 * Deactivates an assignment record by setting is_active=false.
 */
export async function removeAssignment(id: string): Promise<void> {
  const { error } = await supabase
    .from('lecturer_course_assignments')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to remove assignment: ${error.message}`)
  }
}
