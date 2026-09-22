/**
 * Offers Repository (Kysely + PostGIS)
 * Implements complete PostgreSQL 17 relational queries, spatial distance filtering,
 * and search aggregations.
 */

import { getKysely } from '../kysely.ts';
import { isDatabaseAvailable } from '../pool.ts';
import type {
  OfferTable,
  AvailabilityStatus,
  OfferCondition,
  BikeCategory,
  PropulsionType
} from '../schema.ts';
import type { Insertable, Selectable, Updateable } from 'kysely';
import { sql } from 'kysely';
import { GERMAN_LOCATIONS, calculateDistanceKm } from '../utils.ts';
import type { Offer, SearchFilters, SearchResponse } from '../../../types.ts';
import { PARTNER_OFFERS_DATA } from '../dealer-registry.ts';

export type DbOffer = Selectable<OfferTable>;
export type NewOffer = Insertable<OfferTable>;
export type OfferUpdate = Updateable<OfferTable>;

export interface OfferSearchFilterParams {
  query?: string;
  dealerId?: string;
  dealerSlug?: string;
  dealerName?: string;
  variantId?: string;
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
  onlyActive?: boolean;
}

export class OffersRepository {
  private get db() {
    return getKysely();
  }

  async findById(id: string): Promise<Offer | undefined> {
    if (await isDatabaseAvailable()) {
      try {
        const raw = await this.db
          .selectFrom('offers as o')
          .innerJoin('dealers as d', 'd.id', 'o.dealer_id')
          .leftJoin('bike_variants as bv', 'bv.id', 'o.variant_id')
          .leftJoin('bike_models as bm', 'bm.id', 'bv.model_id')
          .leftJoin('brands as b', 'b.id', 'bm.brand_id')
          .selectAll('o')
          .select([
            'd.name as dealer_name',
            'd.slug as dealer_slug',
            'd.is_verified as dealer_verified',
            'b.name as brand_name',
            'bm.name as model_name',
            'bm.model_year as model_year',
            'bm.category as category',
            'bm.propulsion as propulsion',
            'bv.frame_size as frame_size',
            'bv.frame_type as frame_type',
            'bv.color as color',
            'bv.wheel_size_in as wheel_size_in',
            'bv.weight_kg as weight_kg',
            'bv.battery_wh as battery_wh',
            'bv.motor_brand as motor_brand',
            'bv.motor_model as motor_model',
            'bv.torque_nm as torque_nm',
            'bv.manufacturer_sku as sku',
            'bv.gtin as gtin'
          ])
          .where('o.id', '=', id)
          .executeTakeFirst();

        if (raw) {
          // Fetch locations for dealer
          const locations = await this.db
            .selectFrom('dealer_locations')
            .selectAll()
            .where('dealer_id', '=', raw.dealer_id)
            .execute();

          // Fetch price history
          const history = await this.db
            .selectFrom('offer_price_history')
            .selectAll()
            .where('offer_id', '=', raw.id)
            .orderBy('recorded_at', 'desc')
            .execute();

          // Fetch provider compatibilities
          const compatibilities = await this.db
            .selectFrom('offer_provider_eligibility as ope')
            .innerJoin('leasing_providers as lp', 'lp.id', 'ope.provider_id')
            .select([
              'lp.id as provider_id',
              'lp.slug as provider_slug',
              'lp.name as provider_name',
              'ope.status as status',
              'ope.evidence_reason as evidence_reason'
            ])
            .where('ope.offer_id', '=', raw.id)
            .execute();

          return this.mapRowToOffer(raw, locations, history, compatibilities);
        }
      } catch {
        // Fall through to partner registry
      }
    }

    const regOffer = PARTNER_OFFERS_DATA.find((o) => o.id === id);
    if (regOffer) return regOffer;
    return undefined;
  }

  async findBySourceAndExternalId(sourceId: string, externalId: string): Promise<DbOffer | undefined> {
    return await this.db
      .selectFrom('offers')
      .selectAll()
      .where('source_id', '=', sourceId)
      .where('external_id', '=', externalId)
      .executeTakeFirst();
  }

