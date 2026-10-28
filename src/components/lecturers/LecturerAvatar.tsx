import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { getInitials } from '@/utils/formatting'
import { cn } from '@/utils/cn'

export interface LecturerAvatarProps {
  name: string
  imageUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function LecturerAvatar({
  name,
  imageUrl,
  size = 'md',
  className,
}: LecturerAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base font-semibold',
    xl: 'w-24 h-24 text-2xl font-bold',
  }

  const initials = getInitials(name)

  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-border bg-brand-50 text-brand-700 shadow-sm',
        sizeClasses[size],
        className
      )}
    >
      {imageUrl && (
        <AvatarPrimitive.Image
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        delayMs={200}
        className="flex h-full w-full items-center justify-center font-display tracking-wide uppercase"
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
