/**
 * VeloFind Core Domain Types
 * Matches the PostgreSQL 17 Flyway Schema
 */

export type UserRole = 'ADMIN' | 'DEALER_OWNER' | 'DEALER_EDITOR' | 'DEALER_VIEWER';

export type BikeCategory = 
  | 'E_BIKE' 
  | 'GRAVEL' 
  | 'TREKKING' 
  | 'MTB' 
  | 'CITY' 
  | 'CARGO' 
  | 'ROAD';

export type PropulsionType = 'PEDELEC' | 'S_PEDELEC' | 'MUSCULAR';

export type FrameType = 'DIAMOND' | 'STEP_THROUGH' | 'TRAPEZE' | 'WAVE';

export type OfferCondition = 'NEW' | 'REFURBISHED' | 'EX_DISPLAY';

export type AvailabilityStatus = 
  | 'IN_STOCK' 
  | 'AVAILABLE_SHORT_TERM' 
  | 'ON_DEMAND' 
  | 'OUT_OF_STOCK';

export type LeasingEligibilityStatus = 
  | 'CONFIRMED' 
  | 'LIKELY' 
  | 'REQUIRES_CONFIRMATION' 
  | 'NOT_ELIGIBLE';

export type LeadStatus = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'QUALIFIED' 
  | 'WON' 
  | 'LOST' 
  | 'SPAM';

export type ImportStatus = 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  website_url?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface BikeModel {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  model_year: number;
  category: BikeCategory;
  propulsion: PropulsionType;
  description?: string;
  created_at: string;
}

export interface BikeVariant {
  id: string;
  model_id: string;
  manufacturer_sku?: string;
  gtin?: string;
  frame_size: string;
  frame_type: FrameType;
  color: string;
  wheel_size_in?: number;
  weight_kg?: number;
  battery_wh?: number;
  motor_brand?: string;
  motor_model?: string;
  torque_nm?: number;
  images?: string[];
  created_at: string;
}

export interface DealerLocation {
  id: string;
  dealer_id: string;
  name: string;
  address_line1: string;
  postal_code: string;
  city: string;
  country_code: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  opening_hours?: string;
  distance_km?: number;
}

export interface Dealer {
  id: string;
  name: string;
  slug: string;
  website_url?: string;
  phone?: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  locations: DealerLocation[];
  supported_providers?: {
    provider_id: string;
    provider_slug: string;
    provider_name: string;
    status: LeasingEligibilityStatus;
    contract_reference?: string;
  }[];
  offers_count?: number;
  created_at: string;
}

export interface LeasingProvider {
  id: string;
  name: string;
  slug: string;
  website_url: string;
  logo_url?: string;
  description?: string;
  default_fee_percent: number;
  is_active: boolean;
}

export interface OfferProviderEligibility {
  provider_id: string;
  provider_slug: string;
  provider_name: string;
  status: LeasingEligibilityStatus;
  evidence_reason: string;
}

export interface OfferPriceHistory {
  id: string;
  offer_id: string;
  old_price_cents: number;
  new_price_cents: number;
  recorded_at: string;
}

export interface Offer {
  id: string;
  dealer_id: string;
  dealer_name: string;
  dealer_slug: string;
  dealer_verified: boolean;
  dealer_locations: DealerLocation[];
  source_id: string;
  variant_id?: string;
  external_id: string;
  title: string;
  brand_name: string;
  model_name: string;
  model_year: number;
  category: BikeCategory;
  propulsion: PropulsionType;
  price_cents: number;
  compare_at_price_cents?: number;
  currency: string;
  availability: AvailabilityStatus;
  quantity: number;
  condition: OfferCondition;
  source_url: string;
  image_url?: string;
  content_hash: string;
  first_seen_at: string;
  last_seen_at: string;
  is_active: boolean;
  variant_details?: {
    frame_size: string;
    frame_type: FrameType;
    color: string;
    wheel_size_in?: number;
    weight_kg?: number;
    battery_wh?: number;
    motor_brand?: string;
    motor_model?: string;
    torque_nm?: number;
    gtin?: string;
    sku?: string;
  };
  leasing_compatibilities: OfferProviderEligibility[];
  price_history?: OfferPriceHistory[];
  distance_km?: number;
}

export interface Lead {
  id: string;
  offer_id: string;
  offer_title: string;
  dealer_id: string;
  dealer_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  message?: string;
  enquiry_type: 'TEST_RIDE' | 'PRICE_QUERY' | 'LEASING_INFO' | 'GENERAL';
  status: LeadStatus;
  consent_given_at: string;
  created_at: string;
}

export interface OutboundClick {
  id: string;
  offer_id: string;
  dealer_id: string;
  destination_url: string;
  session_hash: string;
  referer?: string;
  clicked_at: string;
}

export interface ImportRun {
  id: string;
  source_id: string;
  dealer_id: string;
  dealer_name: string;
  status: ImportStatus;
  total_rows: number;
  imported_rows: number;
  failed_rows: number;
  started_at: string;
  finished_at?: string;
  error_summary?: string;
  records?: ImportRecord[];
}

export interface ImportRecord {
  id: string;
  import_run_id: string;
  row_number: number;
  raw_payload: string;
  error_message?: string;
  status: 'SUCCESS' | 'ERROR';
}

export interface AuditEvent {
  id: string;
  actor_id?: string;
  actor_role: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface SearchFilters {
  query?: string;
  dealerId?: string;
  dealerSlug?: string;
  dealerName?: string;
  category?: BikeCategory | 'ALL';
  propulsion?: PropulsionType | 'ALL';
  brand?: string;
  leasingProvider?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: AvailabilityStatus | 'ALL';
  condition?: OfferCondition | 'ALL';
  postalCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  sort?: 'price_asc' | 'price_desc' | 'distance_asc' | 'newest';
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  offers: Offer[];
  total: number;
  limit: number;
  offset: number;
  available_brands: { name: string; count: number }[];
  available_categories: { category: BikeCategory; count: number }[];
  available_providers: { slug: string; name: string; count: number }[];
  available_dealers?: { id: string; name: string; slug: string; count: number; city?: string; website_url?: string }[];
}

export interface OverviewStats {
  totalOffers: number;
  totalDealers: number;
  totalLeads: number;
  totalOutboundClicks: number;
  totalImportRuns: number;
}

export interface UserAlert {
  id: string;
  user_id?: string | null;
  offer_id: string;
  email: string;
  initial_price_cents: number;
  target_price_cents?: number | null;
  is_triggered: boolean;
  triggered_at?: string | null;
  created_at: string;
  updated_at?: string;
  offer_title?: string;
  current_price_cents?: number;
}

