import { describe, it, expect } from 'vitest'
import { normalizePhone, formatPhoneForDisplay, isValidPhone, isMobilePhone } from '@/lib/phone/normalize'
import { generateWhatsAppUrl, isWhatsAppEligible } from '@/lib/phone/whatsapp'

describe('normalizePhone', () => {
  it('returns E.164 format for a valid Tanzanian local number', () => {
    expect(normalizePhone('0712345678')).toBe('+255712345678')
  })

  it('returns E.164 format for a number already in international format', () => {
    expect(normalizePhone('+255712345678')).toBe('+255712345678')
  })

  it('strips the local trunk prefix (0) when converting to international', () => {
    const result = normalizePhone('0712345678', 'TZ')
    expect(result).toBe('+255712345678')
    // Trunk prefix '0' must not remain
    expect(result).not.toMatch(/^\+2550/)
  })

  it('returns null for an empty string', () => {
    expect(normalizePhone('')).toBeNull()
  })

  it('returns null for an invalid number', () => {
    expect(normalizePhone('12345')).toBeNull()
    expect(normalizePhone('abc')).toBeNull()
    expect(normalizePhone('not-a-phone')).toBeNull()
  })

  it('handles numbers with formatting spaces and dashes', () => {
    expect(normalizePhone('+255 712 345 678')).toBe('+255712345678')
    expect(normalizePhone('+255-712-345-678')).toBe('+255712345678')
  })

  it('handles international numbers from other countries', () => {
    // US number
    expect(normalizePhone('+12025551234')).toBe('+12025551234')
    // Kenya
    expect(normalizePhone('+254712345678')).toBe('+254712345678')
  })
})

describe('formatPhoneForDisplay', () => {
  it('formats a valid E.164 number into a readable format', () => {
    const result = formatPhoneForDisplay('+255712345678')
    expect(result).toContain('255')
    expect(result).toMatch(/\d/)
  })

  it('returns original string for unparseable input', () => {
    const raw = 'invalid-number'
    expect(formatPhoneForDisplay(raw)).toBe(raw)
  })

  it('formats a local number using the default country', () => {
    const result = formatPhoneForDisplay('0712345678', 'TZ')
    expect(result).toBeTruthy()
    expect(result).not.toBe('0712345678') // Should be formatted
  })
})

describe('isValidPhone', () => {
  it('returns true for valid Tanzanian mobile numbers', () => {
    expect(isValidPhone('+255712345678')).toBe(true)
    expect(isValidPhone('0712345678', 'TZ')).toBe(true)
  })

  it('returns false for invalid numbers', () => {
    expect(isValidPhone('')).toBe(false)
    expect(isValidPhone('abc')).toBe(false)
    expect(isValidPhone('12345')).toBe(false)
  })
})

describe('isMobilePhone', () => {
  it('returns true for mobile numbers', () => {
    expect(isMobilePhone('+255712345678')).toBe(true)
  })

  it('returns false for obviously invalid numbers', () => {
    expect(isMobilePhone('')).toBe(false)
    expect(isMobilePhone('abc')).toBe(false)
  })
})

describe('WhatsApp phone actions', () => {
  it('creates a WhatsApp link with a normalized international number', () => {
    expect(generateWhatsAppUrl('0712345678')).toBe('https://wa.me/255712345678')
  })

  it('URL-encodes an optional message', () => {
    expect(generateWhatsAppUrl('+255712345678', 'Hello, Dr. Doe!')).toBe(
      'https://wa.me/255712345678?text=Hello%2C%20Dr.%20Doe!'
    )
  })

  it('does not create WhatsApp links for invalid numbers', () => {
    expect(generateWhatsAppUrl('not-a-phone')).toBeNull()
    expect(isWhatsAppEligible('not-a-phone')).toBe(false)
  })
})
