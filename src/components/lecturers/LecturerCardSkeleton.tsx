
export function LecturerCardSkeleton() {
  return (
    <div className="flex flex-col justify-between p-5 bg-white rounded-xl border border-border shadow-card animate-pulse">
      <div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-surface-subtle shrink-0" />
          <div className="flex-1 space-y-2 mt-1">
            <div className="h-4 bg-surface-subtle rounded-md w-3/4" />
            <div className="h-3 bg-surface-subtle rounded-md w-1/3" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-surface-subtle shrink-0" />
          <div className="h-3 bg-surface-subtle rounded-md w-1/2" />
        </div>

        <div className="mt-3 flex gap-1.5">
          <div className="h-4 bg-surface-subtle rounded-md w-12" />
          <div className="h-4 bg-surface-subtle rounded-md w-14" />
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex gap-2">
          <div className="h-5 bg-surface-subtle rounded-full w-14" />
          <div className="h-5 bg-surface-subtle rounded-full w-14" />
        </div>
        <div className="h-5 bg-surface-subtle rounded-full w-16" />
      </div>
    </div>
  )
}
