-- Migration 009: Create audit log table

CREATE TYPE audit_action AS ENUM (
  'lecturer_created',
  'lecturer_updated',
  'lecturer_published',
  'lecturer_unpublished',
  'lecturer_archived',
  'contact_created',
  'contact_updated',
  'contact_published',
  'contact_hidden',
  'contact_verified',
  'contact_marked_outdated',
  'course_created',
  'course_updated',
  'assignment_created',
  'assignment_removed',
  'department_created',
  'department_updated',
  'report_reviewed',
  'admin_created',
  'admin_deactivated',
  'bulk_import_started',
  'bulk_import_completed'
);

CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      audit_action NOT NULL,
  entity_type TEXT NOT NULL,          -- e.g. 'lecturer', 'contact', 'course'
  entity_id   UUID,                   -- ID of the affected record
  -- Selectively stored change metadata (no passwords, no secrets)
  metadata    JSONB DEFAULT '{}',
  ip_hash     TEXT,                   -- Hashed, not raw IP
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No updated_at — audit log is append-only
);

-- Indexes for audit queries
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- Prevent any UPDATE or DELETE on audit_log via a trigger
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log records cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_immutable
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