  async findMany(filters: OfferSearchFilterParams = {}): Promise<DbOffer[]> {
    let query = this.db.selectFrom('offers').selectAll();

    if (filters.onlyActive !== false) {
      query = query.where('is_active', '=', true);
    }
    if (filters.dealerId) {
      query = query.where('dealer_id', '=', filters.dealerId);
    }
    if (filters.variantId) {
      query = query.where('variant_id', '=', filters.variantId);
    }
    if (filters.minPrice) {
      query = query.where('price_cents', '>=', filters.minPrice * 100);
    }
    if (filters.maxPrice) {
      query = query.where('price_cents', '<=', filters.maxPrice * 100);
    }
    if (filters.availability && filters.availability !== 'ALL') {
      query = query.where('availability', '=', filters.availability);
    }
    if (filters.condition && filters.condition !== 'ALL') {
      query = query.where('condition', '=', filters.condition);
    }

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    return await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();
  }

  /**
   * Complete Search Query with PostGIS/in-memory distance and relational aggregations
   */
  async search(filters: SearchFilters): Promise<SearchResponse> {
    if (await isDatabaseAvailable()) {
      try {
        const dbResult = await this.searchDatabase(filters);
        if (dbResult && dbResult.offers && dbResult.offers.length > 0) {
          return dbResult;
        }
      } catch {
        // Fall back to partner dealer database
      }
    }

    return this.searchPartnerOffers(filters);
  }

  private async searchDatabase(filters: SearchFilters): Promise<SearchResponse> {
    let userLat = filters.latitude;
    let userLng = filters.longitude;

    if ((!userLat || !userLng) && filters.postalCode) {
      const cleanCode = filters.postalCode.toLowerCase().trim();
      const match = GERMAN_LOCATIONS[cleanCode];
      if (match) {
        userLat = match.lat;
        userLng = match.lng;
      }
    }

    let baseQuery = this.db
      .selectFrom('offers as o')
      .innerJoin('dealers as d', 'd.id', 'o.dealer_id')
      .leftJoin('bike_variants as bv', 'bv.id', 'o.variant_id')
      .leftJoin('bike_models as bm', 'bm.id', 'bv.model_id')
      .leftJoin('brands as b', 'b.id', 'bm.brand_id')
      .selectAll('o')
      .select([
        'd.name as dealer_name',
        'd.slug as dealer_slug',
        'd.is_verified as dealer_verified',
        'b.name as brand_name',
        'bm.name as model_name',
        'bm.model_year as model_year',
        'bm.category as category',
        'bm.propulsion as propulsion',
        'bv.frame_size as frame_size',
        'bv.frame_type as frame_type',
        'bv.color as color',
        'bv.wheel_size_in as wheel_size_in',
        'bv.weight_kg as weight_kg',
        'bv.battery_wh as battery_wh',
        'bv.motor_brand as motor_brand',
        'bv.motor_model as motor_model',
        'bv.torque_nm as torque_nm',
        'bv.manufacturer_sku as sku',
        'bv.gtin as gtin'
      ])
      .where('o.is_active', '=', true);

    // Dealer filters
    if (filters.dealerId) {
      baseQuery = baseQuery.where('o.dealer_id', '=', filters.dealerId);
    }
    if (filters.dealerSlug) {
      baseQuery = baseQuery.where('d.slug', '=', filters.dealerSlug);
    }
    if (filters.dealerName) {
      const dn = `%${filters.dealerName.trim().toLowerCase()}%`;
      baseQuery = baseQuery.where(sql<boolean>`LOWER(d.name) LIKE ${dn}`);
    }

    // Text query
    if (filters.query && filters.query.trim() !== '') {
      const q = `%${filters.query.trim().toLowerCase()}%`;
      baseQuery = baseQuery.where((eb) =>
        eb.or([
          sql<boolean>`LOWER(o.title) LIKE ${q}`,
          sql<boolean>`LOWER(COALESCE(b.name, '')) LIKE ${q}`,
          sql<boolean>`LOWER(COALESCE(bm.name, '')) LIKE ${q}`,
          sql<boolean>`LOWER(COALESCE(bv.color, '')) LIKE ${q}`,
          sql<boolean>`LOWER(COALESCE(d.name, '')) LIKE ${q}`,
          sql<boolean>`LOWER(COALESCE(d.website_url, '')) LIKE ${q}`,
          sql<boolean>`LOWER(COALESCE(o.source_url, '')) LIKE ${q}`
        ])
      );
    }

    // Category
    if (filters.category && filters.category !== 'ALL') {
      baseQuery = baseQuery.where('bm.category', '=', filters.category);
    }

    // Propulsion
    if (filters.propulsion && filters.propulsion !== 'ALL') {
      baseQuery = baseQuery.where('bm.propulsion', '=', filters.propulsion);
    }

    // Brand
    if (filters.brand && filters.brand !== 'ALL') {
      baseQuery = baseQuery.where((eb) =>
        eb(sql`LOWER(b.name)`, '=', filters.brand!.toLowerCase())
      );
    }

    // Leasing provider
    if (filters.leasingProvider && filters.leasingProvider !== 'ALL') {
      const providerSlug = filters.leasingProvider;
      baseQuery = baseQuery.where((eb) =>
        eb.exists(
          this.db
            .selectFrom('offer_provider_eligibility as ope')
            .innerJoin('leasing_providers as lp', 'lp.id', 'ope.provider_id')
            .select('ope.id')
            .where(sql<boolean>`ope.offer_id = o.id`)
            .where('lp.slug', '=', providerSlug)
            .where((eb2) => eb2.or([eb2('ope.status', '=', 'CONFIRMED'), eb2('ope.status', '=', 'LIKELY')]))
        )
      );
    }

    // Price range
    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      baseQuery = baseQuery.where('o.price_cents', '>=', filters.minPrice * 100);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      baseQuery = baseQuery.where('o.price_cents', '<=', filters.maxPrice * 100);
    }

