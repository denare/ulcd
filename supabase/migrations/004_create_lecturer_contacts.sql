-- Migration 004: Create lecturer contacts table

CREATE TYPE contact_type AS ENUM (
  'mobile_phone',
  'office_phone',
  'email',
  'other'
);

CREATE TYPE consent_status AS ENUM (
  'unknown',
  'consented',
  'not_consented',
  'withdrawn'
);

CREATE TYPE contact_source_type AS ENUM (
  'self_submitted',
  'admin_added',
  'official_directory',
  'imported_csv',
  'other'
);

CREATE TABLE lecturer_contacts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lecturer_id         UUID NOT NULL REFERENCES lecturers(id) ON DELETE CASCADE,
  contact_type        contact_type NOT NULL,
  -- Raw stored value (phone: international format or as entered; email: lowercase)
  contact_value       TEXT NOT NULL CHECK (char_length(contact_value) BETWEEN 1 AND 500),
  -- Optional display value (formatted for UI, e.g. "+255 712 345 678")
  display_value       TEXT,
  is_public           BOOLEAN NOT NULL DEFAULT FALSE,
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  verified_at         TIMESTAMPTZ,
  verified_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source_type         contact_source_type DEFAULT 'admin_added',
  consent_status      consent_status NOT NULL DEFAULT 'unknown',
  notes               TEXT,  -- Internal admin notes, never returned to public
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER lecturer_contacts_updated_at
  BEFORE UPDATE ON lecturer_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_contacts_lecturer ON lecturer_contacts(lecturer_id);
CREATE INDEX idx_contacts_public ON lecturer_contacts(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_contacts_type ON lecturer_contacts(contact_type);
CREATE INDEX idx_contacts_verification ON lecturer_contacts(verification_status);
