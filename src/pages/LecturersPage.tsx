import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { LecturerCard } from '@/components/lecturers/LecturerCard'
import { LecturerCardSkeleton } from '@/components/lecturers/LecturerCardSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { useDebounce } from '@/hooks/useDebounce'
import { searchLecturers } from '@/services/lecturers.service'
import { getPublicDepartments } from '@/services/departments.service'
import { Users } from 'lucide-react'

const PAGE_SIZE = 18

export default function LecturersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const q = searchParams.get('q') ?? ''
  const deptId = searchParams.get('dept') ?? ''
  const sort = (searchParams.get('sort') ?? 'asc') as 'asc' | 'desc'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  const [localQ, setLocalQ] = React.useState(q)
  const debouncedQ = useDebounce(localQ, 350)

  // Sync debounced query to URL
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (debouncedQ) {
      params.set('q', debouncedQ)
    } else {
      params.delete('q')
    }
    params.set('page', '1')
    setSearchParams(params, { replace: true })
  }, [debouncedQ]) // eslint-disable-line react-hooks/exhaustive-deps

  const offset = (page - 1) * PAGE_SIZE

  const { data: lecturers = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['lecturers', q, deptId, sort, page],
    queryFn: () => searchLecturers({ query: q, deptId: deptId || undefined, pageSize: PAGE_SIZE, offset }),
    staleTime: 60_000,
  })

  // Count query for pagination
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['lecturers-count', q, deptId],
    queryFn: async () => {
      const all = await searchLecturers({ query: q, deptId: deptId || undefined, pageSize: 1000, offset: 0 })
      return all.length
    },
    staleTime: 60_000,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['departments-public'],
    queryFn: () => getPublicDepartments(),
    staleTime: 5 * 60_000,
  })

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const hasFilters = !!q || !!deptId

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value); else params.delete(key)
    params.set('page', '1')
    setSearchParams(params)
  }

  const clearAll = () => {
    setLocalQ('')
    setSearchParams({})
  }

  // Sort locally
  const sorted = [...lecturers].sort((a, b) =>
    sort === 'asc'
      ? a.display_name.localeCompare(b.display_name)
      : b.display_name.localeCompare(a.display_name)
  )

  return (
    <>
      <title>Lecturers | UniConnect</title>
      <div className="container-wide py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Lecturers</h1>
          <p className="text-text-secondary">
            {totalCount > 0 ? `${totalCount} lecturer${totalCount !== 1 ? 's' : ''} found` : 'Browse the lecturer directory'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchBar
              value={localQ}
              onChange={setLocalQ}
              onSearch={(v) => updateParam('q', v)}
              placeholder="Search by name, course, or department..."
            />
          </div>

          <select
            value={deptId}
            onChange={(e) => updateParam('dept', e.target.value)}
            className="input-base w-full sm:w-48"
            aria-label="Filter by department"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="input-base w-full sm:w-36"
            aria-label="Sort order"
          >
            <option value="asc">Name: A–Z</option>
            <option value="desc">Name: Z–A</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearAll}
              className="btn-secondary flex items-center gap-2 whitespace-nowrap"
              aria-label="Clear all filters"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <LecturerCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-text-muted mb-4">Failed to load lecturers.</p>
            <button onClick={() => refetch()} className="btn-secondary">
              Try again
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8 text-text-muted" />}
            title="No lecturers found"
            description={hasFilters ? 'Try adjusting your search or clearing filters.' : 'No lecturers are currently listed in the directory.'}
            action={hasFilters ? { label: 'Clear filters', onClick: clearAll } : undefined}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((lecturer) => (
              <LecturerCard
                key={lecturer.id}
                lecturer={lecturer}
                onClick={() => navigate(`/lecturers/${lecturer.id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => updateParam('page', String(p))}
            />
          </div>
        )}
      </div>
    </>
  )
}