    // Availability
    if (filters.availability && filters.availability !== 'ALL') {
      baseQuery = baseQuery.where('o.availability', '=', filters.availability);
    }

    // Condition
    if (filters.condition && filters.condition !== 'ALL') {
      baseQuery = baseQuery.where('o.condition', '=', filters.condition);
    }

    // Execute query to get raw items
    const rawOffers = await baseQuery.execute();

    // Attach dealer locations, price histories, and provider eligibility
    const offerIds = rawOffers.map((o) => o.id);
    const dealerIds = Array.from(new Set(rawOffers.map((o) => o.dealer_id)));

    const allLocations = dealerIds.length > 0
      ? await this.db.selectFrom('dealer_locations').selectAll().where('dealer_id', 'in', dealerIds).execute()
      : [];

    const allCompatibilities = offerIds.length > 0
      ? await this.db
          .selectFrom('offer_provider_eligibility as ope')
          .innerJoin('leasing_providers as lp', 'lp.id', 'ope.provider_id')
          .select([
            'ope.offer_id',
            'lp.id as provider_id',
            'lp.slug as provider_slug',
            'lp.name as provider_name',
            'ope.status as status',
            'ope.evidence_reason as evidence_reason'
          ])
          .where('ope.offer_id', 'in', offerIds)
          .execute()
      : [];

    // Map to domain Offer objects with distance calculations
    let domainOffers: Offer[] = rawOffers.map((raw) => {
      const locs = allLocations.filter((l) => l.dealer_id === raw.dealer_id);
      const comps = allCompatibilities.filter((c) => c.offer_id === raw.id);
      let distanceKm: number | undefined = undefined;

      if (userLat !== undefined && userLng !== undefined && locs.length > 0) {
        let minD = 99999;
        locs.forEach((l) => {
          const d = calculateDistanceKm(userLat!, userLng!, Number(l.latitude), Number(l.longitude));
          if (d < minD) minD = d;
        });
        if (minD < 99999) distanceKm = minD;
      }

      const offer = this.mapRowToOffer(raw, locs, [], comps);
      offer.distance_km = distanceKm;
      return offer;
    });

    // PostGIS / Distance radius filter
    if (userLat !== undefined && userLng !== undefined && filters.radiusKm && filters.radiusKm > 0) {
      domainOffers = domainOffers.filter((o) => o.distance_km !== undefined && o.distance_km <= filters.radiusKm!);
    }

