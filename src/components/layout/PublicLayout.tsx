import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { GraduationCap, Menu, X, ShieldAlert, BookOpen, Users, Info, ShieldCheck } from 'lucide-react'
import { cn } from '@/utils/cn'
import { isSupabaseConfigured } from '@/lib/supabase'

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { name: 'Lecturers', href: '/lecturers', icon: Users },
    { name: 'Departments', href: '/departments', icon: BookOpen },
    { name: 'Report Info', href: '/report-information', icon: ShieldAlert },
    { name: 'About', href: '/about', icon: Info },
  ]

  const isActive = (href: string) => {
    if (href === '/lecturers' && location.pathname.startsWith('/lecturers')) return true
    if (href === '/departments' && location.pathname.startsWith('/departments')) return true
    return location.pathname === href
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted text-text-primary antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-md"
              aria-label="UniConnect Home"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-text-primary tracking-tight block leading-none">
                  UniConnect
                </span>
                <span className="text-2xs font-medium text-text-muted uppercase tracking-wider block mt-0.5">
                  UDOM Directory
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors',
                      active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
                    )}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </nav>

            {/* Admin sign-in link & mobile toggle */}
            <div className="flex items-center gap-2">
              <Link
                to="/admin/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-muted hover:text-brand-600 rounded-md transition-colors"
                title="Administrator Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
                className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-slide-down">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-text-secondary hover:bg-surface-subtle'
                  )}
                >
                  <Icon className="w-4 h-4 text-brand-600" />
                  <span>{link.name}</span>
                </Link>
              )
            })}
            <div className="pt-2 border-t border-border">
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-text-muted hover:bg-surface-subtle"
              >
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Administrator Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {!isSupabaseConfigured && (
        <div
          role="status"
          className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <div className="mx-auto flex max-w-7xl items-start gap-2 sm:px-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              <strong>Directory backend not configured.</strong> Set a valid Supabase
              project URL and anon key in <code>.env.local</code>, then restart the app.
              Directory data and admin actions are unavailable until then.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border text-text-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-lg text-text-primary">
                  UniConnect
                </span>
              </div>
              <p className="text-sm text-text-muted max-w-md leading-relaxed">
                A searchable directory helping University of Dodoma (UDOM) students find listed lecturer contact information, offices, and course assignments.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
                Directory
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/lecturers" className="text-text-secondary hover:text-brand-600">
                    All Lecturers
                  </Link>
                </li>
                <li>
                  <Link to="/departments" className="text-text-secondary hover:text-brand-600">
                    Departments
                  </Link>
                </li>
                <li>
                  <Link to="/report-information" className="text-text-secondary hover:text-brand-600">
                    Report Information
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
                Information
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="text-text-secondary hover:text-brand-600">
                    About UniConnect
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-text-secondary hover:text-brand-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="text-text-secondary hover:text-brand-600">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
            <p>
              &copy; {new Date().getFullYear()} UniConnect. Student-built directory project.
            </p>
            <p className="text-center sm:text-right">
              Disclaimer: UniConnect is an independent service and is not officially affiliated with or endorsed by UDOM.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
