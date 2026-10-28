import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <>
      <title>Page Not Found | UniConnect</title>
      <div className="container-narrow py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-subtle mb-6">
          <SearchX className="h-10 w-10 text-text-muted" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-display font-bold text-text-primary mb-3">Page not found</h1>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          The page you are looking for doesn't exist or may have been moved.
          Try searching the directory instead.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">Go to Home</Link>
          <Link to="/lecturers" className="btn-secondary">Browse Lecturers</Link>
          <Link to="/report-information" className="btn-secondary">Report Information</Link>
        </div>
      </div>
    </>
  )
}
