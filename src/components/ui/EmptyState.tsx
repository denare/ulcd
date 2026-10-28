import React from 'react'
import { Button } from './Button'
import { cn } from '@/utils/cn'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl border border-dashed border-border bg-surface-muted/50',
        className
      )}
    >
      {icon && (
        <div
          className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-surface-subtle text-text-muted"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <h3 className="text-base font-semibold text-text-primary mb-1">
        {title}
      </h3>

      {description && (
        <p className="max-w-sm text-sm text-text-muted mb-6">
          {description}
        </p>
      )}

      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
