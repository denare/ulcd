-- Migration 010: Row Level Security Policies
-- Enable RLS on all tables and define access policies

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE institutions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools                ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_alt_names     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses                ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE correction_reports     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log              ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: Check if caller is an active admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO anon, authenticated;

-- Check if caller is platform_admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND role = 'platform_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION is_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_platform_admin() TO anon, authenticated;

-- Check if caller can manage a specific institution
CREATE OR REPLACE FUNCTION can_manage_institution(inst_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND (role = 'platform_admin' OR institution_id = inst_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION can_manage_institution(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION can_manage_institution(UUID) TO anon, authenticated;

-- ============================================================
-- INSTITUTIONS
-- ============================================================
-- Public: anyone can read active institutions
CREATE POLICY "institutions_public_read" ON institutions
  FOR SELECT USING (is_active = TRUE);

-- Admin: platform admins can manage institutions
CREATE POLICY "institutions_admin_all" ON institutions
  FOR ALL USING (is_platform_admin()) WITH CHECK (is_platform_admin());

-- ============================================================
-- SCHOOLS
-- ============================================================
CREATE POLICY "schools_public_read" ON schools
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "schools_admin_all" ON schools
  FOR ALL USING (can_manage_institution(institution_id))
  WITH CHECK (can_manage_institution(institution_id));

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE POLICY "departments_public_read" ON departments
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "departments_admin_all" ON departments
  FOR ALL USING (can_manage_institution(institution_id))
  WITH CHECK (can_manage_institution(institution_id));

-- ============================================================
-- LECTURERS
-- ============================================================
-- Public: only published lecturers are visible
CREATE POLICY "lecturers_public_read" ON lecturers
  FOR SELECT USING (publication_status = 'published');

-- Admin: can read all lecturer records for their institution
CREATE POLICY "lecturers_admin_read" ON lecturers
  FOR SELECT USING (can_manage_institution(institution_id));

-- Admin: can insert/update/delete for their institution
CREATE POLICY "lecturers_admin_write" ON lecturers
  FOR INSERT WITH CHECK (can_manage_institution(institution_id));

CREATE POLICY "lecturers_admin_update" ON lecturers
  FOR UPDATE USING (can_manage_institution(institution_id))
  WITH CHECK (can_manage_institution(institution_id));

CREATE POLICY "lecturers_admin_delete" ON lecturers
  FOR DELETE USING (is_platform_admin());

-- ============================================================
-- LECTURER ALT NAMES
-- ============================================================
-- Public can read alt names for published lecturers only
CREATE POLICY "alt_names_public_read" ON lecturer_alt_names
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.id = lecturer_id AND l.publication_status = 'published'
    )
  );

CREATE POLICY "alt_names_admin_all" ON lecturer_alt_names
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.id = lecturer_id
        AND can_manage_institution(l.institution_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.id = lecturer_id
        AND can_manage_institution(l.institution_id)
    )
  );

-- ============================================================
-- LECTURER CONTACTS
-- ============================================================
-- PUBLIC: ONLY contacts that are explicitly marked is_public = TRUE
-- AND belong to a published lecturer
-- CRITICAL: Private contacts must NEVER appear in public queries
CREATE POLICY "contacts_public_read" ON lecturer_contacts
  FOR SELECT USING (
    is_public = TRUE
    AND verification_status = 'verified'
    AND EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.id = lecturer_id
        AND l.publication_status = 'published'
    )
  );

-- Admin: can read all contacts for their institution's lecturers
CREATE POLICY "contacts_admin_read" ON lecturer_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.id = lecturer_id
        AND can_manage_institution(l.institution_id)
    )
  );

-- Admin: can write contacts for their institution
CREATE POLICY "contacts_admin_write" ON lecturer_contacts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.id = lecturer_id
        AND can_manage_institution(l.institution_id)
    )
  );

CREATE POLICY "contacts_admin_update" ON lecturer_contacts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.id = lecturer_id
        AND can_manage_institution(l.institution_id)
    )
  );

CREATE POLICY "contacts_admin_delete" ON lecturer_contacts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.id = lecturer_id
        AND can_manage_institution(l.institution_id)
    )
  );

-- ============================================================
-- COURSES
-- ============================================================
CREATE POLICY "courses_public_read" ON courses
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "courses_admin_all" ON courses
  FOR ALL USING (can_manage_institution(institution_id))
  WITH CHECK (can_manage_institution(institution_id));

-- ============================================================
-- ASSIGNMENTS
-- ============================================================
CREATE POLICY "assignments_public_read" ON lecturer_course_assignments
  FOR SELECT USING (
    is_active = TRUE
    AND EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.id = lecturer_id AND l.publication_status = 'published'
    )
  );

CREATE POLICY "assignments_admin_all" ON lecturer_course_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.id = lecturer_id
        AND can_manage_institution(l.institution_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM lecturers l
      JOIN courses c ON c.id = course_id
      WHERE l.id = lecturer_id
        AND l.institution_id = c.institution_id
        AND can_manage_institution(l.institution_id)
    )
  );

-- ============================================================
-- ADMIN PROFILES
-- ============================================================
-- Only platform admins can read all profiles; others read their own
CREATE POLICY "admin_profiles_self_read" ON admin_profiles
  FOR SELECT USING (user_id = auth.uid() OR is_platform_admin());

-- Only platform admins can create/modify admin profiles
CREATE POLICY "admin_profiles_platform_write" ON admin_profiles
  FOR INSERT WITH CHECK (is_platform_admin());

CREATE POLICY "admin_profiles_platform_update" ON admin_profiles
  FOR UPDATE USING (is_platform_admin()) WITH CHECK (is_platform_admin());

-- ============================================================
-- CORRECTION REPORTS
-- ============================================================
-- Anonymous: can insert (via SECURITY DEFINER function only — see migration 012)
-- No public SELECT on reports
CREATE POLICY "reports_admin_read" ON correction_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.id = lecturer_id
        AND can_manage_institution(l.institution_id)
    )
  );

CREATE POLICY "reports_admin_update" ON correction_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.id = lecturer_id
        AND can_manage_institution(l.institution_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.id = lecturer_id
        AND can_manage_institution(l.institution_id)
    )
  );

-- ============================================================
-- AUDIT LOG
-- ============================================================
-- Only platform admins can read audit logs
CREATE POLICY "audit_admin_read" ON audit_log
  FOR SELECT USING (is_platform_admin());

-- Inserts only via SECURITY DEFINER function (see migration 012)
-- No direct INSERT policy for regular users
