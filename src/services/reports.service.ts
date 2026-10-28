import supabase from '@/lib/supabase'
import type { CorrectionReport, Database, ReportStatus, ReportType } from '@/types/database'

export interface SubmitReportInput {
  lecturer_id: string
  contact_id?: string | null
  report_type: ReportType | string
  description: string
  reporter_email?: string | null
}

export interface GetAdminReportsParams {
  status?: string
  page?: number
  pageSize?: number
}

export type CorrectionReportWithLecturer = CorrectionReport & {
  lecturers?: {
    display_name: string
  } | null
}

/**
 * Submits a public correction report through the trusted rate-limited Edge Function.
 */
export async function submitReport(data: SubmitReportInput): Promise<{ id: string }> {
  const { data: result, error } = await supabase.functions.invoke<{ id: string }>(
    'submit-correction-report',
    {
      body: {
        lecturer_id: data.lecturer_id,
        contact_id: data.contact_id || null,
        report_type: data.report_type,
        description: data.description.trim(),
        reporter_email: data.reporter_email?.trim() || null,
      },
    }
  )

  if (error) {
    if (error.context instanceof Response) {
      const responseBody = await error.context.clone().json().catch(() => null) as { error?: unknown } | null
      if (typeof responseBody?.error === 'string') {
        throw new Error(responseBody.error)
      }
    }
    throw new Error(`Failed to submit report: ${error.message}`)
  }

  if (!result?.id) {
    throw new Error('Failed to submit report: invalid response from report service')
  }

  return { id: result.id }
}

/**
 * Retrieves correction reports for administrative review, joining lecturer display_name.
 */
export async function getAdminReports(
  params: GetAdminReportsParams = {}
): Promise<{ data: CorrectionReportWithLecturer[]; count: number }> {
  let query = supabase
    .from('correction_reports')
    .select('*, lecturers(display_name)', { count: 'exact' })

  if (params.status) {
    query = query.eq('status', params.status as ReportStatus)
  }

  query = query.order('created_at', { ascending: false })

  if (params.page !== undefined && params.pageSize !== undefined) {
    const from = (params.page - 1) * params.pageSize
    const to = from + params.pageSize - 1
    query = query.range(from, to)
  }

  const { data, count, error } = await query

  if (error) {
    throw new Error(`Failed to fetch admin reports: ${error.message}`)
  }

  return {
    data: (data as CorrectionReportWithLecturer[]) ?? [],
    count: count ?? 0,
  }
}

/**
 * Updates review status and administrative resolution notes for a report.
 */
export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  notes?: string
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const payload: Database['public']['Tables']['correction_reports']['Update'] = {
    status,
    reviewed_at: new Date().toISOString(),
    reviewed_by: user?.id || null,
  }

  if (notes !== undefined) {
    payload.admin_notes = notes.trim() || null
  }

  const { error } = await supabase
    .from('correction_reports')
    .update(payload)
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update report status: ${error.message}`)
  }
}
