-- V001__extensions_and_types.sql
-- VeloFind MVP Flyway Migration: Extensions and Core Enums

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Identity and Access Roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'DEALER_OWNER',
    'DEALER_EDITOR',
    'DEALER_VIEWER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Bike Categories
DO $$ BEGIN
  CREATE TYPE bike_category AS ENUM (
    'E_BIKE',
    'GRAVEL',
    'TREKKING',
    'MTB',
    'CITY',
    'CARGO',
    'ROAD'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Propulsion Types
DO $$ BEGIN
  CREATE TYPE propulsion_type AS ENUM (
    'PEDELEC',
    'S_PEDELEC',
    'MUSCULAR'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Frame Types
DO $$ BEGIN
  CREATE TYPE frame_type AS ENUM (
    'DIAMOND',
    'STEP_THROUGH',
    'TRAPEZE',
    'WAVE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Offer Conditions
DO $$ BEGIN
  CREATE TYPE offer_condition AS ENUM (
    'NEW',
    'REFURBISHED',
    'EX_DISPLAY'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Availability
DO $$ BEGIN
  CREATE TYPE availability_status AS ENUM (
    'IN_STOCK',
    'AVAILABLE_SHORT_TERM',
    'ON_DEMAND',
    'OUT_OF_STOCK'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Leasing Eligibility Multi-tier Evidence Status
DO $$ BEGIN
  CREATE TYPE leasing_eligibility_status AS ENUM (
    'CONFIRMED',
    'LIKELY',
    'REQUIRES_CONFIRMATION',
    'NOT_ELIGIBLE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Lead Workflow Statuses
DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM (
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'WON',
    'LOST',
    'SPAM'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Import Execution Statuses
DO $$ BEGIN
  CREATE TYPE import_status AS ENUM (
    'RUNNING',
    'COMPLETED',
    'FAILED',
    'PARTIAL'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
