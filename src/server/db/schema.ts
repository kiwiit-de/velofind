/**
 * VeloFind Authoritative Kysely Database Schema Definition
 * Strictly mapped to Flyway SQL migrations V001 through V006.
 */

import type { ColumnType, Generated } from 'kysely';

// Enums from V001
export type UserRole = 'ADMIN' | 'DEALER_OWNER' | 'DEALER_EDITOR' | 'DEALER_VIEWER';
export type BikeCategory = 'E_BIKE' | 'GRAVEL' | 'TREKKING' | 'MTB' | 'CITY' | 'CARGO' | 'ROAD';
export type PropulsionType = 'PEDELEC' | 'S_PEDELEC' | 'MUSCULAR';
export type FrameType = 'DIAMOND' | 'STEP_THROUGH' | 'TRAPEZE' | 'WAVE';
export type OfferCondition = 'NEW' | 'REFURBISHED' | 'EX_DISPLAY';
export type AvailabilityStatus = 'IN_STOCK' | 'AVAILABLE_SHORT_TERM' | 'ON_DEMAND' | 'OUT_OF_STOCK';
export type LeasingEligibilityStatus = 'CONFIRMED' | 'LIKELY' | 'REQUIRES_CONFIRMATION' | 'NOT_ELIGIBLE';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST' | 'SPAM';
export type ImportStatus = 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';

