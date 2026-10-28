import { useState, useEffect, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string | undefined
  role: 'platform_admin' | 'institution_admin' | 'editor' | null
  institution_id: string | null
  is_active: boolean
}

export interface UseAuthReturn {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchProfileAndSetUser = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setUser(null)
      setSession(null)
      return
    }

    const authUser = currentSession.user
    setSession(currentSession)

    try {
      const { data: profile, error } = await supabase
        .from('admin_profiles')
        .select('role, institution_id, is_active')
        .eq('user_id', authUser.id)
        .single()

      if (error || !profile) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          role: null,
          institution_id: null,
          is_active: false,
        })
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email,
          role: profile.role,
          institution_id: profile.institution_id,
          is_active: profile.is_active,
        })
      }
    } catch {
      setUser({
        id: authUser.id,
        email: authUser.email,
        role: null,
        institution_id: null,
        is_active: false,
      })
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Initialize session from client
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (mounted) {
        fetchProfileAndSetUser(initialSession).finally(() => {
          if (mounted) setLoading(false)
        })
      }
    })

    // Listen for auth state transitions (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (mounted) {
        setLoading(true)
        await fetchProfileAndSetUser(newSession)
        if (mounted) setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfileAndSetUser])

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          return { error: error.message }
        }

        if (data.session) {
          await fetchProfileAndSetUser(data.session)
        }

        return { error: null }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred during sign in'
        return { error: message }
      }
    },
    [fetchProfileAndSetUser]
  )

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
    } finally {
      setUser(null)
      setSession(null)
    }
  }, [])

  const isAdmin = Boolean(user && user.is_active && user.role !== null)

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAdmin,
  }
}

export default useAuth
