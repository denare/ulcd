import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const reportTypes = new Set([
  'incorrect_phone',
  'incorrect_email',
  'incorrect_office_phone',
  'outdated_information',
  'missing_lecturer',
  'duplicate_profile',
  'privacy_concern',
  'other',
])

interface ReportPayload {
  lecturer_id: string
  contact_id: string | null
  report_type: string
  description: string
  reporter_email: string | null
}

function respond(status: number, payload: Record<string, string>) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders })
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function parsePayload(value: unknown): ReportPayload | null {
  if (!value || typeof value !== 'object') return null

  const body = value as Record<string, unknown>
  const contactId = body.contact_id === '' || body.contact_id == null ? null : body.contact_id
  const reporterEmail = body.reporter_email === '' || body.reporter_email == null
    ? null
    : body.reporter_email

  if (
    !isUuid(body.lecturer_id)
    || (contactId !== null && !isUuid(contactId))
    || typeof body.report_type !== 'string'
    || !reportTypes.has(body.report_type)
    || typeof body.description !== 'string'
    || body.description.trim().length < 10
    || body.description.trim().length > 2000
    || (reporterEmail !== null && (
      typeof reporterEmail !== 'string'
      || reporterEmail.length > 320
      || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(reporterEmail)
    ))
  ) {
    return null
  }

  return {
    lecturer_id: body.lecturer_id,
    contact_id: contactId,
    report_type: body.report_type,
    description: body.description.trim(),
    reporter_email: typeof reporterEmail === 'string' ? reporterEmail.trim() : null,
  }
}

async function createSubmissionFingerprint(request: Request, secret: string): Promise<string | null> {
  const forwardedIps = request.headers.get('x-forwarded-for')
    ?.split(',')
    .map((ip) => ip.trim())
    .filter(Boolean)
  const ip = request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-real-ip')
    ?? forwardedIps?.at(-1)

  if (!ip) return null

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${ip}\n${request.headers.get('user-agent') ?? ''}`)
  )
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return respond(405, { error: 'Method not allowed' })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const fingerprintSecret = Deno.env.get('SUBMISSION_HASH_SECRET')

  if (!supabaseUrl || !serviceRoleKey || !fingerprintSecret) {
    console.error('Correction report function is missing required server environment variables')
    return respond(503, { error: 'Report submission is temporarily unavailable.' })
  }

  let rawPayload: unknown
  try {
    rawPayload = await request.json()
  } catch {
    return respond(400, { error: 'Request body must be valid JSON.' })
  }

  const payload = parsePayload(rawPayload)
  if (!payload) {
    return respond(400, { error: 'Please check the report details and try again.' })
  }

  try {
    const submitterHash = await createSubmissionFingerprint(request, fingerprintSecret)
    if (!submitterHash) {
      return respond(400, { error: 'Unable to verify this request. Please try again.' })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    const { data: reportId, error } = await supabase.rpc('submit_correction_report', {
      p_lecturer_id: payload.lecturer_id,
      p_contact_id: payload.contact_id ?? undefined,
      p_report_type: payload.report_type,
      p_description: payload.description,
      p_reporter_email: payload.reporter_email ?? undefined,
      p_submitter_hash: submitterHash,
    })

    if (error) {
      const message = error.message.toLowerCase()
      if (message.includes('too many reports')) {
        return respond(429, { error: 'Too many reports submitted. Please try again later.' })
      }
      if (message.includes('lecturer not found') || message.includes('contact not found')) {
        return respond(404, { error: 'The lecturer or contact could not be found.' })
      }

      console.error('Correction report RPC failed:', error.message)
      return respond(400, { error: 'The report could not be submitted. Please check the details.' })
    }

    return respond(200, { id: String(reportId) })
  } catch (error) {
    console.error('Correction report submission failed:', error)
    return respond(500, { error: 'Report submission failed. Please try again.' })
  }
})
