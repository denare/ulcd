import { Link } from 'react-router-dom'
import { ExternalLink, Flag } from 'lucide-react'

export default function AboutPage() {
  return (
    <>
      <title>About | UniConnect</title>
      <div className="container-narrow py-10 md:py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold text-text-primary mb-4">About UniConnect</h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            UniConnect is a searchable lecturer contact directory built to help University of Dodoma (UDOM)
            students quickly find their lecturers' contact information.
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">Why UniConnect?</h2>
            <p className="text-text-secondary leading-relaxed">
              Students frequently ask for lecturer contacts in class WhatsApp groups — "Does anyone have
              Dr. John's number?" These requests are repeated, responses arrive late, and useful information
              gets buried. UniConnect solves this by providing a centralized, searchable directory where
              verified lecturer contacts are always a search away.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">How information is verified</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              Lecturer contact information goes through a verification process before it is published:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-text-secondary text-sm">
              <li>A directory administrator enters or imports a lecturer record.</li>
              <li>Contact details are checked against an authoritative source.</li>
              <li>A verified administrator marks the contact as verified.</li>
              <li>The contact is published and becomes visible to students.</li>
              <li>Students can report outdated information for review.</li>
            </ol>
            <p className="text-text-secondary text-sm mt-3">
              Only contacts marked as verified are displayed publicly. Unverified or private contacts
              are never shown to students.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">How to report incorrect information</h2>
            <p className="text-text-secondary leading-relaxed">
              Found an outdated phone number or incorrect email? You can submit a correction report
              directly from any lecturer profile page. Reports are reviewed by administrators and
              corrections are applied after verification.
            </p>
            <Link
              to="/report-information"
              className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 mt-2 transition-colors"
            >
              <Flag className="h-4 w-4" />
              Submit a correction report
            </Link>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">Privacy</h2>
            <p className="text-text-secondary leading-relaxed">
              UniConnect only publishes contact information that has been verified and authorized for
              public display. Lecturer mobile numbers and emails are not published without appropriate
              authorization. Read our full privacy notice:
            </p>
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 mt-1 transition-colors"
            >
              Privacy Notice
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </section>

          <div className="border border-border rounded-lg p-4 bg-surface-muted text-sm text-text-muted">
            <strong className="text-text-secondary">Disclaimer:</strong> UniConnect is not an official
            University of Dodoma service. It is an independent directory tool. Contact information is
            sourced and verified through a community-maintained process. For official information, please
            refer to the{' '}
            <a
              href="https://www.udom.ac.tz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-700"
            >
              UDOM official website
            </a>.
          </div>
        </div>
      </div>
    </>
  )
}
