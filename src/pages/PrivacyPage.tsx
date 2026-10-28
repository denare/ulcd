export default function PrivacyPage() {
  return (
    <>
      <title>Privacy Notice | UniConnect</title>
      <div className="container-narrow py-10 md:py-16">
        <h1 className="text-4xl font-display font-bold text-text-primary mb-2">Privacy Notice</h1>
        <p className="text-text-muted text-sm mb-10">Last updated: October 2026</p>

        <div className="space-y-8 text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">1. What information we publish</h2>
            <p>
              UniConnect publishes lecturer contact information for the University of Dodoma (UDOM).
              This includes: names, academic titles, department affiliations, office locations, office
              hours, and contact details (phone numbers and email addresses) where these have been
              authorized for public display.
            </p>
            <p className="mt-2">
              Only contact details that have been verified and explicitly marked as public by an
              authorized administrator are shown. Private or unverified contacts are never displayed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">2. How contact data is sourced</h2>
            <p>
              Contact information is entered or imported by authorized directory administrators. Sources
              may include official institutional directories, departmental records, or information
              provided directly by lecturers. Each entry is reviewed before publication.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">3. Correction reports</h2>
            <p>
              When you submit a correction report, we collect: the type of issue, a description of the
              problem, and optionally your email address. Your email is used only to follow up on your
              report and is never displayed publicly or shared with third parties.
            </p>
            <p className="mt-2">
              To limit abuse, we track report submissions using a privacy-preserving hash of your
              browser fingerprint. This hash cannot be used to identify you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">4. Data retention</h2>
            <p>
              Lecturer records remain in the directory until removed by an administrator. Correction
              reports are retained for administrative purposes and not shown to the public. We do not
              collect persistent cookies, tracking identifiers, or analytics data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">5. Third-party services</h2>
            <p>
              UniConnect uses Supabase for database hosting. Data is stored in a PostgreSQL database
              with row-level security enforcing strict access controls. No personal data is shared
              with advertising or marketing services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">6. Requesting removal</h2>
            <p>
              If you are a lecturer and believe your contact information is published without your
              consent, please submit a correction report using the "Privacy concern" option on your
              profile page. An administrator will review and remove the information if appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">7. Contact</h2>
            <p>
              For privacy-related enquiries, submit a correction report through the directory and
              select "Privacy concern" as the report type. We aim to respond within 5 business days.
            </p>
          </section>

          <div className="border border-border rounded-lg p-4 bg-surface-muted text-sm text-text-muted">
            UniConnect is not an official University of Dodoma service. This privacy notice applies
            to the UniConnect directory only.
          </div>
        </div>
      </div>
    </>
  )
}
