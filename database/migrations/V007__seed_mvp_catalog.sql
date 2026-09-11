-- V007__seed_mvp_catalog.sql
-- VeloFind MVP Flyway Migration: Initial Brands, Dealers, Locations & Canonical Inventory

-- 1. Brands
INSERT INTO brands (id, name, slug, website_url, is_active)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'CUBE', 'cube', 'https://www.cube.eu', true),
  ('a0000000-0000-0000-0000-000000000002', 'Specialized', 'specialized', 'https://www.specialized.com', true),
  ('a0000000-0000-0000-0000-000000000003', 'Riese & Müller', 'riese-mueller', 'https://www.r-m.de', true),
  ('a0000000-0000-0000-0000-000000000004', 'Canyon', 'canyon', 'https://www.canyon.com', true),
  ('a0000000-0000-0000-0000-000000000005', 'Kalkhoff', 'kalkhoff', 'https://www.kalkhoff-bikes.com', true),
  ('a0000000-0000-0000-0000-000000000006', 'Focus', 'focus', 'https://www.focus-bikes.com', true),
  ('a0000000-0000-0000-0000-000000000007', 'Gazelle', 'gazelle', 'https://www.gazelle.de', true)
ON CONFLICT (slug) DO UPDATE SET is_active = true;

-- 2. Dealers
INSERT INTO dealers (id, name, slug, website_url, phone, email, is_verified, is_active)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Zweirad-Center Stadler Berlin', 'zweirad-stadler-berlin', 'https://shop.zweirad-stadler.de', '+49 30 4030400', 'berlin@zweirad-stadler.de', true, true),
  ('d0000000-0000-0000-0000-000000000002', 'Bikestore München Schwabing', 'bikestore-muenchen', 'https://www.bikestore-muenchen.de', '+49 89 3899980', 'kontakt@bikestore-muenchen.de', true, true),
  ('d0000000-0000-0000-0000-000000000003', 'Fahrrad-XXL Feld Sankt Augustin', 'fahrrad-xxl-feld', 'https://www.fahrrad-xxl.de', '+49 2241 87800', 'service@fahrrad-xxl-feld.de', true, true),
  ('d0000000-0000-0000-0000-000000000004', 'ROSE Bikes Bocholt', 'rose-bikes-bocholt', 'https://www.rosebikes.de', '+49 2871 275555', 'biketown@rosebikes.com', true, true)
ON CONFLICT (slug) DO UPDATE SET is_verified = true, is_active = true;

-- 3. Dealer Locations with PostGIS Geodesic Coordinates
INSERT INTO dealer_locations (id, dealer_id, name, address_line1, postal_code, city, country_code, latitude, longitude, coordinates, phone, email)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Filiale Charlottenburg', 'Königin-Elisabeth-Straße 9-23', '14059', 'Berlin', 'DE', 52.5112, 13.2845, ST_SetSRID(ST_MakePoint(13.2845, 52.5112), 4326)::geography, '+49 30 4030400', 'charlottenburg@zweirad-stadler.de'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Filiale Prenzlauer Berg', 'August-Lindemann-Straße 9', '10247', 'Berlin', 'DE', 52.5367, 13.4342, ST_SetSRID(ST_MakePoint(13.4342, 52.5367), 4326)::geography, '+49 30 4208200', 'prenzlauer@zweirad-stadler.de'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'Flagship Store Schwabing', 'Hohenzollernstraße 12', '80801', 'München', 'DE', 48.1633, 11.5878, ST_SetSRID(ST_MakePoint(11.5878, 48.1633), 4326)::geography, '+49 89 3899980', 'schwabing@bikestore-muenchen.de'),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000003', 'Mega Store Sankt Augustin', 'Einsteinstraße 35', '53757', 'Sankt Augustin', 'DE', 50.7745, 7.1856, ST_SetSRID(ST_MakePoint(7.1856, 50.7745), 4326)::geography, '+49 2241 87800', 'info@fahrrad-xxl-feld.de'),
  ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000004', 'ROSE BIKETOWN Bocholt', 'Werther Straße 443', '46395', 'Bocholt', 'DE', 51.8385, 6.6131, ST_SetSRID(ST_MakePoint(6.6131, 51.8385), 4326)::geography, '+49 2871 275555', 'biketown@rosebikes.com')
ON CONFLICT (id) DO NOTHING;