// Brands (V002)
export interface BrandTable {
  id: Generated<string>;
  name: string;
  slug: string;
  website_url: string | null;
  logo_url: string | null;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Bike Models (V002)
export interface BikeModelTable {
  id: Generated<string>;
  brand_id: string;
  name: string;
  slug: string;
  model_year: number;
  category: BikeCategory;
  propulsion: PropulsionType;
  description: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Bike Variants (V002)
export interface BikeVariantTable {
  id: Generated<string>;
  model_id: string;
  manufacturer_sku: string | null;
  gtin: string | null;
  frame_size: string;
  frame_type: Generated<FrameType>;
  color: string;
  wheel_size_in: number | null;
  weight_kg: number | null;
  battery_wh: number | null;
  motor_brand: string | null;
  motor_model: string | null;
  torque_nm: number | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Variant Images (V002)
export interface VariantImageTable {
  id: Generated<string>;
  variant_id: string;
  image_url: string;
  sort_order: Generated<number>;
  is_primary: Generated<boolean>;
  created_at: Generated<Date>;
}

// Dealers (V003)
export interface DealerTable {
  id: Generated<string>;
  name: string;
  slug: string;
  website_url: string | null;
  phone: string | null;
  email: string;
  is_verified: Generated<boolean>;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Dealer Locations (V003)
export interface DealerLocationTable {
  id: Generated<string>;
  dealer_id: string;
  name: string;
  address_line1: string;
  postal_code: string;
  city: string;
  country_code: Generated<string>;
  latitude: number;
  longitude: number;
  coordinates: any | null; // PostGIS geography(Point, 4326)
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Data Sources (V003)
export interface DataSourceTable {
  id: Generated<string>;
  dealer_id: string;
  name: string;
  source_type: Generated<string>;
  feed_url: string | null;
  fetch_interval_mins: Generated<number>;
  is_active: Generated<boolean>;
  last_imported_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Offers (V003)
export interface OfferTable {
  id: Generated<string>;
  dealer_id: string;
  source_id: string;
  variant_id: string | null;
  external_id: string;
  title: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  currency: Generated<string>;
  availability: Generated<AvailabilityStatus>;
  quantity: Generated<number>;
  condition: Generated<OfferCondition>;
  source_url: string;
  image_url: string | null;
  content_hash: string;
  first_seen_at: Generated<Date>;
  last_seen_at: Generated<Date>;
  source_updated_at: Date | null;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Offer Price History (V003)
export interface OfferPriceHistoryTable {
  id: Generated<string>;
  offer_id: string;
  old_price_cents: number;
  new_price_cents: number;
  recorded_at: Generated<Date>;
}

// Import Runs (V003)
export interface ImportRunTable {
  id: Generated<string>;
  source_id: string;
  status: Generated<ImportStatus>;
  total_rows: Generated<number>;
  imported_rows: Generated<number>;
  failed_rows: Generated<number>;
  started_at: Generated<Date>;
  finished_at: Date | null;
  error_summary: string | null;
}

// Import Records (V003)
export interface ImportRecordTable {
  id: Generated<string>;
  import_run_id: string;
  row_number: number;
  raw_payload: string;
  error_message: string | null;
  status: Generated<string>;
}

// Product Match Candidates (V003)
export interface ProductMatchCandidateTable {
  id: Generated<string>;
  offer_id: string;
  proposed_variant_id: string | null;
  confidence_score: number;
  match_method: string;
  review_status: Generated<string>;
  created_at: Generated<Date>;
}

// Outbound Clicks (V004)
export interface OutboundClickTable {
  id: Generated<string>;
  offer_id: string;
  dealer_id: string;
  destination_url: string;
  session_hash: string;
  referer: string | null;
  clicked_at: Generated<Date>;
}

// Leads (V004)
export interface LeadTable {
  id: Generated<string>;
  offer_id: string;
  dealer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  message: string | null;
  enquiry_type: Generated<string>;
  status: Generated<LeadStatus>;
  consent_given_at: Generated<Date>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Audit Events (V004)
export interface AuditEventTable {
  id: Generated<string>;
  actor_id: string | null;
  actor_role: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  metadata: any | null;
  created_at: Generated<Date>;
}

// Users (V005)
export interface UserTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  full_name: string;
  role: Generated<UserRole>;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Dealer Memberships (V005)
export interface DealerMembershipTable {
  id: Generated<string>;
  user_id: string;
  dealer_id: string;
  role: Generated<UserRole>;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
}

// Leasing Providers (V006)
export interface LeasingProviderTable {
  id: Generated<string>;
  name: string;
  slug: string;
  website_url: string;
  logo_url: string | null;
  description: string | null;
  default_fee_percent: Generated<number>;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
}

// Dealer Provider Participation (V006)
export interface DealerProviderParticipationTable {
  id: Generated<string>;
  dealer_id: string;
  provider_id: string;
  status: Generated<LeasingEligibilityStatus>;
  contract_reference: string | null;
  verified_at: Generated<Date>;
  created_at: Generated<Date>;
}

// Offer Provider Eligibility (V006)
export interface OfferProviderEligibilityTable {
  id: Generated<string>;
  offer_id: string;
  provider_id: string;
  status: Generated<LeasingEligibilityStatus>;
  evidence_reason: string;
  calculated_at: Generated<Date>;
}

// User Alerts (V010)
export interface UserAlertTable {
  id: Generated<string>;
  user_id: string | null;
  offer_id: string;
  email: string;
  initial_price_cents: number;
  target_price_cents: number | null;
  is_triggered: Generated<boolean>;
  triggered_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Master Database Type
export interface Database {
  brands: BrandTable;
  bike_models: BikeModelTable;
  bike_variants: BikeVariantTable;
  variant_images: VariantImageTable;
  dealers: DealerTable;
  dealer_locations: DealerLocationTable;
  data_sources: DataSourceTable;
  offers: OfferTable;
  offer_price_history: OfferPriceHistoryTable;
  import_runs: ImportRunTable;
  import_records: ImportRecordTable;
  product_match_candidates: ProductMatchCandidateTable;
  outbound_clicks: OutboundClickTable;
  leads: LeadTable;
  audit_events: AuditEventTable;
  users: UserTable;
  dealer_memberships: DealerMembershipTable;
  leasing_providers: LeasingProviderTable;
  dealer_provider_participation: DealerProviderParticipationTable;
  offer_provider_eligibility: OfferProviderEligibilityTable;
  user_alerts: UserAlertTable;
}
