import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/LoadingSkeleton'
import { Pagination } from '@/components/ui/Pagination'
import { getAdminReports, updateReportStatus } from '@/services/reports.service'
import { formatReportType, formatDate } from '@/utils/formatting'
import type { ReportStatus } from '@/types/database'

const STATUS_TABS: { key: string; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'pending_review', label: 'Pending' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'resolved_corrected', label: 'Resolved' },
  { key: 'rejected', label: 'Rejected' },
]

const PAGE_SIZE = 20

export default function ReportsAdminPage() {
  const [activeTab, setActiveTab] = React.useState('')
  const [page, setPage] = React.useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', activeTab, page],
    queryFn: () => getAdminReports({ status: activeTab || undefined, page, pageSize: PAGE_SIZE }),
  })
  const reports = data?.data ?? []
  const total = data?.count ?? 0

  const updateMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: ReportStatus; notes?: string }) =>
      updateReportStatus(id, status, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  })

  const statusBadge = (s: string) => {
    const v: Record<string, 'yellow' | 'blue' | 'green' | 'red' | 'gray'> = {
      pending_review: 'yellow', under_review: 'blue',
      resolved_corrected: 'green', resolved_verified: 'green',
      resolved_hidden: 'green', rejected: 'red', spam: 'red',
    }
    const label = s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    return <Badge variant={v[s] ?? 'gray'}>{label}</Badge>
  }

  return (
    <>
      <title>Reports | UniConnect Admin</title>
      <div className="space-y-5">
        <h1 className="text-2xl font-display font-bold text-text-primary">Correction Reports</h1>

        {/* Status tabs */}
        <div className="flex gap-1 border-b border-border overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1) }}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))
          ) : reports.length === 0 ? (
            <div className="py-12 text-center text-text-muted">No reports found.</div>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="blue">{formatReportType(r.report_type)}</Badge>
                      {statusBadge(r.status)}
                    </div>
                    <p className="font-medium text-text-primary">
                      {r.lecturers?.display_name ?? 'Unknown Lecturer'}
                    </p>
                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">{r.description}</p>
                    {r.reporter_email && (
                      <p className="text-xs text-text-muted mt-1">Reporter: {r.reporter_email}</p>
                    )}
                    <p className="text-xs text-text-muted">{formatDate(r.created_at)}</p>
                  </div>
                </div>
                {r.status === 'pending_review' && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                    <button
                      onClick={() => updateMutation.mutate({ id: r.id, status: 'under_review' })}
                      className="btn-secondary btn-sm"
                    >
                      Mark Under Review
                    </button>
                    <button
                      onClick={() => updateMutation.mutate({ id: r.id, status: 'resolved_corrected' })}
                      className="btn-primary btn-sm"
                    >
                      Resolve — Corrected
                    </button>
                    <button
                      onClick={() => updateMutation.mutate({ id: r.id, status: 'rejected' })}
                      className="btn-danger btn-sm"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateMutation.mutate({ id: r.id, status: 'spam' })}
                      className="btn-ghost btn-sm text-text-muted"
                    >
                      Spam
                    </button>
                  </div>
                )}
                {r.status === 'under_review' && (
                  <div className="flex gap-2 pt-1 border-t border-border">
                    <button
                      onClick={() => updateMutation.mutate({ id: r.id, status: 'resolved_corrected' })}
                      className="btn-primary btn-sm"
                    >
                      Resolve — Corrected
                    </button>
                    <button
                      onClick={() => updateMutation.mutate({ id: r.id, status: 'resolved_verified' })}
                      className="btn-secondary btn-sm"
                    >
                      Resolve — Verified (no change)
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {total > PAGE_SIZE && (
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / PAGE_SIZE)}
            totalCount={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  )
}
