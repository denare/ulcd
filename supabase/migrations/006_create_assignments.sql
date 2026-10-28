-- Migration 006: Create lecturer-course assignments table

CREATE TYPE assignment_type AS ENUM (
  'lecturer',       -- Primary lecturer
  'co_lecturer',    -- Co-teaches
  'tutorial',       -- Tutorial/lab instructor
  'coordinator'     -- Course coordinator
);

CREATE TABLE lecturer_course_assignments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lecturer_id     UUID NOT NULL REFERENCES lecturers(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  academic_year   TEXT,
  semester        SMALLINT CHECK (semester BETWEEN 1 AND 3),
  assignment_type assignment_type NOT NULL DEFAULT 'lecturer',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevent duplicate assignments for same lecturer + course + year + semester + type
  UNIQUE (lecturer_id, course_id, academic_year, semester, assignment_type)
);

CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON lecturer_course_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_assignments_lecturer ON lecturer_course_assignments(lecturer_id) WHERE is_active = TRUE;
CREATE INDEX idx_assignments_course ON lecturer_course_assignments(course_id) WHERE is_active = TRUE;
