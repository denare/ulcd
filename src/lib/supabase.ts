import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const isSupabaseConfigured = (() => {
  try {
    const url = new URL(supabaseUrl)
    return (
      (
        url.protocol === 'https:' ||
        (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
      ) &&
      Boolean(supabaseAnonKey) &&
      !/your-project-id|placeholder/i.test(supabaseUrl) &&
      !/your-anon-key|placeholder/i.test(supabaseAnonKey)
    )
  } catch {
    return false
  }
})()

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[ULCD] Supabase environment variables not set. ' +
    'Copy .env.example to .env.local and fill in your Supabase project credentials.'
  )
}

/**
  * Public Supabase client — uses the anon key only.
  * Row Level Security enforces all access controls on the database side.
  * Never add a service-role key here.
  */
export const supabase = createClient<Database>(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-application-name': 'ulcd',
      },
    },
  }
)

/**
 * Note on supabaseAdmin:
 * Admin operations in ULCD use the standard `supabase` client with authenticated user credentials.
 * Row Level Security (RLS) policies on the database enforce admin authorization based on the
 * authenticated user's `admin_profiles` record. No service-role key is used in client-side code.
 */
export const supabaseAdmin = supabase

export default supabase