-- 4. Data Sources for Dealers
INSERT INTO data_sources (id, dealer_id, name, source_type, is_active)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Stadler Berlin CSV Feed', 'CSV', true),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'Bikestore München CSV Feed', 'CSV', true),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'Fahrrad XXL Feld CSV Feed', 'CSV', true),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'Rose Bikes CSV Feed', 'CSV', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Dealer Leasing Provider Participation
DO $$
DECLARE
  v_jobrad UUID;
  v_bikeleasing UUID;
  v_businessbike UUID;
  v_deutsche_dienstrad UUID;
  v_eurorad UUID;
  v_lease_a_bike UUID;
BEGIN
  SELECT id INTO v_jobrad FROM leasing_providers WHERE slug = 'jobrad';
  SELECT id INTO v_bikeleasing FROM leasing_providers WHERE slug = 'bikeleasing';
  SELECT id INTO v_businessbike FROM leasing_providers WHERE slug = 'businessbike';
  SELECT id INTO v_deutsche_dienstrad FROM leasing_providers WHERE slug = 'deutsche-dienstrad';
  SELECT id INTO v_eurorad FROM leasing_providers WHERE slug = 'eurorad';
  SELECT id INTO v_lease_a_bike FROM leasing_providers WHERE slug = 'lease-a-bike';

  -- Stadler participations
  IF v_jobrad IS NOT NULL THEN
    INSERT INTO dealer_provider_participation (dealer_id, provider_id, status, contract_reference)
    VALUES ('d0000000-0000-0000-0000-000000000001', v_jobrad, 'CONFIRMED', 'STADLER-JR-2024')
    ON CONFLICT (dealer_id, provider_id) DO UPDATE SET status = 'CONFIRMED';
  END IF;

  IF v_bikeleasing IS NOT NULL THEN
    INSERT INTO dealer_provider_participation (dealer_id, provider_id, status, contract_reference)
    VALUES ('d0000000-0000-0000-0000-000000000001', v_bikeleasing, 'CONFIRMED', 'STADLER-BL-884')
    ON CONFLICT (dealer_id, provider_id) DO UPDATE SET status = 'CONFIRMED';
  END IF;

  IF v_businessbike IS NOT NULL THEN
    INSERT INTO dealer_provider_participation (dealer_id, provider_id, status, contract_reference)
    VALUES ('d0000000-0000-0000-0000-000000000001', v_businessbike, 'CONFIRMED', 'BB-STADLER-DE')
    ON CONFLICT (dealer_id, provider_id) DO UPDATE SET status = 'CONFIRMED';
  END IF;

  -- Bikestore München participations
  IF v_jobrad IS NOT NULL THEN
    INSERT INTO dealer_provider_participation (dealer_id, provider_id, status, contract_reference)
    VALUES ('d0000000-0000-0000-0000-000000000002', v_jobrad, 'CONFIRMED', 'MUC-BIKE-JR')
    ON CONFLICT (dealer_id, provider_id) DO UPDATE SET status = 'CONFIRMED';
  END IF;

  IF v_lease_a_bike IS NOT NULL THEN
    INSERT INTO dealer_provider_participation (dealer_id, provider_id, status, contract_reference)
    VALUES ('d0000000-0000-0000-0000-000000000002', v_lease_a_bike, 'CONFIRMED', 'LAB-MUC-77')
    ON CONFLICT (dealer_id, provider_id) DO UPDATE SET status = 'CONFIRMED';
  END IF;

  -- Fahrrad XXL participations
  IF v_jobrad IS NOT NULL THEN
    INSERT INTO dealer_provider_participation (dealer_id, provider_id, status, contract_reference)
    VALUES ('d0000000-0000-0000-0000-000000000003', v_jobrad, 'CONFIRMED', 'XXL-JOBRAD-AG')
    ON CONFLICT (dealer_id, provider_id) DO UPDATE SET status = 'CONFIRMED';
  END IF;

  -- Rose Bikes participations
  IF v_jobrad IS NOT NULL THEN
    INSERT INTO dealer_provider_participation (dealer_id, provider_id, status, contract_reference)
    VALUES ('d0000000-0000-0000-0000-000000000004', v_jobrad, 'CONFIRMED', 'ROSE-JR-DIRECT')
    ON CONFLICT (dealer_id, provider_id) DO UPDATE SET status = 'CONFIRMED';
  END IF;
END $$;
