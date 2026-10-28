import type {
  VerificationStatus,
  PublicationStatus,
  ContactType,
  ReportType,
} from '@/types/database'

/**
 * Maps verification status to user-friendly label
 */
export function formatVerificationStatus(status: VerificationStatus | string): string {
  const map: Record<string, string> = {
    unverified: 'Unverified',
    pending_review: 'Pending Review',
    verified: 'Verified',
    outdated: 'Outdated',
    rejected: 'Rejected',
  }
  return map[status] ?? status
}

/**
 * Maps publication status to user-friendly label
 */
export function formatPublicationStatus(status: PublicationStatus | string): string {
  const map: Record<string, string> = {
    draft: 'Draft',
    published: 'Published',
    unpublished: 'Unpublished',
    archived: 'Archived',
  }
  return map[status] ?? status
}

/**
 * Maps contact type code to readable label
 */
export function formatContactType(type: ContactType | string): string {
  const map: Record<string, string> = {
    mobile_phone: 'Mobile',
    office_phone: 'Office Phone',
    email: 'Email',
    other: 'Other',
  }
  return map[type] ?? type
}

/**
 * Maps report type code to readable label
 */
export function formatReportType(type: ReportType | string): string {
  const map: Record<string, string> = {
    incorrect_phone: 'Incorrect Phone',
    incorrect_email: 'Incorrect Email',
    incorrect_office_phone: 'Incorrect Office Phone',
    outdated_information: 'Outdated Information',
    missing_lecturer: 'Missing Lecturer',
    duplicate_profile: 'Duplicate Profile',
    privacy_concern: 'Privacy Concern',
    other: 'Other',
  }
  return map[type] ?? type
}

/**
 * Formats ISO date string to readable format (e.g. '28 Oct 2026')
 */
export function formatDate(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Formats ISO date string to relative time (e.g. '2 days ago', 'just now')
 */
export function formatRelativeDate(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (isNaN(date.getTime())) return iso

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 0) {
    return formatDate(iso)
  }
  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return diffInDays === 1 ? 'yesterday' : `${diffInDays} days ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`
}

/**
 * Extracts initials from the first two words of a name (uppercase)
 */
export function getInitials(name: string): string {
  if (!name) return ''
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/**
 * Truncates text to maxLen characters, appending an ellipsis if truncated
 */
export function truncate(text: string, maxLen: number): string {
  if (!text) return ''
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}

/**
 * Generates a deterministic avatar background color class from a name string
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-brand-600 text-white',
    'bg-teal-600 text-white',
    'bg-blue-600 text-white',
    'bg-indigo-600 text-white',
    'bg-emerald-600 text-white',
    'bg-cyan-600 text-white',
    'bg-sky-600 text-white',
    'bg-violet-600 text-white',
  ]
  if (!name) return colors[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

/**
 * Generates a mailto: URL with optional subject and body
 */
export function generateMailtoUrl(
  email: string,
  subject?: string,
  body?: string
): string {
  const trimmed = email.trim()
  if (!trimmed) return ''
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const queryString = params.toString()
  return queryString ? `mailto:${trimmed}?${queryString}` : `mailto:${trimmed}`
}

