import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
}

/**
 * Protects admin routes.
 * - While auth is loading: shows a centered spinner
 * - If not authenticated / not an active admin: redirects to /admin/login
 * - Otherwise: renders children
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-surface-muted"
        role="status"
        aria-label="Loading…"
      >
        <Loader2 className="h-8 w-8 text-brand-600 animate-spin" aria-hidden="true" />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
