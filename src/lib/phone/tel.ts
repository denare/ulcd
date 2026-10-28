import { normalizePhone } from './normalize'

/**
 * Generates a tel: URI scheme link for dialling (e.g. 'tel:+255712345678').
 * Returns null if the phone number is invalid. Default country is 'TZ'.
 */
export function generateTelUrl(phone: string, defaultCountry = 'TZ'): string | null {
  const normalized = normalizePhone(phone, defaultCountry)
  if (!normalized) return null
  return `tel:${normalized}`
}
