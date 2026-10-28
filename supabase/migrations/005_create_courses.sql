-- Migration 005: Create courses table

CREATE TABLE courses (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  department_id  UUID REFERENCES departments(id) ON DELETE SET NULL,
  course_code    TEXT NOT NULL CHECK (char_length(course_code) BETWEEN 2 AND 20),
  course_name    TEXT NOT NULL CHECK (char_length(course_name) BETWEEN 2 AND 300),
  description    TEXT,
  academic_year  TEXT,    -- e.g. "2024/2025"
  semester       SMALLINT CHECK (semester BETWEEN 1 AND 3),  -- 1, 2, or 3
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Course codes are unique per institution (case-insensitive enforced via check + index)
  UNIQUE (institution_id, course_code)
);

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_courses_institution ON courses(institution_id) WHERE is_active = TRUE;
CREATE INDEX idx_courses_department ON courses(department_id);
CREATE INDEX idx_courses_code ON courses(course_code);
CREATE INDEX idx_courses_name ON courses(course_name);
