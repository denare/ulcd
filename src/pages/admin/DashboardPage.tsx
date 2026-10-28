import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users, CheckCircle, Phone, AlertTriangle,
  Building, BookOpen, Plus, FileUp, ClipboardList,
} from 'lucide-react'
import { getAdminStats } from '@/services/admin.service'
import { formatRelativeDate } from '@/utils/formatting'
import { Skeleton } from '@/components/ui/LoadingSkeleton'
import type { AdminStats } from '@/types/database'

function StatCard({ label, value, icon, color }: {
  label: string; value: number | undefined; icon: React.ReactNode; color: string
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`} aria-hidden="true">{icon}</div>
      </div>
      {value === undefined ? (
        <Skeleton className="h-8 w-16 mb-1" />
      ) : (
        <p className="text-2xl font-display font-bold text-text-primary">{value.toLocaleString()}</p>
      )}
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => getAdminStats(),
    staleTime: 60_000,
  })

  return (
    <>
      <title>Dashboard | UniConnect Admin</title>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Lecturers" value={stats?.total_lecturers} icon={<Users className="h-5 w-5" />} color="bg-brand-100 text-brand-600" />
          <StatCard label="Published Profiles" value={stats?.published_lecturers} icon={<CheckCircle className="h-5 w-5" />} color="bg-success-light text-success" />
          <StatCard label="Verified Contacts" value={stats?.verified_contacts} icon={<Phone className="h-5 w-5" />} color="bg-teal-100 text-teal-600" />
          <StatCard label="Pending Reports" value={stats?.pending_reports} icon={<AlertTriangle className="h-5 w-5" />} color="bg-warning-light text-warning" />
          <StatCard label="Departments" value={stats?.total_departments} icon={<Building className="h-5 w-5" />} color="bg-purple-100 text-purple-600" />
          <StatCard label="Courses" value={stats?.total_courses} icon={<BookOpen className="h-5 w-5" />} color="bg-indigo-100 text-indigo-600" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Updates */}
          <div className="card p-5">
            <h2 className="font-semibold text-text-primary mb-4">Recent Updates</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : !stats?.recent_updates || stats.recent_updates.length === 0 ? (
              <p className="text-text-muted text-sm">No recent updates.</p>
            ) : (
              <ul className="space-y-2">
                {stats.recent_updates.map((l) => (
                  <li key={l.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <Link to={`/admin/lecturers/${l.id}/edit`} className="text-sm font-medium text-text-primary hover:text-brand-600 transition-colors">
                      {l.display_name}
                    </Link>
                    <span className="text-xs text-text-muted">{formatRelativeDate(l.updated_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-5">
            <h2 className="font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: '/admin/lecturers/new', icon: <Plus className="h-4 w-4" />, label: 'Add New Lecturer' },
                { to: '/admin/reports', icon: <ClipboardList className="h-4 w-4" />, label: 'Review Pending Reports', badge: stats?.pending_reports },
                { to: '/admin/import', icon: <FileUp className="h-4 w-4" />, label: 'Import CSV' },
              ].map(({ to, icon, label, badge }) => (
                <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-brand-300 hover:bg-brand-50 transition-all group">
                  <span className="text-text-muted group-hover:text-brand-600 transition-colors" aria-hidden="true">{icon}</span>
                  <span className="flex-1 text-sm font-medium text-text-primary group-hover:text-brand-600 transition-colors">{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className="badge-red text-xs">{badge}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
