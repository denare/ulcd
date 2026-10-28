import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { LecturerCard } from '@/components/lecturers/LecturerCard'
import { LecturerCardSkeleton } from '@/components/lecturers/LecturerCardSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { getCourse, getCourseLecturers } from '@/services/courses.service'
import { Users } from 'lucide-react'
import type { Course } from '@/types/database'

type CourseWithDept = Course & { department_name?: string | null }

export default function CoursePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
    refetch: refetchCourse,
  } = useQuery<CourseWithDept | null>({
    queryKey: ['course', id],
    queryFn: () => getCourse(id!) as Promise<CourseWithDept | null>,
    enabled: !!id,
  })

  const {
    data: lecturers = [],
    isLoading: lecturersLoading,
    isError: lecturersError,
    refetch: refetchLecturers,
  } = useQuery({
    queryKey: ['course-lecturers', id],
    queryFn: () => getCourseLecturers(id!),
    enabled: !!id,
  })

  if (courseError) return (
    <div role="alert" className="container-narrow py-16 text-center">
      <p className="text-text-muted mb-4">Unable to load this course. Check your connection and try again.</p>
      <button onClick={() => void refetchCourse()} className="btn-secondary">Retry</button>
    </div>
  )

  if (!courseLoading && !course) return (
    <div className="container-narrow py-20 text-center">
      <h1 className="text-2xl font-display font-bold mb-3">Course not found</h1>
      <Link to="/lecturers" className="btn-primary">Browse lecturers</Link>
    </div>
  )

  return (
    <>
      <title>{course ? `${course.course_code} — ${course.course_name}` : 'Course'} | UniConnect</title>
      <div className="container-wide py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-text-muted mb-6">
          <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-text-primary">{course?.course_code ?? '...'}</span>
        </nav>

        <div className="mb-8">
          {courseLoading ? (
            <div className="space-y-2">
              <div className="h-5 w-24 bg-surface-subtle rounded animate-pulse" />
              <div className="h-8 w-80 bg-surface-subtle rounded animate-pulse" />
            </div>
          ) : (
            <>
              <Badge variant="blue" className="mb-2 font-mono">{course?.course_code}</Badge>
              <h1 className="text-3xl font-display font-bold text-text-primary mb-1">{course?.course_name}</h1>
              {course?.department_name && (
                <p className="text-text-muted text-sm">{course.department_name}</p>
              )}
              {course?.description && (
                <p className="text-text-secondary mt-3">{course.description}</p>
              )}
            </>
          )}
        </div>

        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Lecturers Teaching This Course
        </h2>

        {lecturersLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2].map(i => <LecturerCardSkeleton key={i} />)}
          </div>
        ) : lecturersError ? (
          <div role="alert" className="text-center py-12">
            <p className="text-text-muted mb-4">Unable to load lecturers for this course.</p>
            <button onClick={() => void refetchLecturers()} className="btn-secondary">Retry</button>
          </div>
        ) : lecturers.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8 text-text-muted" />}
            title="No lecturers listed"
            description="No published lecturers are currently assigned to this course."
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
