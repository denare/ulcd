import React from 'react'
import { cn } from '@/utils/cn'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps): JSX.Element {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-subtle', className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export function LecturerCardSkeleton(): JSX.Element {
  return (
    <div className="card p-5 flex flex-col justify-between gap-4 animate-pulse">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-border/60">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-20 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-full" />
            <Skeleton className="w-7 h-7 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton(): JSX.Element {
  return (
    <div className="space-y-8 animate-pulse max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="card p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Skeleton className="w-24 h-24 rounded-full shrink-0" />
        <div className="flex-1 space-y-3 text-center sm:text-left w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
            <Skeleton className="h-8 w-56 rounded mx-auto sm:mx-0" />
            <Skeleton className="h-6 w-16 rounded-full mx-auto sm:mx-0" />
          </div>
          <Skeleton className="h-4 w-72 rounded mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-48 rounded mx-auto sm:mx-0" />
          <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact info skeleton */}
        <div className="card p-6 space-y-4">
          <Skeleton className="h-6 w-36 rounded" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* Office & Course info skeleton */}
        <div className="card p-6 space-y-4">
          <Skeleton className="h-6 w-36 rounded" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/6 rounded" />
          </div>
          <div className="pt-4 flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skeleton
