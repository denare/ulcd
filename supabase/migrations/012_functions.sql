-- Migration 012: Database functions and RPC endpoints
-- SECURITY DEFINER functions for safe public access

-- ============================================================
-- SEARCH LECTURERS (public RPC)
-- Returns only published lecturers with public contact summary
-- ============================================================
CREATE OR REPLACE FUNCTION search_lecturers(
  search_query    TEXT DEFAULT NULL,
  dept_filter     UUID DEFAULT NULL,
  school_filter   UUID DEFAULT NULL,
  inst_filter     UUID DEFAULT NULL,
  page_size       INT DEFAULT 20,
  page_offset     INT DEFAULT 0
)
RETURNS TABLE (
  id                  UUID,
  display_name        TEXT,
  title               TEXT,
  department_id       UUID,
  department_name     TEXT,
  school_id           UUID,
  school_name         TEXT,
  institution_id      UUID,
  institution_name    TEXT,
  verification_status TEXT,
  last_verified_at    TIMESTAMPTZ,
  has_phone           BOOLEAN,
  has_email           BOOLEAN,
  has_office_phone    BOOLEAN,
  course_codes        TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.display_name,
    l.title::TEXT,
    d.id AS department_id,
    d.name AS department_name,
    s.id AS school_id,
    s.name AS school_name,
    i.id AS institution_id,
    i.name AS institution_name,
    l.verification_status::TEXT,
    l.last_verified_at,
    -- Has public phone?
    EXISTS (
      SELECT 1 FROM lecturer_contacts lc
      WHERE lc.lecturer_id = l.id
        AND lc.contact_type = 'mobile_phone'
        AND lc.is_public = TRUE
        AND lc.verification_status = 'verified'
    ) AS has_phone,
    -- Has public email?
    EXISTS (
      SELECT 1 FROM lecturer_contacts lc
      WHERE lc.lecturer_id = l.id
        AND lc.contact_type = 'email'
        AND lc.is_public = TRUE
        AND lc.verification_status = 'verified'
    ) AS has_email,
    -- Has public office phone?
    EXISTS (
      SELECT 1 FROM lecturer_contacts lc
      WHERE lc.lecturer_id = l.id
        AND lc.contact_type = 'office_phone'
        AND lc.is_public = TRUE
        AND lc.verification_status = 'verified'
    ) AS has_office_phone,
    -- Course codes (active assignments)
    ARRAY(
      SELECT c.course_code
      FROM lecturer_course_assignments lca
      JOIN courses c ON c.id = lca.course_id
      WHERE lca.lecturer_id = l.id AND lca.is_active = TRUE
      ORDER BY c.course_code
      LIMIT 5
    ) AS course_codes
  FROM lecturers l
  LEFT JOIN departments d ON d.id = l.department_id
  LEFT JOIN schools s ON s.id = d.school_id
  LEFT JOIN institutions i ON i.id = l.institution_id
  WHERE
    l.publication_status = 'published'
    -- Institution filter
    AND (inst_filter IS NULL OR l.institution_id = inst_filter)
    -- Department filter
    AND (dept_filter IS NULL OR l.department_id = dept_filter)
    -- School filter
    AND (school_filter IS NULL OR d.school_id = school_filter)
    -- Text search across name, department, course code
    AND (
      search_query IS NULL
      OR search_query = ''
      OR l.display_name ILIKE '%' || search_query || '%'
      OR l.first_name ILIKE '%' || search_query || '%'
      OR l.last_name ILIKE '%' || search_query || '%'
      OR d.name ILIKE '%' || search_query || '%'
      OR s.name ILIKE '%' || search_query || '%'
      OR EXISTS (
        SELECT 1 FROM lecturer_alt_names lan
        WHERE lan.lecturer_id = l.id
          AND lan.alt_name ILIKE '%' || search_query || '%'
      )
      OR EXISTS (
        SELECT 1 FROM lecturer_course_assignments lca
        JOIN courses c ON c.id = lca.course_id
        WHERE lca.lecturer_id = l.id
          AND lca.is_active = TRUE
          AND (
            c.course_code ILIKE '%' || search_query || '%'
            OR c.course_name ILIKE '%' || search_query || '%'
          )
      )
    )
  ORDER BY l.display_name ASC
  LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- Grant execute to anonymous users (they can search, results filtered by RLS logic in function)
GRANT EXECUTE ON FUNCTION search_lecturers TO anon;
GRANT EXECUTE ON FUNCTION search_lecturers TO authenticated;

-- ============================================================
-- GET PUBLIC LECTURER PROFILE (public RPC)
-- Returns only fields safe for public display
-- ============================================================
CREATE OR REPLACE FUNCTION get_public_lecturer(lecturer_uuid UUID)
RETURNS TABLE (
  id                  UUID,
  display_name        TEXT,
  title               TEXT,
  first_name          TEXT,
  last_name           TEXT,
  department_id       UUID,
  department_name     TEXT,
  school_id           UUID,
  school_name         TEXT,
  institution_id      UUID,
  institution_name    TEXT,
  office_location     TEXT,
  office_hours        TEXT,
  biography           TEXT,
  verification_status TEXT,
  last_verified_at    TIMESTAMPTZ,
  contacts            JSONB,
  courses             JSONB
) AS $$
DECLARE
  v_lecturer lecturers%ROWTYPE;
BEGIN
  -- Verify the lecturer is published
  SELECT * INTO v_lecturer FROM lecturers
  WHERE id = lecturer_uuid AND publication_status = 'published';

  IF NOT FOUND THEN
    RETURN; -- Empty result set
  END IF;

  RETURN QUERY
  SELECT
    l.id,
    l.display_name,
    l.title::TEXT,
    l.first_name,
    l.last_name,
    d.id AS department_id,
    d.name AS department_name,
    s.id AS school_id,
    s.name AS school_name,
    i.id AS institution_id,
    i.name AS institution_name,
    l.office_location,
    l.office_hours,
    l.biography,
    l.verification_status::TEXT,
    l.last_verified_at,
    -- ONLY public + verified contacts
    (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', lc.id,
        'contact_type', lc.contact_type,
        'display_value', COALESCE(lc.display_value, lc.contact_value),
        'verified_at', lc.verified_at
      ) ORDER BY lc.contact_type), '[]'::jsonb)
      FROM lecturer_contacts lc
      WHERE lc.lecturer_id = l.id
        AND lc.is_public = TRUE
        AND lc.verification_status = 'verified'
    ) AS contacts,
    -- Active course assignments
    (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', c.id,
        'course_code', c.course_code,
        'course_name', c.course_name,
        'academic_year', lca.academic_year,
        'semester', lca.semester,
        'assignment_type', lca.assignment_type
      ) ORDER BY c.course_code), '[]'::jsonb)
      FROM lecturer_course_assignments lca
      JOIN courses c ON c.id = lca.course_id
      WHERE lca.lecturer_id = l.id AND lca.is_active = TRUE
    ) AS courses
  FROM lecturers l
  LEFT JOIN departments d ON d.id = l.department_id
  LEFT JOIN schools s ON s.id = d.school_id
  LEFT JOIN institutions i ON i.id = l.institution_id
  WHERE l.id = lecturer_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION get_public_lecturer TO anon;
