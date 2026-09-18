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

export interface DealerWithRelations extends Dealer {
  locations: Selectable<DealerLocationTable>[];
  supported_providers: {
    provider_id: string;
    provider_slug: string;
    provider_name: string;
    status: LeasingEligibilityStatus;
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
        if (results && results.length > 0) return results;
      } catch {
        // Fallback to partner dealer registry
      }
    }

    return (PARTNER_DEALERS_DATA as unknown as Dealer[]).filter((d) => (onlyActive ? d.is_active : true));
  }

  async findAllWithLocations(onlyActive: boolean = true): Promise<DealerWithRelations[]> {
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

          return dealers.map((dealer) => ({
            ...dealer,
            locations: locations.filter((l) => l.dealer_id === dealer.id),
            supported_providers: participations
              .filter((p) => p.dealer_id === dealer.id)
              .map((p) => ({
                provider_id: p.provider_id,
                provider_slug: p.provider_slug,
                provider_name: p.provider_name,
                status: p.status,
                contract_reference: p.contract_reference ?? undefined
              }))
          }));
        }
      } catch {
        // Fallback to partner dealers dataset
      }
    }

    const offerCountMap = new Map<string, number>();
    PARTNER_OFFERS_DATA.forEach((o) => {
      if (o.is_active) {
        offerCountMap.set(o.dealer_id, (offerCountMap.get(o.dealer_id) || 0) + 1);
      }
    });

    return (PARTNER_DEALERS_DATA as unknown as DealerWithRelations[])
      .filter((d) => (onlyActive ? d.is_active : true))
      .map((d) => ({
        ...d,
        offers_count: offerCountMap.get(d.id) || 0
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
    if (await isDatabaseAvailable()) {
      try {
        const dealer = await this.db
          .selectFrom('dealers')
          .selectAll()
          .where('slug', '=', slug)
          .executeTakeFirst();
        if (dealer) return dealer;
      } catch {
        // Fallback below
      }
    }
    return (PARTNER_DEALERS_DATA as unknown as Dealer[]).find((d) => d.slug === slug);
  }

  async findBySlugWithDetails(slug: string): Promise<DealerWithRelations | undefined> {
    if (await isDatabaseAvailable()) {
      try {
        const dealer = await this.findBySlug(slug);
        if (dealer) {
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
        }
      } catch {
        // Fallback below
      }
    }

    const dealer = (PARTNER_DEALERS_DATA as unknown as DealerWithRelations[]).find((d) => d.slug === slug);
    if (!dealer) return undefined;
    const offersCount = PARTNER_OFFERS_DATA.filter((o) => o.dealer_id === dealer.id && o.is_active).length;
    return {
      ...dealer,
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
        if (res && res.count) return Number(res.count);
      } catch {
        // Fallback below
      }
    }
    return PARTNER_DEALERS_DATA.length;
  }
}

export const dealersRepository = new DealersRepository();
