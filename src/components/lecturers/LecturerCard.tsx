import { Link } from 'react-router-dom'
import { CheckCircle2, Building2, BookOpen, Phone, Mail } from 'lucide-react'
import type { SearchLecturerRow } from '@/types/database'
import { LecturerAvatar } from './LecturerAvatar'
import { Badge } from '@/components/ui/Badge'
import { formatVerificationStatus } from '@/utils/formatting'
import { cn } from '@/utils/cn'

export interface LecturerCardProps {
  lecturer: SearchLecturerRow
  onClick?: () => void
  className?: string
}

export function LecturerCard({ lecturer, onClick, className }: LecturerCardProps) {
  const isVerified = lecturer.verification_status === 'verified'

  return (
    <Link
      to={`/lecturers/${lecturer.id}`}
      onClick={onClick}
      className={cn(
        'group flex flex-col justify-between p-5 bg-white rounded-xl border border-border shadow-card hover:shadow-card-hover hover:border-brand-300 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        className
      )}
      aria-label={`View profile for ${lecturer.display_name}`}
    >
      <div>
        {/* Header: Avatar + Names + Verification */}
        <div className="flex items-start gap-4">
          <LecturerAvatar
            name={lecturer.display_name}
            size="md"
            className="group-hover:scale-105 transition-transform"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-semibold text-text-primary group-hover:text-brand-600 transition-colors truncate">
                {lecturer.display_name}
              </h3>
              {isVerified && (
                <span
                  title="Verified Profile"
                  className="inline-flex text-teal-600 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4 fill-teal-50" />
                </span>
              )}
            </div>

            {lecturer.title && (
              <p className="text-xs font-medium text-text-muted mt-0.5">
                {lecturer.title}
              </p>
            )}
          </div>
        </div>

        {/* Department / School */}
        {lecturer.department_name && (
          <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
            <Building2 className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="truncate">{lecturer.department_name}</span>
          </div>
        )}

        {/* Course Codes if available */}
        {lecturer.course_codes && lecturer.course_codes.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <BookOpen className="w-3.5 h-3.5 text-text-muted shrink-0" />
            {lecturer.course_codes.slice(0, 3).map((code) => (
              <Badge key={code} variant="gray" size="sm">
                {code}
              </Badge>
            ))}
            {lecturer.course_codes.length > 3 && (
              <span className="text-2xs text-text-muted">
                +{lecturer.course_codes.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Contact Availability & Status */}
      <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-3">
          {lecturer.has_phone && (
            <span
              className="flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-medium"
              title="Phone contact available"
            >
              <Phone className="w-3 h-3 text-teal-600" />
              <span>Phone</span>
            </span>
          )}
          {lecturer.has_email && (
            <span
              className="flex items-center gap-1 text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full font-medium"
              title="Email contact available"
            >
              <Mail className="w-3 h-3 text-brand-600" />
              <span>Email</span>
            </span>
          )}
          {!lecturer.has_phone && !lecturer.has_email && (
            <span className="text-2xs text-text-muted">Contact details pending</span>
          )}
        </div>

        <Badge
          variant={isVerified ? 'green' : 'gray'}
          size="sm"
        >
          {formatVerificationStatus(lecturer.verification_status)}
        </Badge>
      </div>
    </Link>
  )
}
