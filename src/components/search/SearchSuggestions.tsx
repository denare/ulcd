import { Building2, CheckCircle2, BookOpen, Loader2 } from 'lucide-react'
import type { SearchLecturerRow } from '@/types/database'
import { LecturerAvatar } from '@/components/lecturers/LecturerAvatar'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

export interface SearchSuggestionsProps {
  suggestions: SearchLecturerRow[]
  isLoading?: boolean
  isError?: boolean
  onSelect: (lecturer: SearchLecturerRow) => void
  onRetry?: () => void
  query: string
  className?: string
}

export function SearchSuggestions({
  suggestions,
  isLoading,
  isError,
  onSelect,
  onRetry,
  query,
  className,
}: SearchSuggestionsProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-border shadow-lg p-4 z-40 animate-fade-in flex items-center justify-center gap-2 text-sm text-text-muted',
          className
        )}
      >
        <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
        <span>Searching directory...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div
        role="alert"
        className={cn(
          'absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-border shadow-lg p-5 z-40 animate-fade-in text-center text-sm text-text-muted',
          className
        )}
      >
        <p>Search is temporarily unavailable. Check your connection or directory configuration.</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-secondary mt-3">
            Try again
          </button>
        )}
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div
        className={cn(
          'absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-border shadow-lg p-5 z-40 animate-fade-in text-center text-sm text-text-muted',
          className
        )}
      >
        No lecturer or course found matching &ldquo;<span className="font-semibold text-text-primary">{query}</span>&rdquo;
      </div>
    )
  }

  return (
    <ul
      role="listbox"
      aria-label="Search suggestions"
      className={cn(
        'absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-border shadow-lg overflow-hidden divide-y divide-border z-40 animate-fade-in',
        className
      )}
    >
      {suggestions.map((lecturer) => (
        <li
          key={lecturer.id}
          role="option"
          aria-selected={false}
          onClick={() => onSelect(lecturer)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelect(lecturer)
            }
          }}
          tabIndex={0}
          className="flex items-center justify-between p-3.5 hover:bg-surface-subtle cursor-pointer transition-colors focus:bg-surface-subtle focus:outline-none"
        >
          <div className="flex items-center gap-3 min-w-0">
            <LecturerAvatar name={lecturer.display_name} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-text-primary truncate">
                  {lecturer.display_name}
                </span>
                {lecturer.verification_status === 'verified' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                )}
              </div>
              {lecturer.department_name && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted truncate mt-0.5">
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{lecturer.department_name}</span>
                </div>
              )}
            </div>
          </div>

          {lecturer.course_codes && lecturer.course_codes.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 shrink-0 ml-3">
              <BookOpen className="w-3 h-3 text-text-muted" />
              <Badge variant="blue" size="sm">
                {lecturer.course_codes[0]}
              </Badge>
              {lecturer.course_codes.length > 1 && (
                <span className="text-2xs text-text-muted">
                  +{lecturer.course_codes.length - 1}
                </span>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