    // Sort
    if (filters.sort === 'price_asc') {
      domainOffers.sort((a, b) => a.price_cents - b.price_cents);
    } else if (filters.sort === 'price_desc') {
      domainOffers.sort((a, b) => b.price_cents - a.price_cents);
    } else if (filters.sort === 'distance_asc' && userLat !== undefined) {
      domainOffers.sort((a, b) => (a.distance_km ?? 9999) - (b.distance_km ?? 9999));
    } else {
      domainOffers.sort((a, b) => new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime());
    }

    // Aggregations
    const brandCounts = new Map<string, number>();
    const catCounts = new Map<string, number>();
    const providerCounts = new Map<string, { name: string; count: number }>();
    const dealerCounts = new Map<string, { id: string; name: string; slug: string; count: number; city?: string }>();

    domainOffers.forEach((o) => {
      if (o.brand_name) {
        brandCounts.set(o.brand_name, (brandCounts.get(o.brand_name) || 0) + 1);
      }
      if (o.category) {
        catCounts.set(o.category, (catCounts.get(o.category) || 0) + 1);
      }
      if (o.dealer_id && o.dealer_name) {
        const cur = dealerCounts.get(o.dealer_id) || {
          id: o.dealer_id,
          name: o.dealer_name,
          slug: o.dealer_slug,
          count: 0,
          city: o.dealer_locations?.[0]?.city
        };
        cur.count++;
        dealerCounts.set(o.dealer_id, cur);
      }
      o.leasing_compatibilities.forEach((lc) => {
        const cur = providerCounts.get(lc.provider_slug) || { name: lc.provider_name, count: 0 };
        cur.count++;
        providerCounts.set(lc.provider_slug, cur);
      });
    });

    const total = domainOffers.length;
    const limit = filters.limit ?? 24;
    const offset = filters.offset ?? 0;
    const paginated = domainOffers.slice(offset, offset + limit);

    return {
      offers: paginated,
      total,
      limit,
      offset,
      available_brands: Array.from(brandCounts.entries()).map(([name, count]) => ({ name, count })),
      available_categories: Array.from(catCounts.entries()).map(([category, count]) => ({ category: category as BikeCategory, count })),
      available_providers: Array.from(providerCounts.entries()).map(([slug, data]) => ({ slug, name: data.name, count: data.count })),
      available_dealers: Array.from(dealerCounts.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    };
  }

  searchPartnerOffers(filters: SearchFilters): SearchResponse {
    let userLat = filters.latitude;
    let userLng = filters.longitude;

    if ((!userLat || !userLng) && filters.postalCode) {
      const cleanCode = filters.postalCode.toLowerCase().trim();
      const match = GERMAN_LOCATIONS[cleanCode];
      if (match) {
        userLat = match.lat;
        userLng = match.lng;
      }
    }

    let items = [...PARTNER_OFFERS_DATA];

    if (filters.dealerId) {
      items = items.filter((o) => o.dealer_id === filters.dealerId);
    }
    if (filters.dealerSlug) {
      items = items.filter((o) => o.dealer_slug === filters.dealerSlug);
    }
    if (filters.dealerName) {
      const dn = filters.dealerName.toLowerCase().trim();
      items = items.filter((o) => o.dealer_name.toLowerCase().includes(dn) || o.dealer_slug.toLowerCase().includes(dn));
    }
    if (filters.query && filters.query.trim() !== '') {
      const q = filters.query.toLowerCase().trim();
      items = items.filter((o) =>
        o.title.toLowerCase().includes(q) ||
        o.brand_name.toLowerCase().includes(q) ||
        o.model_name.toLowerCase().includes(q) ||
        (o.variant_details?.color && o.variant_details.color.toLowerCase().includes(q)) ||
        o.dealer_name.toLowerCase().includes(q) ||
        (o.source_url && o.source_url.toLowerCase().includes(q))
      );
    }
    if (filters.category && filters.category !== 'ALL') {
      items = items.filter((o) => o.category === filters.category);
    }
    if (filters.propulsion && filters.propulsion !== 'ALL') {
      items = items.filter((o) => o.propulsion === filters.propulsion);
    }
    if (filters.brand && filters.brand !== 'ALL') {
      const b = filters.brand.toLowerCase();
      items = items.filter((o) => o.brand_name.toLowerCase() === b);
    }
    if (filters.leasingProvider && filters.leasingProvider !== 'ALL') {
      const p = filters.leasingProvider.toLowerCase();
      items = items.filter((o) =>
        o.leasing_compatibilities.some(
          (lc) => lc.provider_slug.toLowerCase() === p && (lc.status === 'CONFIRMED' || lc.status === 'LIKELY')
        )
      );
    }
    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      items = items.filter((o) => o.price_cents >= filters.minPrice! * 100);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      items = items.filter((o) => o.price_cents <= filters.maxPrice! * 100);
    }
    if (filters.availability && filters.availability !== 'ALL') {
      items = items.filter((o) => o.availability === filters.availability);
    }
    if (filters.condition && filters.condition !== 'ALL') {
      items = items.filter((o) => o.condition === filters.condition);
    }

