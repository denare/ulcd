-- Migration 001: Create institutions table
-- ULCD - UDOM Lecturers Contact Directory

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE institutions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  country_code CHAR(2) NOT NULL DEFAULT 'TZ',  -- ISO 3166-1 alpha-2
  website_url TEXT,
  logo_url    TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert UDOM as the initial institution
INSERT INTO institutions (name, slug, country_code, website_url)
VALUES (
  'University of Dodoma',
  'udom',
  'TZ',
  'https://www.udom.ac.tz'
);
