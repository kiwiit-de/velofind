/**
 * Offer Price History Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import type { OfferPriceHistoryTable } from '../schema.ts';
import type { Insertable, Selectable } from 'kysely';

export type OfferPriceHistory = Selectable<OfferPriceHistoryTable>;
export type NewOfferPriceHistory = Insertable<OfferPriceHistoryTable>;

export class OfferPriceHistoryRepository {
  private get db() {
    return getKysely();
  }

  async findByOfferId(offerId: string): Promise<OfferPriceHistory[]> {
    return await this.db
      .selectFrom('offer_price_history')
      .selectAll()
      .where('offer_id', '=', offerId)
      .orderBy('recorded_at', 'desc')
      .execute();
  }

  async recordChange(entry: NewOfferPriceHistory): Promise<OfferPriceHistory> {
    return await this.db
      .insertInto('offer_price_history')
      .values(entry)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}

export const offerPriceHistoryRepository = new OfferPriceHistoryRepository();