GRANT EXECUTE ON FUNCTION get_public_lecturer TO authenticated;

-- ============================================================
-- SUBMIT CORRECTION REPORT (public RPC — SECURITY DEFINER)
-- Accepts anonymous reports safely, with basic rate limiting
-- ============================================================
CREATE OR REPLACE FUNCTION submit_correction_report(
  p_lecturer_id    UUID,
  p_contact_id     UUID DEFAULT NULL,
  p_report_type    TEXT DEFAULT 'other',
  p_description    TEXT DEFAULT '',
  p_reporter_email TEXT DEFAULT NULL,
  p_submitter_hash TEXT DEFAULT NULL  -- Hashed fingerprint passed from edge function
)
RETURNS UUID AS $$
DECLARE
  v_report_id UUID;
  v_count     INT;
BEGIN
  IF p_submitter_hash IS NULL OR char_length(TRIM(p_submitter_hash)) < 32 THEN
    RAISE EXCEPTION 'A trusted submission fingerprint is required';
  END IF;

  -- Validate lecturer exists and is published
  IF NOT EXISTS (
    SELECT 1 FROM lecturers
    WHERE id = p_lecturer_id AND publication_status = 'published'
  ) THEN
    RAISE EXCEPTION 'Lecturer not found';
  END IF;

  IF p_contact_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM lecturer_contacts
    WHERE id = p_contact_id AND lecturer_id = p_lecturer_id
  ) THEN
    RAISE EXCEPTION 'Contact not found';
  END IF;

  -- Basic rate limit: max 3 reports from same hash in last 24 hours
  PERFORM pg_advisory_xact_lock(hashtextextended(p_submitter_hash, 0));
  SELECT COUNT(*) INTO v_count
  FROM correction_reports
  WHERE submitter_hash = p_submitter_hash
    AND created_at > NOW() - INTERVAL '24 hours';

  IF v_count >= 3 THEN
    RAISE EXCEPTION 'Too many reports submitted. Please try again later.';
  END IF;

  -- Validate description length
  IF char_length(TRIM(p_description)) < 10 THEN
    RAISE EXCEPTION 'Description must be at least 10 characters';
  END IF;

  INSERT INTO correction_reports (
    lecturer_id, contact_id, report_type, description,
    reporter_email, submitter_hash, status
  ) VALUES (
    p_lecturer_id,
    p_contact_id,
    p_report_type::report_type,
    TRIM(p_description),
    LOWER(TRIM(p_reporter_email)),
    p_submitter_hash,
    'pending_review'
  )
  RETURNING id INTO v_report_id;

  RETURN v_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION submit_correction_report(UUID, UUID, TEXT, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_correction_report(UUID, UUID, TEXT, TEXT, TEXT, TEXT)
  TO service_role;

-- ============================================================
-- LOG AUDIT EVENT (internal, called by admin operations)
-- ============================================================
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action      audit_action,
  p_entity_type TEXT,
  p_entity_id   UUID DEFAULT NULL,
  p_metadata    JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;

-- ============================================================
-- ADMIN STATS (authenticated admin only)
-- ============================================================
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSONB AS $$
DECLARE
  v_institution_id UUID;
  v_is_platform_admin BOOLEAN;
BEGIN
  -- Verify caller is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT institution_id INTO v_institution_id
  FROM admin_profiles
  WHERE user_id = auth.uid() AND is_active = TRUE;
  v_is_platform_admin := is_platform_admin();

  RETURN jsonb_build_object(
    'total_lecturers', (
      SELECT COUNT(*) FROM lecturers
      WHERE publication_status != 'archived'
        AND (v_is_platform_admin OR institution_id = v_institution_id)
    ),
    'published_lecturers', (
      SELECT COUNT(*) FROM lecturers
      WHERE publication_status = 'published'
        AND (v_is_platform_admin OR institution_id = v_institution_id)
    ),
    'verified_contacts', (
      SELECT COUNT(*) FROM lecturer_contacts lc
      WHERE lc.verification_status = 'verified'
        AND EXISTS (
          SELECT 1 FROM lecturers l
          WHERE l.id = lc.lecturer_id
            AND (v_is_platform_admin OR l.institution_id = v_institution_id)
        )
    ),
    'public_contacts', (
      SELECT COUNT(*) FROM lecturer_contacts lc
      WHERE lc.is_public = TRUE AND lc.verification_status = 'verified'
        AND EXISTS (
          SELECT 1 FROM lecturers l
          WHERE l.id = lc.lecturer_id
            AND (v_is_platform_admin OR l.institution_id = v_institution_id)
        )
    ),
    'total_departments', (
      SELECT COUNT(*) FROM departments
      WHERE is_active = TRUE
        AND (v_is_platform_admin OR institution_id = v_institution_id)
    ),
    'total_courses', (
      SELECT COUNT(*) FROM courses
      WHERE is_active = TRUE
        AND (v_is_platform_admin OR institution_id = v_institution_id)
    ),
    'pending_reports', (
      SELECT COUNT(*) FROM correction_reports r
      WHERE r.status = 'pending_review'
        AND EXISTS (
          SELECT 1 FROM lecturers l
          WHERE l.id = r.lecturer_id
            AND (v_is_platform_admin OR l.institution_id = v_institution_id)
        )
    ),
    'recent_updates', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'display_name', display_name, 'updated_at', updated_at
      ))
      FROM (
        SELECT id, display_name, updated_at
        FROM lecturers
        WHERE v_is_platform_admin OR institution_id = v_institution_id
        ORDER BY updated_at DESC LIMIT 5
      ) recent
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION get_admin_stats TO authenticated;