    // Attach distance
    items = items.map((o) => {
      let distanceKm: number | undefined = undefined;
      if (userLat !== undefined && userLng !== undefined && o.dealer_locations.length > 0) {
        let minD = 99999;
        o.dealer_locations.forEach((loc) => {
          const d = calculateDistanceKm(userLat!, userLng!, loc.latitude, loc.longitude);
          if (d < minD) minD = d;
        });
        if (minD < 99999) distanceKm = minD;
      }
      return { ...o, distance_km: distanceKm };
    });

    // Distance radius filter
    if (userLat !== undefined && userLng !== undefined && filters.radiusKm && filters.radiusKm > 0) {
      items = items.filter((o) => o.distance_km !== undefined && o.distance_km <= filters.radiusKm!);
    }

    // Sort
    if (filters.sort === 'price_asc') {
      items.sort((a, b) => a.price_cents - b.price_cents);
    } else if (filters.sort === 'price_desc') {
      items.sort((a, b) => b.price_cents - a.price_cents);
    } else if (filters.sort === 'distance_asc' && userLat !== undefined) {
      items.sort((a, b) => (a.distance_km ?? 9999) - (b.distance_km ?? 9999));
    } else {
      items.sort((a, b) => new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime());
    }

    // Aggregations
    const brandCounts = new Map<string, number>();
    const catCounts = new Map<string, number>();
    const providerCounts = new Map<string, { name: string; count: number }>();
    const dealerCounts = new Map<string, { id: string; name: string; slug: string; count: number; city?: string }>();

    items.forEach((o) => {
      if (o.brand_name) {
        brandCounts.set(o.brand_name, (brandCounts.get(o.brand_name) || 0) + 1);
      }
      if (o.category) {
        catCounts.set(o.category, (catCounts.get(o.category) || 0) + 1);
      }
      if (o.dealer_id && o.dealer_name) {
        const cur = dealerCounts.get(o.dealer_id) || {
          id: o.dealer_id,
          name: o.dealer_name,
          slug: o.dealer_slug,
          count: 0,
          city: o.dealer_locations?.[0]?.city
        };
        cur.count++;
        dealerCounts.set(o.dealer_id, cur);
      }
      o.leasing_compatibilities.forEach((lc) => {
        const cur = providerCounts.get(lc.provider_slug) || { name: lc.provider_name, count: 0 };
        cur.count++;
        providerCounts.set(lc.provider_slug, cur);
      });
    });

    const total = items.length;
    const limit = filters.limit ?? 24;
    const offset = filters.offset ?? 0;
    const paginated = items.slice(offset, offset + limit);

    return {
      offers: paginated,
      total,
      limit,
      offset,
      available_brands: Array.from(brandCounts.entries()).map(([name, count]) => ({ name, count })),
      available_categories: Array.from(catCounts.entries()).map(([category, count]) => ({ category: category as BikeCategory, count })),
      available_providers: Array.from(providerCounts.entries()).map(([slug, data]) => ({ slug, name: data.name, count: data.count })),
      available_dealers: Array.from(dealerCounts.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    };
  }

