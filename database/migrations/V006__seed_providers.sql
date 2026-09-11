-- V006__seed_providers.sql
-- VeloFind MVP Flyway Migration: Leasing Providers, Participation & Seeds

CREATE TABLE IF NOT EXISTS leasing_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  website_url TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  default_fee_percent NUMERIC(4, 2) NOT NULL DEFAULT 5.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dealer_provider_participation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES leasing_providers(id) ON DELETE CASCADE,
  status leasing_eligibility_status NOT NULL DEFAULT 'CONFIRMED',
  contract_reference VARCHAR(100),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_dealer_provider UNIQUE (dealer_id, provider_id)
);

CREATE TABLE IF NOT EXISTS offer_provider_eligibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES leasing_providers(id) ON DELETE CASCADE,
  status leasing_eligibility_status NOT NULL DEFAULT 'CONFIRMED',
  evidence_reason TEXT NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_offer_provider UNIQUE (offer_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_dealer_provider_dealer ON dealer_provider_participation(dealer_id);
CREATE INDEX IF NOT EXISTS idx_offer_provider_offer ON offer_provider_eligibility(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_provider_provider ON offer_provider_eligibility(provider_id);

-- Seed authoritative German bike leasing providers
INSERT INTO leasing_providers (name, slug, website_url, description, default_fee_percent)
VALUES
  ('JobRad', 'jobrad', 'https://www.jobrad.org', 'Deutschlands bekanntester Dienstrad-Pionier mit über 60.000 Partnerarbeitgebern.', 6.00),
  ('Bikeleasing-Service', 'bikeleasing', 'https://www.bikeleasing.de', 'Großer Dienstrad-Anbieter für KMU, Großkonzerne und den öffentlichen Dienst.', 5.50),
  ('BusinessBike', 'businessbike', 'https://www.businessbike.de', 'Einfaches Leasingportal mit digitaler Freigabe und Vollkaskoschutz.', 5.00),
  ('Deutsche Dienstrad', 'deutsche-dienstrad', 'https://www.deutsche-dienstrad.de', 'Traditionsreiches Familienunternehmen mit automatisierter Plattform.', 5.00),
  ('Eurorad', 'eurorad', 'https://www.eurorad.de', 'ZEG-naher Leasinganbieter mit hoher Händlerabdeckung.', 5.25),
  ('Lease a Bike', 'lease-a-bike', 'https://www.lease-a-bike.de', 'Tochtergesellschaft der Pon Bike Gruppe mit internationalem Netzwerk.', 5.00)
ON CONFLICT (slug) DO NOTHING;
