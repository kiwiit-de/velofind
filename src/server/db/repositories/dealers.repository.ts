/**
 * Dealers Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import { isDatabaseAvailable } from '../pool.ts';
import type { DealerTable, DealerLocationTable, LeasingEligibilityStatus } from '../schema.ts';
import type { Insertable, Selectable, Updateable } from 'kysely';
import { PARTNER_DEALERS_DATA, PARTNER_OFFERS_DATA } from '../dealer-registry.ts';

export type Dealer = Selectable<DealerTable>;
export type NewDealer = Insertable<DealerTable>;
export type DealerUpdate = Updateable<DealerTable>;

export interface DealerWithRelations extends Omit<Dealer, 'created_at' | 'updated_at'> {
  created_at?: Date | string;
  updated_at?: Date | string;
  locations: (Selectable<DealerLocationTable> | any)[];
  supported_providers: {
    provider_id: string;
    provider_slug: string;
    provider_name: string;
    status: LeasingEligibilityStatus | string;
    contract_reference?: string;
  }[];
  offers_count?: number;
}

export class DealersRepository {
  private get db() {
    return getKysely();
  }

  async findAll(onlyActive: boolean = true): Promise<Dealer[]> {
    if (await isDatabaseAvailable()) {
      try {
        let query = this.db.selectFrom('dealers').selectAll();
        if (onlyActive) {
          query = query.where('is_active', '=', true);
        }
        const results = await query.orderBy('name', 'asc').execute();
        if (results && results.length >= PARTNER_DEALERS_DATA.length) {
          return results;
        }
        // If DB contains fewer dealers than the complete partner registry (e.g. initial migrations or partial seed),
        // merge in the full verified partner network so all 334 dealer websites are completely available!
        const dbSlugs = new Set((results || []).map((r) => r.slug));
        const missingPartners = (PARTNER_DEALERS_DATA as unknown as Dealer[])
          .filter((d) => !dbSlugs.has(d.slug) && (onlyActive ? d.is_active : true));
        return [...(results || []), ...missingPartners].sort((a, b) => a.name.localeCompare(b.name, 'de-DE'));
      } catch {
        // Fallback to partner dealer registry
      }
    }

    return (PARTNER_DEALERS_DATA as unknown as Dealer[]).filter((d) => (onlyActive ? d.is_active : true));
  }

  async findAllWithLocations(onlyActive: boolean = true): Promise<DealerWithRelations[]> {
    const offerCountMap = new Map<string, number>();
    PARTNER_OFFERS_DATA.forEach((o) => {
      if (o.is_active) {
        offerCountMap.set(o.dealer_id, (offerCountMap.get(o.dealer_id) || 0) + 1);
      }
    });

    const luckyBikeTotal = PARTNER_OFFERS_DATA.filter(
      (o) => o.is_active && (o.dealer_slug.startsWith('lucky-bike') || (o.source_url || '').includes('lucky-bike'))
    ).length;
    const fahrradXxlTotal = PARTNER_OFFERS_DATA.filter(
      (o) => o.is_active && (o.dealer_slug.startsWith('fahrrad-xxl') || (o.source_url || '').includes('fahrrad-xxl'))
    ).length;
    const bocTotal = PARTNER_OFFERS_DATA.filter(
      (o) => o.is_active && (o.dealer_slug.startsWith('boc') || (o.source_url || '').includes('boc24'))
    ).length;

    const resolveOffersCount = (dealer: { id: string; slug: string }): number => {
      if (dealer.slug === 'lucky-bike-fachmarkt') return luckyBikeTotal;
      if (dealer.slug === 'fahrrad-xxl-grossmarkt') return fahrradXxlTotal;
      if (dealer.slug === 'b-o-c-bicycles-online-care') return bocTotal;
      return offerCountMap.get(dealer.id) || 0;
    };

    if (await isDatabaseAvailable()) {
      try {
        const dealers = await this.findAll(onlyActive);
        if (dealers.length > 0) {
          const dealerIds = dealers.map((d) => d.id);

          const locations = await this.db
            .selectFrom('dealer_locations')
            .selectAll()
            .where('dealer_id', 'in', dealerIds)
            .orderBy('name', 'asc')
            .execute();

          const participations = await this.db
            .selectFrom('dealer_provider_participation as dpp')
            .innerJoin('leasing_providers as lp', 'lp.id', 'dpp.provider_id')
            .select([
              'dpp.dealer_id',
              'lp.id as provider_id',
              'lp.slug as provider_slug',
              'lp.name as provider_name',
              'dpp.status',
              'dpp.contract_reference'
            ])
            .where('dpp.dealer_id', 'in', dealerIds)
            .execute();

          const dbDealersWithRelations: DealerWithRelations[] = dealers.map((dealer) => {
            const dealerLocs = locations.filter((l) => l.dealer_id === dealer.id);
            const fallbackDealer = PARTNER_DEALERS_DATA.find((p) => p.slug === dealer.slug);
            const resolvedLocs = dealerLocs.length > 0 ? dealerLocs : (fallbackDealer?.locations || []);
            const resolvedProviders = participations.filter((p) => p.dealer_id === dealer.id);

            return {
              ...dealer,
              locations: resolvedLocs,
              supported_providers: resolvedProviders.length > 0
                ? resolvedProviders.map((p) => ({
                    provider_id: p.provider_id,
                    provider_slug: p.provider_slug,
                    provider_name: p.provider_name,
                    status: p.status,
                    contract_reference: p.contract_reference ?? undefined
                  }))
                : (fallbackDealer?.supported_providers || []),
              offers_count: resolveOffersCount(dealer)
            };
          });

          // Ensure all 334 verified partner dealers are present
          const existingSlugs = new Set(dbDealersWithRelations.map((d) => d.slug));
          const missingPartners = (PARTNER_DEALERS_DATA as unknown as DealerWithRelations[])
            .filter((d) => !existingSlugs.has(d.slug) && (onlyActive ? d.is_active : true))
            .map((d) => ({
              ...d,
              offers_count: resolveOffersCount(d)
            }));

          return [...dbDealersWithRelations, ...missingPartners].sort((a, b) => a.name.localeCompare(b.name, 'de-DE'));
        }
      } catch {
        // Fallback to partner dealers dataset
      }
    }

    return (PARTNER_DEALERS_DATA as unknown as DealerWithRelations[])
      .filter((d) => (onlyActive ? d.is_active : true))
      .map((d) => ({
        ...d,
        offers_count: resolveOffersCount(d)
      }));
  }

  async findById(id: string): Promise<Dealer | undefined> {
    if (await isDatabaseAvailable()) {
      try {
        const dealer = await this.db
          .selectFrom('dealers')
          .selectAll()
          .where('id', '=', id)
          .executeTakeFirst();
        if (dealer) return dealer;
      } catch {
        // Fallback below
      }
    }
    return (PARTNER_DEALERS_DATA as unknown as Dealer[]).find((d) => d.id === id);
  }

  async findBySlug(slug: string): Promise<Dealer | undefined> {
    const raw = slug.trim().toLowerCase();
    const cleanUrl = raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').trim();
    const baseDomain = cleanUrl.replace(/\.(de|com|net|org|eu|at|ch)$/i, '');

    // Canonical alias mappings
    let targetSlug = slug;
    if (raw === 'lucky-bike' || raw === 'luckybike' || cleanUrl === 'lucky-bike.de' || baseDomain === 'lucky-bike') {
      targetSlug = 'lucky-bike-fachmarkt';
    } else if (raw === 'fahrrad-xxl' || raw === 'fahrradxxl' || cleanUrl === 'fahrrad-xxl.de' || baseDomain === 'fahrrad-xxl') {
      targetSlug = 'fahrrad-xxl-grossmarkt';
    } else if (raw === 'boc' || raw === 'b-o-c' || cleanUrl === 'boc24.de' || baseDomain === 'boc24') {
      targetSlug = 'b-o-c-bicycles-online-care';
    }

    if (await isDatabaseAvailable()) {
      try {
        const dealer = await this.db
          .selectFrom('dealers')
          .selectAll()
          .where('slug', '=', targetSlug)
          .executeTakeFirst();
        if (dealer) return dealer;
      } catch {
        // Fallback below
      }
    }

    const direct = (PARTNER_DEALERS_DATA as unknown as Dealer[]).find((d) => d.slug === targetSlug || d.slug.toLowerCase() === raw);
    if (direct) return direct;

    if (cleanUrl) {
      const byUrl = (PARTNER_DEALERS_DATA as unknown as Dealer[]).find((d) => {
        const dWeb = (d.website_url || '').toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').trim();
        return dWeb === cleanUrl;
      });
      if (byUrl) return byUrl;
    }

    return undefined;
  }

  async findBySlugWithDetails(slug: string): Promise<DealerWithRelations | undefined> {
    const dealer = await this.findBySlug(slug);
    if (!dealer) return undefined;

    if (await isDatabaseAvailable()) {
      try {
        const locations = await this.db
          .selectFrom('dealer_locations')
          .selectAll()
          .where('dealer_id', '=', dealer.id)
          .execute();

        const participations = await this.db
          .selectFrom('dealer_provider_participation as dpp')
          .innerJoin('leasing_providers as lp', 'lp.id', 'dpp.provider_id')
          .select([
            'lp.id as provider_id',
            'lp.slug as provider_slug',
            'lp.name as provider_name',
            'dpp.status',
            'dpp.contract_reference'
          ])
          .where('dpp.dealer_id', '=', dealer.id)
          .execute();

        return {
          ...dealer,
          locations,
          supported_providers: participations.map((p) => ({
            provider_id: p.provider_id,
            provider_slug: p.provider_slug,
            provider_name: p.provider_name,
            status: p.status,
            contract_reference: p.contract_reference ?? undefined
          }))
        };
      } catch {
        // Fallback below
      }
    }

    const partnerDealer = (PARTNER_DEALERS_DATA as unknown as DealerWithRelations[]).find((d) => d.slug === dealer.slug);
    const resolved = partnerDealer || (dealer as DealerWithRelations);

    let offersCount = PARTNER_OFFERS_DATA.filter((o) => o.dealer_id === resolved.id && o.is_active).length;
    if (resolved.slug === 'lucky-bike-fachmarkt') {
      offersCount = PARTNER_OFFERS_DATA.filter(
        (o) => o.is_active && (o.dealer_slug.startsWith('lucky-bike') || (o.source_url || '').includes('lucky-bike'))
      ).length;
    } else if (resolved.slug === 'fahrrad-xxl-grossmarkt') {
      offersCount = PARTNER_OFFERS_DATA.filter(
        (o) => o.is_active && (o.dealer_slug.startsWith('fahrrad-xxl') || (o.source_url || '').includes('fahrrad-xxl'))
      ).length;
    } else if (resolved.slug === 'b-o-c-bicycles-online-care') {
      offersCount = PARTNER_OFFERS_DATA.filter(
        (o) => o.is_active && (o.dealer_slug.startsWith('boc') || (o.source_url || '').includes('boc24'))
      ).length;
    }

    return {
      ...resolved,
      offers_count: offersCount
    };
  }

  async create(dealer: NewDealer): Promise<Dealer> {
    return await this.db
      .insertInto('dealers')
      .values(dealer)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(id: string, updateWith: DealerUpdate): Promise<Dealer | undefined> {
    return await this.db
      .updateTable('dealers')
      .set(updateWith)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async count(): Promise<number> {
    if (await isDatabaseAvailable()) {
      try {
        const res = await this.db
          .selectFrom('dealers')
          .select((eb) => eb.fn.count<number>('id').as('count'))
          .executeTakeFirst();
        if (res && res.count) return Math.max(Number(res.count), PARTNER_DEALERS_DATA.length);
      } catch {
        // Fallback below
      }
    }
    return PARTNER_DEALERS_DATA.length;
  }
}

export const dealersRepository = new DealersRepository();
