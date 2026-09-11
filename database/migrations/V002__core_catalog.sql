-- V002__core_catalog.sql
-- VeloFind MVP Flyway Migration: Canonical Catalogue Hierarchy

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  website_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bike_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  model_year INT NOT NULL,
  category bike_category NOT NULL,
  propulsion propulsion_type NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_bike_models_brand_slug_year UNIQUE (brand_id, slug, model_year)
);

CREATE TABLE IF NOT EXISTS bike_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES bike_models(id) ON DELETE RESTRICT,
  manufacturer_sku VARCHAR(100),
  gtin VARCHAR(20),
  frame_size VARCHAR(50) NOT NULL,
  frame_type frame_type NOT NULL DEFAULT 'DIAMOND',
  color VARCHAR(100) NOT NULL,
  wheel_size_in NUMERIC(4, 1),
  weight_kg NUMERIC(4, 2),
  battery_wh INT,
  motor_brand VARCHAR(100),
  motor_model VARCHAR(100),
  torque_nm INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS variant_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES bike_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Catalog Indexes
CREATE INDEX IF NOT EXISTS idx_bike_models_brand_id ON bike_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_bike_models_category ON bike_models(category);
CREATE INDEX IF NOT EXISTS idx_bike_models_propulsion ON bike_models(propulsion);
CREATE INDEX IF NOT EXISTS idx_bike_variants_model_id ON bike_variants(model_id);
CREATE INDEX IF NOT EXISTS idx_bike_variants_gtin ON bike_variants(gtin) WHERE gtin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bike_variants_sku ON bike_variants(manufacturer_sku) WHERE manufacturer_sku IS NOT NULL;