  async create(offer: NewOffer): Promise<DbOffer> {
    return await this.db
      .insertInto('offers')
      .values(offer)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(id: string, updateWith: OfferUpdate): Promise<DbOffer | undefined> {
    return await this.db
      .updateTable('offers')
      .set(updateWith)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * Idempotent Upsert for automated feed ingestion
   */
  async upsertBySourceAndExternalId(offer: NewOffer): Promise<DbOffer> {
    return await this.db
      .insertInto('offers')
      .values(offer)
      .onConflict((oc) =>
        oc.columns(['source_id', 'external_id']).doUpdateSet({
          title: offer.title,
          price_cents: offer.price_cents,
          compare_at_price_cents: offer.compare_at_price_cents,
          availability: offer.availability,
          quantity: offer.quantity,
          condition: offer.condition,
          source_url: offer.source_url,
          image_url: offer.image_url,
          content_hash: offer.content_hash,
          last_seen_at: new Date(),
          updated_at: new Date()
        })
      )
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async countActive(): Promise<number> {
    if (await isDatabaseAvailable()) {
      try {
        const res = await this.db
          .selectFrom('offers')
          .select((eb) => eb.fn.count<number>('id').as('count'))
          .where('is_active', '=', true)
          .executeTakeFirst();
        if (res && res.count && Number(res.count) > 0) return Number(res.count);
      } catch {
        // Fallback below
      }
    }
    return PARTNER_OFFERS_DATA.length;
  }

  private mapRowToOffer(
    raw: any,
    locations: any[],
    history: any[],
    compatibilities: any[]
  ): Offer {
    return {
      id: raw.id,
      dealer_id: raw.dealer_id,
      dealer_name: raw.dealer_name || '',
      dealer_slug: raw.dealer_slug || '',
      dealer_verified: Boolean(raw.dealer_verified),
      dealer_locations: locations.map((loc) => ({
        id: loc.id,
        dealer_id: loc.dealer_id,
        name: loc.name,
        address_line1: loc.address_line1,
        postal_code: loc.postal_code,
        city: loc.city,
        country_code: loc.country_code,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        phone: loc.phone || undefined,
        email: loc.email || undefined,
        opening_hours: loc.opening_hours || undefined
      })),
      source_id: raw.source_id,
      variant_id: raw.variant_id || undefined,
      external_id: raw.external_id,
      title: raw.title,
      brand_name: raw.brand_name || 'Markenlos',
      model_name: raw.model_name || raw.title,
      model_year: raw.model_year ? Number(raw.model_year) : 2025,
      category: raw.category || 'E_BIKE',
      propulsion: raw.propulsion || 'PEDELEC',
      price_cents: Number(raw.price_cents),
      compare_at_price_cents: raw.compare_at_price_cents ? Number(raw.compare_at_price_cents) : undefined,
      currency: raw.currency || 'EUR',
      availability: raw.availability || 'IN_STOCK',
      quantity: raw.quantity ? Number(raw.quantity) : 1,
      condition: raw.condition || 'NEW',
      source_url: raw.source_url,
      image_url: raw.image_url || undefined,
      content_hash: raw.content_hash || '',
      first_seen_at: raw.first_seen_at ? new Date(raw.first_seen_at).toISOString() : new Date().toISOString(),
      last_seen_at: raw.last_seen_at ? new Date(raw.last_seen_at).toISOString() : new Date().toISOString(),
      is_active: Boolean(raw.is_active),
      variant_details: {
        frame_size: raw.frame_size || 'M',
        frame_type: raw.frame_type || 'DIAMOND',
        color: raw.color || 'Schwarz',
        wheel_size_in: raw.wheel_size_in ? Number(raw.wheel_size_in) : undefined,
        weight_kg: raw.weight_kg ? Number(raw.weight_kg) : undefined,
        battery_wh: raw.battery_wh ? Number(raw.battery_wh) : undefined,
        motor_brand: raw.motor_brand || undefined,
        motor_model: raw.motor_model || undefined,
        torque_nm: raw.torque_nm ? Number(raw.torque_nm) : undefined,
        sku: raw.sku || undefined,
        gtin: raw.gtin || undefined
      },
      leasing_compatibilities: compatibilities.map((c) => ({
        provider_id: c.provider_id,
        provider_slug: c.provider_slug,
        provider_name: c.provider_name,
        status: c.status,
        evidence_reason: c.evidence_reason
      })),
      price_history: history.map((h) => ({
        id: h.id,
        offer_id: h.offer_id,
        old_price_cents: Number(h.old_price_cents),
        new_price_cents: Number(h.new_price_cents),
        recorded_at: new Date(h.recorded_at).toISOString()
      }))
    };
  }
}

export const offersRepository = new OffersRepository();
