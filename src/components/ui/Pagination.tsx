import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePagination } from '@/hooks/usePagination'
import { cn } from '@/utils/cn'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalCount?: number
  pageSize?: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  pageSize = 20,
  className,
}: PaginationProps): JSX.Element | null {
  // Derive effective totalCount for usePagination
  const effectiveTotalCount = totalCount !== undefined ? totalCount : totalPages * pageSize

  const { pages, hasPrev, hasNext } = usePagination({
    currentPage,
    pageSize,
    totalCount: effectiveTotalCount,
    siblingCount: 1,
  })

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn('flex items-center justify-center gap-1 sm:gap-2 select-none', className)}
    >
      <button
        type="button"
        disabled={!hasPrev}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Go to previous page"
        className={cn(
          'inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors border border-border',
          hasPrev
            ? 'bg-white text-text-primary hover:bg-surface-subtle active:bg-surface'
            : 'bg-surface-muted text-text-placeholder cursor-not-allowed border-transparent'
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <ul className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <li key={`ellipsis-${index}`} className="px-2 py-1 text-xs text-text-muted">
                &#8230;
              </li>
            )
          }

          const isCurrent = page === currentPage

          return (
            <li key={`page-${page}`}>
              <button
                type="button"
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'min-w-[2rem] h-8 px-2 flex items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-colors',
                  isCurrent
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                )}
              >
                {page}
              </button>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        disabled={!hasNext}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Go to next page"
        className={cn(
          'inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors border border-border',
          hasNext
            ? 'bg-white text-text-primary hover:bg-surface-subtle active:bg-surface'
            : 'bg-surface-muted text-text-placeholder cursor-not-allowed border-transparent'
        )}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}

export default Pagination
