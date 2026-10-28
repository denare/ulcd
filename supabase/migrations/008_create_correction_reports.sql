-- Migration 008: Create correction reports table

CREATE TYPE report_type AS ENUM (
  'incorrect_phone',
  'incorrect_email',
  'incorrect_office_phone',
  'outdated_information',
  'missing_lecturer',
  'duplicate_profile',
  'privacy_concern',
  'other'
);

CREATE TYPE report_status AS ENUM (
  'pending_review',
  'under_review',
  'resolved_corrected',
  'resolved_verified',
  'resolved_hidden',
  'rejected',
  'spam'
);

CREATE TABLE correction_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lecturer_id     UUID REFERENCES lecturers(id) ON DELETE SET NULL,
  contact_id      UUID REFERENCES lecturer_contacts(id) ON DELETE SET NULL,
  report_type     report_type NOT NULL,
  description     TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 2000),
  reporter_email  TEXT CHECK (reporter_email IS NULL OR reporter_email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'),
  status          report_status NOT NULL DEFAULT 'pending_review',
  reviewed_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  admin_notes     TEXT,   -- Internal notes, never returned to public
  -- Soft rate-limit: store submitter fingerprint (hashed IP/UA, not PII)
  submitter_hash  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER correction_reports_updated_at
  BEFORE UPDATE ON correction_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_reports_status ON correction_reports(status);
CREATE INDEX idx_reports_lecturer ON correction_reports(lecturer_id);
CREATE INDEX idx_reports_created ON correction_reports(created_at DESC);
