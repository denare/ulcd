import React from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

export function Badge({
  variant = 'gray',
  size = 'md',
  children,
  className,
  ...props
}: BadgeProps): JSX.Element {
  const variantClass = {
    blue: 'badge-blue',
    green: 'badge-green',
    yellow: 'badge-yellow',
    red: 'badge-red',
    gray: 'badge-gray',
  }[variant]

  return (
    <span
      className={cn(
        variantClass,
        size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-1',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
