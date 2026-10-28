import supabase from '@/lib/supabase'
import type { Database, LecturerContact } from '@/types/database'
import type { ContactFormData } from '@/lib/validation/contact.schema'

/**
 * Retrieves all contacts for a specific lecturer (admin only).
 */
export async function getLecturerContacts(lecturerId: string): Promise<LecturerContact[]> {
  const { data, error } = await supabase
    .from('lecturer_contacts')
    .select('*')
    .eq('lecturer_id', lecturerId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch lecturer contacts: ${error.message}`)
  }

  return (data as LecturerContact[]) ?? []
}

/**
 * Creates a new contact record for a lecturer.
 */
export async function createContact(
  data: ContactFormData & { lecturer_id: string }
): Promise<{ id: string }> {
  const payload = {
    lecturer_id: data.lecturer_id,
    contact_type: data.contact_type,
    contact_value: data.contact_value.trim(),
    display_value: data.display_value?.trim() || null,
    is_public: data.is_public ?? false,
    verification_status: data.verification_status ?? 'unverified',
    consent_status: data.consent_status ?? 'unknown',
    source_type: data.source_type || null,
    notes: data.notes?.trim() || null,
    verified_at: data.verification_status === 'verified' ? new Date().toISOString() : null,
  }

  const { data: created, error } = await supabase
    .from('lecturer_contacts')
    .insert(payload)
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create contact: ${error.message}`)
  }

  return { id: created.id }
}

/**
 * Updates an existing contact record.
 */
export async function updateContact(
  id: string,
  data: Partial<ContactFormData>
): Promise<void> {
  const payload: Database['public']['Tables']['lecturer_contacts']['Update'] = {}

  if (data.contact_type !== undefined) payload.contact_type = data.contact_type
  if (data.contact_value !== undefined) payload.contact_value = data.contact_value.trim()
  if (data.display_value !== undefined) payload.display_value = data.display_value?.trim() || null
  if (data.is_public !== undefined) payload.is_public = data.is_public
  if (data.verification_status !== undefined) {
    payload.verification_status = data.verification_status
    if (data.verification_status === 'verified') {
      payload.verified_at = new Date().toISOString()
    }
  }
  if (data.consent_status !== undefined) payload.consent_status = data.consent_status
  if (data.source_type !== undefined) payload.source_type = data.source_type || null
  if (data.notes !== undefined) payload.notes = data.notes?.trim() || null

  const { error } = await supabase
    .from('lecturer_contacts')
    .update(payload)
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update contact: ${error.message}`)
  }
}

/**
 * Deletes a contact record.
 */
export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase
    .from('lecturer_contacts')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete contact: ${error.message}`)
  }
}

/**
 * Verifies a contact record, recording the verification timestamp and optional verifier.
 */
export async function verifyContact(id: string, verifiedBy?: string): Promise<void> {
  const updatePayload: Database['public']['Tables']['lecturer_contacts']['Update'] = {
    verification_status: 'verified',
    verified_at: new Date().toISOString(),
  }

  if (verifiedBy) {
    updatePayload.verified_by = verifiedBy
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user?.id) {
      updatePayload.verified_by = user.id
    }
  }

  const { error } = await supabase
    .from('lecturer_contacts')
    .update(updatePayload)
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to verify contact: ${error.message}`)
  }
}

/**
 * Publishes a contact record, ensuring it is only made public if verified.
 */
export async function publishContact(id: string): Promise<void> {
  const { data: contact, error: fetchError } = await supabase
    .from('lecturer_contacts')
    .select('verification_status')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw new Error(`Failed to check contact status: ${fetchError.message}`)
  }

  if (contact?.verification_status !== 'verified') {
    throw new Error('Only verified contacts can be published to the public directory')
  }

  const { error } = await supabase
    .from('lecturer_contacts')
    .update({ is_public: true })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to publish contact: ${error.message}`)
  }
}

/**
 * Hides a contact record from the public directory.
 */
export async function hideContact(id: string): Promise<void> {
  const { error } = await supabase
    .from('lecturer_contacts')
    .update({ is_public: false })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to hide contact: ${error.message}`)
  }
}

/**
 * Marks a contact as outdated and hides it from the public directory.
 */
export async function markContactOutdated(id: string): Promise<void> {
  const { error } = await supabase
    .from('lecturer_contacts')
    .update({
      verification_status: 'outdated',
      is_public: false,
    })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to mark contact as outdated: ${error.message}`)
  }
}

// Backward compatibility alias
export const markOutdated = markContactOutdated
