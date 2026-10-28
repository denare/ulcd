import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Users } from 'lucide-react'
import { LecturerCard } from '@/components/lecturers/LecturerCard'
import { LecturerCardSkeleton } from '@/components/lecturers/LecturerCardSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { getDepartment, getDepartmentLecturers, type DepartmentWithSchool } from '@/services/departments.service'

export default function DepartmentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: dept,
    isLoading: deptLoading,
    isError: deptError,
    refetch: refetchDepartment,
  } = useQuery({
    queryKey: ['department', id],
    queryFn: () => getDepartment(id!) as unknown as Promise<DepartmentWithSchool | null>,
    enabled: !!id,
  })

  const {
    data: lecturers = [],
    isLoading: lecturersLoading,
    isError: lecturersError,
    refetch: refetchLecturers,
  } = useQuery({
    queryKey: ['department-lecturers', id],
    queryFn: () => getDepartmentLecturers(id!),
    enabled: !!id,
  })

  if (deptError) return (
    <div role="alert" className="container-narrow py-16 text-center">
      <p className="text-text-muted mb-4">Unable to load this department. Check your connection and try again.</p>
      <button onClick={() => void refetchDepartment()} className="btn-secondary">Retry</button>
    </div>
  )

  if (!deptLoading && !dept) return (
    <div className="container-narrow py-20 text-center">
      <h1 className="text-2xl font-display font-bold mb-3">Department not found</h1>
      <Link to="/departments" className="btn-primary">Browse departments</Link>
    </div>
  )

  return (
    <>
      <title>{dept?.name ?? 'Department'} | UniConnect</title>
      <div className="container-wide py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-text-muted mb-6">
          <Link to="/departments" className="hover:text-brand-600 transition-colors">Departments</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-text-primary">{dept?.name ?? '...'}</span>
        </nav>

        <div className="mb-8">
          {deptLoading ? (
            <div className="h-8 w-64 bg-surface-subtle rounded animate-pulse" />
          ) : (
            <>
              <h1 className="text-3xl font-display font-bold text-text-primary mb-1">{dept?.name}</h1>
              {dept?.school_name && <p className="text-text-muted">{dept.school_name}</p>}
              {dept?.description && <p className="text-text-secondary mt-2">{dept.description}</p>}
            </>
          )}
        </div>

        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Lecturers {!lecturersLoading && `(${lecturers.length})`}
        </h2>

        {lecturersLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <LecturerCardSkeleton key={i} />)}
          </div>
        ) : lecturersError ? (
          <div role="alert" className="text-center py-12">
            <p className="text-text-muted mb-4">Unable to load lecturers for this department.</p>
            <button onClick={() => void refetchLecturers()} className="btn-secondary">Retry</button>
          </div>
        ) : lecturers.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8 text-text-muted" />}
            title="No lecturers listed"
            description="No published lecturers are currently associated with this department."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lecturers.map(l => (
              <LecturerCard key={l.id} lecturer={l} onClick={() => navigate(`/lecturers/${l.id}`)} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
