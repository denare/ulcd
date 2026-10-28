-- Migration 003: Create lecturers table

CREATE TYPE publication_status AS ENUM (
  'draft',
  'published',
  'unpublished',
  'archived'
);

CREATE TYPE verification_status AS ENUM (
  'unverified',
  'pending_review',
  'verified',
  'outdated',
  'rejected'
);

CREATE TYPE academic_title AS ENUM (
  'Prof.',
  'Assoc. Prof.',
  'Dr.',
  'Mr.',
  'Mrs.',
  'Ms.',
  'Eng.',
  'Rev.',
  'Other'
);

CREATE TABLE lecturers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id      UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  department_id       UUID REFERENCES departments(id) ON DELETE SET NULL,
  title               academic_title,
  first_name          TEXT NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 100),
  middle_name         TEXT CHECK (middle_name IS NULL OR char_length(middle_name) BETWEEN 1 AND 100),
  last_name           TEXT NOT NULL CHECK (char_length(last_name) BETWEEN 1 AND 100),
  -- display_name can be set explicitly or computed from first/last
  display_name        TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 250),
  office_location     TEXT,
  office_hours        TEXT,
  biography           TEXT,
  profile_image_url   TEXT,
  publication_status  publication_status NOT NULL DEFAULT 'draft',
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  last_verified_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER lecturers_updated_at
  BEFORE UPDATE ON lecturers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Alternative name spellings for search
CREATE TABLE lecturer_alt_names (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lecturer_id UUID NOT NULL REFERENCES lecturers(id) ON DELETE CASCADE,
  alt_name    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for public search
CREATE INDEX idx_lecturers_institution ON lecturers(institution_id);
CREATE INDEX idx_lecturers_department ON lecturers(department_id);
CREATE INDEX idx_lecturers_publication ON lecturers(publication_status);
CREATE INDEX idx_lecturers_display_name ON lecturers(display_name);
CREATE INDEX idx_lecturers_last_name ON lecturers(last_name);
