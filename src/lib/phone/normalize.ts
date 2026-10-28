import parsePhoneNumberFromString, { type CountryCode } from 'libphonenumber-js/max'

/**
 * Normalizes a phone number string to E.164 format (e.g. +255712345678).
 * Returns null if the phone number is invalid. Default country is 'TZ'.
 */
export function normalizePhone(raw: string, defaultCountry = 'TZ'): string | null {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  try {
    const country = (defaultCountry.toUpperCase() as CountryCode) || 'TZ'
    const parsed = parsePhoneNumberFromString(trimmed, country)
    if (parsed && parsed.isValid()) {
      return parsed.format('E.164')
    }
  } catch {
    return null
  }

  return null
}

/**
 * Formats a phone number for display (e.g. '+255 712 345 678').
 * Returns original raw input if unparseable. Default country is 'TZ'.
 */
export function formatPhoneForDisplay(raw: string, defaultCountry = 'TZ'): string {
  if (!raw || typeof raw !== 'string') return ''
  const trimmed = raw.trim()
  if (!trimmed) return ''

  try {
    const country = (defaultCountry.toUpperCase() as CountryCode) || 'TZ'
    const parsed = parsePhoneNumberFromString(trimmed, country)
    if (parsed && parsed.isValid()) {
      return parsed.formatInternational()
    }
  } catch {
    return trimmed
  }

  return trimmed
}

/**
 * Checks whether the given phone number is valid according to country rules.
 * Default country is 'TZ'.
 */
export function isValidPhone(raw: string, defaultCountry = 'TZ'): boolean {
  if (!raw || typeof raw !== 'string') return false
  const trimmed = raw.trim()
  if (!trimmed) return false

  try {
    const country = (defaultCountry.toUpperCase() as CountryCode) || 'TZ'
    const parsed = parsePhoneNumberFromString(trimmed, country)
    return Boolean(parsed && parsed.isValid())
  } catch {
    return false
  }
}

/**
 * Checks if a phone number is a mobile phone (MOBILE or FIXED_LINE_OR_MOBILE).
 */
export function isMobilePhone(raw: string, defaultCountry = 'TZ'): boolean {
  if (!raw || typeof raw !== 'string') return false
  const trimmed = raw.trim()
  if (!trimmed) return false

  try {
    const country = (defaultCountry.toUpperCase() as CountryCode) || 'TZ'
    const parsed = parsePhoneNumberFromString(trimmed, country)
    if (!parsed || !parsed.isValid()) return false
    const type = parsed.getType()
    return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE'
  } catch {
    return false
  }
}
