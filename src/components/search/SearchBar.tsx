import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch?: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
  size?: 'default' | 'large'
  className?: string
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search by lecturer name, course code, or department...',
  autoFocus = false,
  size = 'default',
  className,
}: SearchBarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value)
    }
  }

  const handleClear = () => {
    onChange('')
    onSearch?.('')
    inputRef.current?.focus()
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search
        className={cn(
          'absolute left-3 text-text-muted pointer-events-none',
          size === 'large' ? 'h-5 w-5 left-4' : 'h-4 w-4'
        )}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        aria-label="Search lecturers"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'input-base pr-10',
          size === 'large'
            ? 'pl-12 py-4 text-base rounded-xl shadow-md'
            : 'pl-9'
        )}
        autoComplete="off"
        spellCheck="false"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute right-3 p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors',
            size === 'large' && 'right-4'
          )}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
