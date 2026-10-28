import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Eye, Edit, CheckCircle, EyeOff } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/LoadingSkeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { getAdminLecturers, publishLecturer, unpublishLecturer } from '@/services/lecturers.service'
import { formatPublicationStatus, formatVerificationStatus, formatDate } from '@/utils/formatting'

const PAGE_SIZE = 20

export default function LecturersListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const q = searchParams.get('q') ?? ''
  const deptId = searchParams.get('dept') ?? ''
  const status = searchParams.get('status') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  const [localQ, setLocalQ] = React.useState(q)
  const debouncedQ = useDebounce(localQ, 350)

  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean; action: 'publish' | 'unpublish'; id: string; name: string
  } | null>(null)

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (debouncedQ) params.set('q', debouncedQ)
    else params.delete('q')
    params.set('page', '1')
    setSearchParams(params, { replace: true })
  }, [debouncedQ]) // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading } = useQuery({
    queryKey: ['admin-lecturers', q, deptId, status, page],
    queryFn: () => getAdminLecturers({ query: q, deptId: deptId || undefined, status: status || undefined, page, pageSize: PAGE_SIZE }),
  })

  const lecturers = data?.data ?? []
  const total = data?.count ?? 0

  const publishMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'publish' | 'unpublish' }) =>
      action === 'publish' ? publishLecturer(id) : unpublishLecturer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lecturers'] })
      setConfirmDialog(null)
    },
  })

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.set('page', '1')
    setSearchParams(params)
  }

  const pubBadge = (s: string) => {
    const v = { published: 'green', draft: 'gray', unpublished: 'yellow', archived: 'red' } as const
    return <Badge variant={v[s as keyof typeof v] ?? 'gray'}>{formatPublicationStatus(s)}</Badge>
  }

  const verBadge = (s: string) => {
    const v = { verified: 'green', unverified: 'gray', pending_review: 'yellow', outdated: 'red', rejected: 'red' } as const
    return <Badge variant={v[s as keyof typeof v] ?? 'gray'}>{formatVerificationStatus(s)}</Badge>
  }

  return (
    <>
      <title>Lecturers | UniConnect Admin</title>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-display font-bold text-text-primary">Lecturers</h1>
          <Link to="/admin/lecturers/new" className="btn-primary btn-sm">
            <Plus className="h-4 w-4" /> Add Lecturer
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar value={localQ} onChange={setLocalQ} placeholder="Search by name or department..." />
          </div>
          <select value={status} onChange={e => updateParam('status', e.target.value)} className="input-base w-40" aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">Department</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Publication</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary hidden lg:table-cell">Verification</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary hidden lg:table-cell">Updated</th>
                  <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                    </tr>
                  ))
                ) : lecturers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-text-muted">No lecturers found.</td>
                  </tr>
                ) : (
                  lecturers.map((l) => (
                    <tr key={l.id} className="border-b border-border last:border-0 hover:bg-surface-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-text-primary">
                        <Link to={`/admin/lecturers/${l.id}/edit`} className="hover:text-brand-600 transition-colors">
                          {l.display_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                        {l.departments?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3">{pubBadge(l.publication_status)}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">{verBadge(l.verification_status)}</td>
                      <td className="px-4 py-3 text-text-muted hidden lg:table-cell">{formatDate(l.updated_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <a href={`/lecturers/${l.id}`} target="_blank" rel="noopener noreferrer"
                             className="btn-ghost btn-sm p-1.5" aria-label="View public profile">
                            <Eye className="h-4 w-4" />
                          </a>
                          <Link to={`/admin/lecturers/${l.id}/edit`} className="btn-ghost btn-sm p-1.5" aria-label="Edit">
                            <Edit className="h-4 w-4" />
                          </Link>
                          {l.publication_status === 'published' ? (
                            <button
                              onClick={() => setConfirmDialog({ open: true, action: 'unpublish', id: l.id, name: l.display_name })}
                              className="btn-ghost btn-sm p-1.5" aria-label="Unpublish"
                            >
                              <EyeOff className="h-4 w-4 text-warning" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirmDialog({ open: true, action: 'publish', id: l.id, name: l.display_name })}
                              className="btn-ghost btn-sm p-1.5" aria-label="Publish"
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {total > PAGE_SIZE && (
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / PAGE_SIZE)}
            totalCount={total}
            pageSize={PAGE_SIZE}
            onPageChange={p => updateParam('page', String(p))}
          />
        )}
      </div>

      {confirmDialog && (
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(o) => !o && setConfirmDialog(null)}
          title={confirmDialog.action === 'publish' ? 'Publish Profile' : 'Unpublish Profile'}
          description={`Are you sure you want to ${confirmDialog.action} ${confirmDialog.name}?`}
          confirmLabel={confirmDialog.action === 'publish' ? 'Publish' : 'Unpublish'}
          variant={confirmDialog.action === 'unpublish' ? 'danger' : 'primary'}
          loading={publishMutation.isPending}
          onConfirm={() => publishMutation.mutate({ id: confirmDialog.id, action: confirmDialog.action })}
        />
      )}
    </>
  )
}
