import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const { signIn, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  // If already signed in, redirect
  React.useEffect(() => {
    if (!authLoading && isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [isAdmin, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError(null)
    setLoading(true)
    const { error: signInError } = await signIn(email, password)
    setLoading(false)
    if (signInError) {
      setError(signInError)
    } else {
      navigate('/admin')
    }
  }

  return (
    <>
      <title>Admin Sign In | UniConnect</title>
      <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur mb-4">
              <Lock className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">UniConnect</h1>
            <p className="text-brand-200 text-sm mt-1">Administrator Sign In</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 shadow-2xl space-y-4"
            noValidate
          >
            <div>
              <Input
                id="email"
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="admin@udom.ac.tz"
                required
              />
            </div>
            <div>
              <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-danger-light text-danger text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
            </Button>

            <p className="text-center text-xs text-text-muted pt-1">
              This area is for authorized administrators only.
            </p>
          </form>
        </div>
      </div>
    </>
  )
}
