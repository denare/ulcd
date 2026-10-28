import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, MapPin, Clock, BookOpen, Flag, CheckCircle } from 'lucide-react'
import { ProfileSkeleton } from '@/components/lecturers/ProfileSkeleton'
import { LecturerAvatar } from '@/components/lecturers/LecturerAvatar'
import { ContactActions } from '@/components/lecturers/ContactActions'
import { Badge } from '@/components/ui/Badge'
import { getPublicLecturer } from '@/services/lecturers.service'
import { formatDate } from '@/utils/formatting'
import type { PublicLecturerRow } from '@/types/database'

export default function LecturerProfilePage() {
  const { id } = useParams<{ id: string }>()

  const { data: lecturer, isLoading, isError, refetch } = useQuery<PublicLecturerRow | null>({
    queryKey: ['lecturer', id],
    queryFn: () => getPublicLecturer(id!),
    enabled: !!id,
    staleTime: 2 * 60_000,
  })

  if (isLoading) return (
    <div className="container-narrow py-8"><ProfileSkeleton /></div>
  )

  if (isError) return (
    <div className="container-narrow py-16 text-center">
      <p className="text-text-muted mb-4">Failed to load lecturer profile.</p>
      <button onClick={() => refetch()} className="btn-secondary">Retry</button>
    </div>
  )

  if (!lecturer) return (
    <div className="container-narrow py-20 text-center">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-3">Profile not found</h1>
      <p className="text-text-secondary mb-6">This lecturer profile is not publicly available or doesn't exist.</p>
      <Link to="/lecturers" className="btn-primary">Browse all lecturers</Link>
    </div>
  )

  const isVerified = lecturer.verification_status === 'verified'

  return (
    <>
      <title>{lecturer.display_name} | UniConnect</title>
      <div className="container-narrow py-8 md:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-text-muted mb-6">
          <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/lecturers" className="hover:text-brand-600 transition-colors">Lecturers</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-text-primary truncate">{lecturer.display_name}</span>
        </nav>

        {/* Profile header */}
        <div className="card p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <LecturerAvatar name={lecturer.display_name} size="xl" />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {lecturer.title && (
                  <Badge variant="blue">{lecturer.title}</Badge>
                )}
                {isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                    <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    Verified
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary mb-2">
                {lecturer.display_name}
              </h1>

              <div className="flex flex-wrap gap-2 text-sm text-text-secondary">
                {lecturer.department_name && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                    {lecturer.department_name}
                  </span>
                )}
                {lecturer.school_name && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{lecturer.school_name}</span>
                  </>
                )}
                {lecturer.institution_name && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{lecturer.institution_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact section */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Contact Information</h2>
          {lecturer.contacts.length > 0 ? (
            <ContactActions contacts={lecturer.contacts} mode="full" />
          ) : (
            <p className="text-text-muted text-sm">
              No contact information is currently publicly available for this lecturer.
            </p>
          )}
        </div>

        {/* Courses */}
        {lecturer.courses.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Courses Taught</h2>
            <div className="flex flex-wrap gap-2">
              {lecturer.courses.map((c) => (
                <Link
                  key={c.id}
                  to={`/courses/${c.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle
                             border border-border text-sm text-text-secondary hover:border-brand-300
                             hover:text-brand-600 transition-colors"
                >
                  <span className="font-mono font-medium text-xs">{c.course_code}</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline truncate max-w-[200px]">{c.course_name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Additional info */}
        {(lecturer.office_location || lecturer.office_hours || lecturer.biography || lecturer.last_verified_at) && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Additional Information</h2>
            <div className="space-y-3 text-sm">
              {lecturer.office_location && (
                <div className="flex gap-2 text-text-secondary">
                  <MapPin className="h-4 w-4 mt-0.5 text-text-muted flex-shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-medium text-text-primary">Office: </span>
                    {lecturer.office_location}
                  </div>
                </div>
              )}
              {lecturer.office_hours && (
                <div className="flex gap-2 text-text-secondary">
                  <Clock className="h-4 w-4 mt-0.5 text-text-muted flex-shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-medium text-text-primary">Office hours: </span>
                    {lecturer.office_hours}
                  </div>
                </div>
              )}
              {lecturer.biography && (
                <p className="text-text-secondary leading-relaxed">{lecturer.biography}</p>
              )}
              {lecturer.last_verified_at && (
                <p className="text-text-muted text-xs">
                  Last verified: {formatDate(lecturer.last_verified_at)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Report */}
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Flag className="h-4 w-4" aria-hidden="true" />
          <Link
            to={`/report-information?lecturer=${id}`}
            className="text-text-muted hover:text-brand-600 transition-colors underline underline-offset-2"
          >
            Is this information incorrect or outdated? Report it
          </Link>
        </div>
      </div>
    </>
  )
}
