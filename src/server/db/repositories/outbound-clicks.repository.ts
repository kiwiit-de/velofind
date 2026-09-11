/**
 * Outbound Clicks Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import type { OutboundClickTable } from '../schema.ts';
import type { Insertable, Selectable } from 'kysely';
import { sql } from 'kysely';

export type OutboundClick = Selectable<OutboundClickTable>;
export type NewOutboundClick = Insertable<OutboundClickTable>;

export interface DealerClickStats {
  dealer_id: string;
  total_clicks: number;
}

export class OutboundClicksRepository {
  private get db() {
    return getKysely();
  }

  async recordClick(click: NewOutboundClick): Promise<OutboundClick> {
    return await this.db
      .insertInto('outbound_clicks')
      .values(click)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findByDealerId(dealerId?: string, limit: number = 50): Promise<OutboundClick[]> {
    let query = this.db.selectFrom('outbound_clicks').selectAll();
    if (dealerId) {
      query = query.where('dealer_id', '=', dealerId);
    }
    return await query
      .orderBy('clicked_at', 'desc')
      .limit(limit)
      .execute();
  }

  async countByDealer(dealerId: string): Promise<number> {
    const result = await this.db
      .selectFrom('outbound_clicks')
      .select(sql<number>`count(*)::int`.as('count'))
      .where('dealer_id', '=', dealerId)
      .executeTakeFirst();

    return result?.count ?? 0;
  }

  async count(): Promise<number> {
    const res = await this.db
      .selectFrom('outbound_clicks')
      .select((eb) => eb.fn.count<number>('id').as('count'))
      .executeTakeFirst();
    return Number(res?.count ?? 0);
  }
}

export const outboundClicksRepository = new OutboundClicksRepository();
