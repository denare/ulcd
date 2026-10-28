import parsePhoneNumberFromString, { type CountryCode } from 'libphonenumber-js/max'
import { normalizePhone } from './normalize'

/**
 * Checks if a phone number is a valid mobile number eligible for WhatsApp.
 */
export function isWhatsAppEligible(phone: string, defaultCountry = 'TZ'): boolean {
  if (!phone || typeof phone !== 'string') return false
  const trimmed = phone.trim()
  if (!trimmed) return false

  try {
    const country = (defaultCountry.toUpperCase() as CountryCode) || 'TZ'
    const parsed = parsePhoneNumberFromString(trimmed, country)
    if (!parsed || !parsed.isValid()) return false

    const type = parsed.getType()
    // In libphonenumber-js, mobile numbers have type MOBILE or FIXED_LINE_OR_MOBILE
    return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE'
  } catch {
    return false
  }
}

/**
 * Generates a WhatsApp direct click-to-chat link (https://wa.me/<number>?text=<message>).
 * Strips leading '+' from E.164 format and encodes optional message.
 * Returns null if the phone number is invalid.
 */
export function generateWhatsAppUrl(
  phone: string,
  message?: string,
  defaultCountry = 'TZ'
): string | null {
  const normalized = normalizePhone(phone, defaultCountry)
  if (!normalized) return null

  // Strip leading '+'
  const cleanNumber = normalized.replace(/^\+/, '')
  const baseUrl = `https://wa.me/${cleanNumber}`

  if (message && message.trim()) {
    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`
  }

  return baseUrl
}

/**
 * Generates a default polite student message for WhatsApp pre-fill.
 */
export function generateStudentMessage(lecturerName: string): string {
  const name = lecturerName.trim()
  return `Hello ${name}, I am a student reaching out regarding your course.`
}
