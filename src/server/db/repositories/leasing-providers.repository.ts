/**
 * Leasing Providers Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import { isDatabaseAvailable } from '../pool.ts';
import type {
  LeasingProviderTable,
  DealerProviderParticipationTable,
  OfferProviderEligibilityTable,
  LeasingEligibilityStatus
} from '../schema.ts';
import type { Insertable, Selectable } from 'kysely';
import { LEASING_PROVIDERS_DATA } from '../dealer-registry.ts';

export type LeasingProvider = Selectable<LeasingProviderTable>;
export type NewLeasingProvider = Insertable<LeasingProviderTable>;
export type DealerProviderParticipation = Selectable<DealerProviderParticipationTable>;
export type NewDealerProviderParticipation = Insertable<DealerProviderParticipationTable>;
export type OfferProviderEligibility = Selectable<OfferProviderEligibilityTable>;

export interface DealerProviderWithDetails extends LeasingProvider {
  participation_status: LeasingEligibilityStatus;
  contract_reference: string | null;
}

export class LeasingProvidersRepository {
  private get db() {
    return getKysely();
  }

  async findAllActive(): Promise<LeasingProvider[]> {
    if (await isDatabaseAvailable()) {
      try {
        const providers = await this.db
          .selectFrom('leasing_providers')
          .selectAll()
          .where('is_active', '=', true)
          .orderBy('name', 'asc')
          .execute();
        if (providers && providers.length > 0) return providers;
      } catch {
        // Fallback to registry providers
      }
    }

    return (LEASING_PROVIDERS_DATA as unknown as LeasingProvider[]).filter((p) => p.is_active);
  }

  async findById(id: string): Promise<LeasingProvider | undefined> {
    if (await isDatabaseAvailable()) {
      try {
        const p = await this.db
          .selectFrom('leasing_providers')
          .selectAll()
          .where('id', '=', id)
          .executeTakeFirst();
        if (p) return p;
      } catch {
        // Fallback below
      }
    }
    return (LEASING_PROVIDERS_DATA as unknown as LeasingProvider[]).find((p) => p.id === id);
  }

  async findBySlug(slug: string): Promise<LeasingProvider | undefined> {
    if (await isDatabaseAvailable()) {
      try {
        const p = await this.db
          .selectFrom('leasing_providers')
          .selectAll()
          .where('slug', '=', slug)
          .executeTakeFirst();
        if (p) return p;
      } catch {
        // Fallback below
      }
    }
    return (LEASING_PROVIDERS_DATA as unknown as LeasingProvider[]).find((p) => p.slug === slug);
  }

  async findByDealerId(dealerId: string): Promise<DealerProviderWithDetails[]> {
    if (await isDatabaseAvailable()) {
      try {
        const results = await this.db
          .selectFrom('dealer_provider_participation as dpp')
          .innerJoin('leasing_providers as lp', 'lp.id', 'dpp.provider_id')
          .selectAll('lp')
          .select([
            'dpp.status as participation_status',
            'dpp.contract_reference as contract_reference'
          ])
          .where('dpp.dealer_id', '=', dealerId)
          .where('lp.is_active', '=', true)
          .orderBy('lp.name', 'asc')
          .execute();

        return results as unknown as DealerProviderWithDetails[];
      } catch {
        // Fallback below
      }
    }
    return (LEASING_PROVIDERS_DATA as unknown as DealerProviderWithDetails[]).map(p => ({
      ...p,
      participation_status: 'CONFIRMED' as LeasingEligibilityStatus,
      contract_reference: 'VF-PARTNER'
    }));
  }

  async setDealerParticipation(
    dealerId: string,
    providerId: string,
    status: LeasingEligibilityStatus,
    contractReference?: string
  ): Promise<DealerProviderParticipation> {
    const values: NewDealerProviderParticipation = {
      dealer_id: dealerId,
      provider_id: providerId,
      status,
      contract_reference: contractReference ?? null
    };

    return await this.db
      .insertInto('dealer_provider_participation')
      .values(values)
      .onConflict((oc) =>
        oc.columns(['dealer_id', 'provider_id']).doUpdateSet({
          status,
          contract_reference: contractReference ?? null,
          verified_at: new Date()
        })
      )
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findByOfferId(offerId: string) {
    try {
      return await this.db
        .selectFrom('offer_provider_eligibility as ope')
        .innerJoin('leasing_providers as lp', 'lp.id', 'ope.provider_id')
        .selectAll('lp')
        .select(['ope.status as eligibility_status', 'ope.evidence_reason as evidence_reason'])
        .where('ope.offer_id', '=', offerId)
        .execute();
    } catch (err) {
      return [];
    }
  }

  async count(): Promise<number> {
    if (await isDatabaseAvailable()) {
      try {
        const res = await this.db
          .selectFrom('leasing_providers')
          .select((eb) => eb.fn.count<number>('id').as('count'))
          .where('is_active', '=', true)
          .executeTakeFirst();
        if (res && res.count) return Number(res.count);
      } catch {
        // Fallback
      }
    }
    return LEASING_PROVIDERS_DATA.length;
  }
}

export const leasingProvidersRepository = new LeasingProvidersRepository();
