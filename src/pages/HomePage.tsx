import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Users, BookOpen, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchSuggestions } from '@/components/search/SearchSuggestions'
import { useDebounce } from '@/hooks/useDebounce'
import { searchLecturers } from '@/services/lecturers.service'
import type { SearchLecturerRow } from '@/types/database'

export default function HomePage() {
  const [query, setQuery] = React.useState('')
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const navigate = useNavigate()
  const searchRef = React.useRef<HTMLDivElement>(null)

  const { data: suggestions = [], isFetching, isError, refetch } = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => searchLecturers({ query: debouncedQuery, pageSize: 6 }),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
  })

  useEffect(() => {
    setShowSuggestions(debouncedQuery.trim().length >= 2)
  }, [debouncedQuery])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (lecturer: SearchLecturerRow) => {
    setShowSuggestions(false)
    setQuery('')
    navigate(`/lecturers/${lecturer.id}`)
  }

  const handleSearch = (q: string) => {
    if (q.trim()) {
      navigate(`/lecturers?q=${encodeURIComponent(q.trim())}`)
    }
    setShowSuggestions(false)
  }

  return (
    <>
      <title>UniConnect — UDOM Lecturer Directory</title>

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-brand-50 via-white to-white pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-100/40 blur-3xl" />
          <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-teal-100/30 blur-3xl" />
        </div>

        <div className="container-wide relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium mb-6">
              <ShieldCheck className="h-3.5 w-3.5" />
              UDOM Lecturer Contact Directory
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-text-primary mb-5 text-balance leading-tight">
              Find Your Lecturer.{' '}
              <span className="gradient-text">Connect Directly.</span>
            </h1>

            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto text-balance">
              Search published lecturer contacts, university email addresses, office
              numbers, and course assignments in one place.
            </p>

            {/* Search */}
            <div ref={searchRef} className="relative max-w-2xl mx-auto">
              <SearchBar
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                size="large"
                autoFocus
                placeholder="Search by lecturer name, course code, or department..."
              />
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50">
                  <SearchSuggestions
                    suggestions={suggestions}
                    query={debouncedQuery}
                    onSelect={handleSelect}
                    isLoading={isFetching}
                    isError={isError}
                    onRetry={() => void refetch()}
                  />
                </div>
              )}
            </div>

            <p className="text-xs text-text-muted mt-3">
              Search by name (e.g. "Dr. John"), course code (e.g. "CP 311"), or department
            </p>

            {/* Quick links */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { label: 'Browse all lecturers', to: '/lecturers', icon: <Users className="h-3.5 w-3.5" /> },
                { label: 'Browse departments', to: '/departments', icon: <BookOpen className="h-3.5 w-3.5" /> },
                { label: 'Find by course code', to: '/lecturers', icon: <Search className="h-3.5 w-3.5" /> },
              ].map(({ label, to, icon }) => (
                <Link
                  key={label}
                  to={to}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                             bg-white border border-border text-text-secondary shadow-sm
                             hover:border-brand-300 hover:text-brand-600 transition-all duration-150"
                >
                  {icon}
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section bg-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-3">
              How it works
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Three steps to connect with any UDOM lecturer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Search',
                desc: 'Type a lecturer name, course code like "CP 311", or department name. Results appear instantly.',
                color: 'bg-brand-100 text-brand-600',
              },
              {
                step: '2',
                title: 'Find',
                desc: 'Select the right lecturer from search results. View their profile with all available contact details.',
                color: 'bg-teal-100 text-teal-600',
              },
              {
                step: '3',
                title: 'Connect',
                desc: 'Copy the phone number, start a WhatsApp chat, initiate a call, or send an email directly.',
                color: 'bg-purple-100 text-purple-600',
              },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${color} text-xl font-display font-bold mb-4`}>
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report section */}
      <section className="section bg-surface-muted border-t border-border">
        <div className="container-narrow text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-warning-light text-warning mb-4">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-display font-bold text-text-primary mb-3">
            Found incorrect information?
          </h2>
          <p className="text-text-secondary mb-5">
            Help us keep the directory accurate. If you see an outdated phone number,
            wrong email, or missing lecturer, let us know.
          </p>
          <Link
            to="/report-information"
            className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 transition-colors"
          >
            Report incorrect information
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
