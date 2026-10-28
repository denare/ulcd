
export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-8">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 h-4 w-48 bg-surface-subtle rounded-md" />

      {/* Header skeleton */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-surface-subtle shrink-0" />
        <div className="flex-1 space-y-3 text-center sm:text-left w-full">
          <div className="h-7 bg-surface-subtle rounded-md w-3/5 mx-auto sm:mx-0" />
          <div className="h-4 bg-surface-subtle rounded-md w-1/4 mx-auto sm:mx-0" />
          <div className="flex gap-2 pt-2 justify-center sm:justify-start">
            <div className="h-6 w-32 bg-surface-subtle rounded-full" />
            <div className="h-6 w-24 bg-surface-subtle rounded-full" />
          </div>
        </div>
      </div>

      {/* Contacts skeleton */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 space-y-4">
        <div className="h-5 w-40 bg-surface-subtle rounded-md mb-6" />
        <div className="h-14 bg-surface-subtle rounded-xl" />
        <div className="h-14 bg-surface-subtle rounded-xl" />
      </div>

      {/* Courses skeleton */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 space-y-4">
        <div className="h-5 w-44 bg-surface-subtle rounded-md mb-4" />
        <div className="flex gap-3 flex-wrap">
          <div className="h-8 w-48 bg-surface-subtle rounded-lg" />
          <div className="h-8 w-40 bg-surface-subtle rounded-lg" />
        </div>
      </div>
    </div>
  )
}
