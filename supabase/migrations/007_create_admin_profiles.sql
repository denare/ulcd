-- Migration 007: Create admin profiles table
-- Links Supabase Auth users to institutional roles

CREATE TYPE admin_role AS ENUM (
  'platform_admin',    -- Full system access
  'institution_admin', -- Manages one institution
  'editor'             -- Can edit but not publish/verify
);

CREATE TABLE admin_profiles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES institutions(id) ON DELETE RESTRICT,
  -- NULL institution_id = platform_admin with access to all institutions
  role           admin_role NOT NULL DEFAULT 'editor',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Platform admins don't need institution_id; institution_admin/editor must have one
  CONSTRAINT institution_required_for_non_platform
    CHECK (role = 'platform_admin' OR institution_id IS NOT NULL)
);

CREATE TRIGGER admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_admin_profiles_user ON admin_profiles(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_admin_profiles_institution ON admin_profiles(institution_id);
