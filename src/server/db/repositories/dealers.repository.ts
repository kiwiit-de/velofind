/**
 * Dealers Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import type { DealerTable, DealerLocationTable, LeasingEligibilityStatus } from '../schema.ts';
import type { Insertable, Selectable, Updateable } from 'kysely';

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
}

export class DealersRepository {
  private get db() {
    return getKysely();
  }

  async findAll(onlyActive: boolean = true): Promise<Dealer[]> {
    let query = this.db.selectFrom('dealers').selectAll();
    if (onlyActive) {
      query = query.where('is_active', '=', true);
    }
    return await query.orderBy('name', 'asc').execute();
  }

  async findAllWithLocations(onlyActive: boolean = true): Promise<DealerWithRelations[]> {
    const dealers = await this.findAll(onlyActive);
    if (dealers.length === 0) return [];

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

  async findById(id: string): Promise<Dealer | undefined> {
    return await this.db
      .selectFrom('dealers')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findBySlug(slug: string): Promise<Dealer | undefined> {
    return await this.db
      .selectFrom('dealers')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();
  }

  async findBySlugWithDetails(slug: string): Promise<DealerWithRelations | undefined> {
    const dealer = await this.findBySlug(slug);
    if (!dealer) return undefined;

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
    const res = await this.db
      .selectFrom('dealers')
      .select((eb) => eb.fn.count<number>('id').as('count'))
      .executeTakeFirst();
    return Number(res?.count ?? 0);
  }
}

export const dealersRepository = new DealersRepository();
