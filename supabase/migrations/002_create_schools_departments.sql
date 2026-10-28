-- Migration 002: Create schools and departments tables

-- Schools / Faculties belong to an institution
CREATE TABLE schools (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institution_id, slug)
);

CREATE TRIGGER schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Departments belong to an institution and optionally a school
CREATE TABLE departments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  school_id      UUID REFERENCES schools(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL,
  description    TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevent duplicate active departments within the same institution + school scope
  UNIQUE (institution_id, school_id, slug)
);

CREATE TRIGGER departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for common lookups
CREATE INDEX idx_schools_institution ON schools(institution_id) WHERE is_active = TRUE;
CREATE INDEX idx_departments_institution ON departments(institution_id) WHERE is_active = TRUE;
CREATE INDEX idx_departments_school ON departments(school_id) WHERE is_active = TRUE;
