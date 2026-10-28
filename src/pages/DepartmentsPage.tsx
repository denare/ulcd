import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, ChevronRight } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/LoadingSkeleton'
import { getPublicDepartments } from '@/services/departments.service'

export default function DepartmentsPage() {
  const { data: departments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['departments-public'],
    queryFn: () => getPublicDepartments(),
    staleTime: 5 * 60_000,
  })

  // Group by school
  const grouped = departments.reduce<Record<string, typeof departments>>((acc, dept) => {
    const school = dept.school_name ?? 'General'
    ;(acc[school] ??= []).push(dept)
    return acc
  }, {})

  return (
    <>
      <title>Departments | UniConnect</title>
      <div className="container-wide py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Departments</h1>
          <p className="text-text-secondary">Browse departments and their lecturers.</p>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-6 w-64 mb-4" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => <Skeleton key={j} className="h-24 rounded-lg" />)}
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-text-muted mb-4">Failed to load departments.</p>
            <button onClick={() => refetch()} className="btn-secondary">Retry</button>
          </div>
        ) : departments.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-8 w-8 text-text-muted" />}
            title="No departments listed"
            description="Departments will appear here once they are added by an administrator."
          />
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([school, depts]) => (
              <div key={school}>
                <h2 className="text-lg font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-brand-400 inline-block rounded" aria-hidden="true" />
                  {school}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {depts.map((dept) => (
                    <Link
                      key={dept.id}
                      to={`/departments/${dept.id}`}
                      className="card card-hover p-5 block group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-text-primary group-hover:text-brand-600 transition-colors leading-snug">
                          {dept.name}
                        </h3>
                        <ChevronRight className="h-4 w-4 text-text-muted flex-shrink-0 mt-0.5 group-hover:text-brand-500 transition-colors" aria-hidden="true" />
                      </div>
                      {dept.description && (
                        <p className="text-sm text-text-muted mt-1 line-clamp-2">{dept.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
