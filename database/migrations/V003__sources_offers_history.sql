-- V003__sources_offers_history.sql
-- VeloFind MVP Flyway Migration: Dealers, Sources, Offers, Price History

CREATE TABLE IF NOT EXISTS dealers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  website_url TEXT,
  phone VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dealer_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country_code VARCHAR(2) NOT NULL DEFAULT 'DE',
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  coordinates geography(Point, 4326),
  phone VARCHAR(50),
  email VARCHAR(255),
  opening_hours TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) NOT NULL DEFAULT 'CSV',
  feed_url TEXT,
  fetch_interval_mins INT NOT NULL DEFAULT 1440,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_imported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES bike_variants(id) ON DELETE SET NULL,
  external_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  price_cents INT NOT NULL CHECK (price_cents > 0),
  compare_at_price_cents INT,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  availability availability_status NOT NULL DEFAULT 'IN_STOCK',
  quantity INT NOT NULL DEFAULT 1,
  condition offer_condition NOT NULL DEFAULT 'NEW',
  source_url TEXT NOT NULL,
  image_url TEXT,
  content_hash VARCHAR(64) NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source_updated_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_offers_source_external_id UNIQUE (source_id, external_id)
);

CREATE TABLE IF NOT EXISTS offer_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  old_price_cents INT NOT NULL,
  new_price_cents INT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
  status import_status NOT NULL DEFAULT 'RUNNING',
  total_rows INT NOT NULL DEFAULT 0,
  imported_rows INT NOT NULL DEFAULT 0,
  failed_rows INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMPTZ,
  error_summary TEXT
);

CREATE TABLE IF NOT EXISTS import_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  import_run_id UUID NOT NULL REFERENCES import_runs(id) ON DELETE CASCADE,
  row_number INT NOT NULL,
  raw_payload TEXT NOT NULL,
  error_message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS product_match_candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  proposed_variant_id UUID REFERENCES bike_variants(id) ON DELETE CASCADE,
  confidence_score NUMERIC(5, 4) NOT NULL,
  match_method VARCHAR(50) NOT NULL,
  review_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Spatial and Filtering Indexes
CREATE INDEX IF NOT EXISTS idx_dealer_locations_coordinates ON dealer_locations USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_dealer_locations_postal_code ON dealer_locations(postal_code);
CREATE INDEX IF NOT EXISTS idx_offers_dealer_id ON offers(dealer_id);
CREATE INDEX IF NOT EXISTS idx_offers_variant_id ON offers(variant_id);
CREATE INDEX IF NOT EXISTS idx_offers_price ON offers(price_cents);
CREATE INDEX IF NOT EXISTS idx_offers_availability ON offers(availability);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offer_price_history_offer ON offer_price_history(offer_id, recorded_at DESC);
