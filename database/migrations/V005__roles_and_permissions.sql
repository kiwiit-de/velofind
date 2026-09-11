-- V005__roles_and_permissions.sql
-- VeloFind MVP Flyway Migration: Users, Tenancy Memberships & Permissions

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'DEALER_VIEWER',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dealer_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'DEALER_VIEWER',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_dealer_membership UNIQUE (user_id, dealer_id)
);

CREATE INDEX IF NOT EXISTS idx_dealer_memberships_user ON dealer_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_dealer_memberships_dealer ON dealer_memberships(dealer_id);

-- Least Privilege Runtime Role Guidelines:
-- The production setup provisions:
-- 1. velofind_migrator (ALL on SCHEMA public)
-- 2. velofind_runtime (SELECT, INSERT, UPDATE, DELETE on tables; USAGE on SEQUENCES; NO DDL)
