import { useMemo } from 'react'

export interface UsePaginationOptions {
  totalCount: number
  pageSize: number
  currentPage: number
  siblingCount?: number
}

export interface UsePaginationResult {
  pages: (number | 'ellipsis')[]
  hasPrev: boolean
  hasNext: boolean
  canGoToPage: (page: number) => boolean
  totalPages: number
}

function range(start: number, end: number): number[] {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

/**
 * Hook to compute pagination logic, page list, and boundary state.
 */
export function usePagination({
  totalCount,
  pageSize,
  currentPage,
  siblingCount = 1,
}: UsePaginationOptions): UsePaginationResult {
  const totalPages = useMemo(() => {
    if (totalCount <= 0 || pageSize <= 0) return 1
    return Math.max(1, Math.ceil(totalCount / pageSize))
  }, [totalCount, pageSize])

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  const canGoToPage = (page: number): boolean => {
    return page >= 1 && page <= totalPages
  }

  const pages = useMemo<(number | 'ellipsis')[]>(() => {
    // Total numbers to show: siblingCount + firstPage + lastPage + currentPage + 2*dots
    const totalPageNumbers = siblingCount * 2 + 5

    // If page count is less than page numbers we want to show, return full range
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1

    const firstPageIndex = 1
    const lastPageIndex = totalPages

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = range(1, leftItemCount)
      return [...leftRange, 'ellipsis', lastPageIndex]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = range(totalPages - rightItemCount + 1, totalPages)
      return [firstPageIndex, 'ellipsis', ...rightRange]
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex)
      return [firstPageIndex, 'ellipsis', ...middleRange, 'ellipsis', lastPageIndex]
    }

    return range(1, totalPages)
  }, [totalPages, siblingCount, currentPage])

  return {
    pages,
    hasPrev,
    hasNext,
    canGoToPage,
    totalPages,
  }
}

export default usePagination
