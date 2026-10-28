-- Migration 011: Indexes for performance
-- Full-text search, trigram indexes, and covering indexes

-- Enable pg_trgm for fuzzy/partial text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- LECTURER NAME SEARCH (trigram)
-- ============================================================
CREATE INDEX idx_lecturers_display_name_trgm
  ON lecturers USING GIN (display_name gin_trgm_ops);

CREATE INDEX idx_lecturers_first_name_trgm
  ON lecturers USING GIN (first_name gin_trgm_ops);

CREATE INDEX idx_lecturers_last_name_trgm
  ON lecturers USING GIN (last_name gin_trgm_ops);

-- ============================================================
-- COURSE SEARCH (trigram)
-- ============================================================
CREATE INDEX idx_courses_code_trgm
  ON courses USING GIN (course_code gin_trgm_ops);

CREATE INDEX idx_courses_name_trgm
  ON courses USING GIN (course_name gin_trgm_ops);

-- ============================================================
-- DEPARTMENT/SCHOOL SEARCH
-- ============================================================
CREATE INDEX idx_departments_name_trgm
  ON departments USING GIN (name gin_trgm_ops);

CREATE INDEX idx_schools_name_trgm
  ON schools USING GIN (name gin_trgm_ops);

-- ============================================================
-- COMPOSITE INDEXES for common queries
-- ============================================================
-- Published lecturers by department
CREATE INDEX idx_lecturers_dept_published
  ON lecturers(department_id, publication_status)
  WHERE publication_status = 'published';

-- Public contacts lookup
CREATE INDEX idx_contacts_lecturer_public
  ON lecturer_contacts(lecturer_id, is_public, verification_status);

-- Reports pending review
CREATE INDEX idx_reports_pending
  ON correction_reports(status, created_at DESC)
  WHERE status = 'pending_review';
