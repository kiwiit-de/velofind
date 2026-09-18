/**
 * Outbound Clicks Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import { isDatabaseAvailable } from '../pool.ts';
import { generateUUID } from '../utils.ts';
import type { OutboundClickTable } from '../schema.ts';
import type { Insertable, Selectable } from 'kysely';
import { sql } from 'kysely';

export type OutboundClick = Selectable<OutboundClickTable>;
export type NewOutboundClick = Insertable<OutboundClickTable>;

export interface DealerClickStats {
  dealer_id: string;
  total_clicks: number;
}

const inMemoryClicks: OutboundClick[] = [];

export class OutboundClicksRepository {
  private get db() {
    return getKysely();
  }

  async recordClick(click: NewOutboundClick): Promise<OutboundClick> {
    if (await isDatabaseAvailable()) {
      try {
        return await this.db
          .insertInto('outbound_clicks')
          .values(click)
          .returningAll()
          .executeTakeFirstOrThrow();
      } catch {
        // Fallback below
      }
    }

    const recorded: OutboundClick = {
      id: click.id || generateUUID(),
      offer_id: click.offer_id,
      dealer_id: click.dealer_id,
      destination_url: click.destination_url,
      session_hash: click.session_hash,
      referer: click.referer ?? null,
      clicked_at: new Date()
    };
    inMemoryClicks.unshift(recorded);
    return recorded;
  }

  async findByDealerId(dealerId?: string, limit: number = 50): Promise<OutboundClick[]> {
    if (await isDatabaseAvailable()) {
      try {
        let query = this.db.selectFrom('outbound_clicks').selectAll();
        if (dealerId) {
          query = query.where('dealer_id', '=', dealerId);
        }
        return await query
          .orderBy('clicked_at', 'desc')
          .limit(limit)
          .execute();
      } catch {
        // Fallback below
      }
    }

    return inMemoryClicks
      .filter((c) => (dealerId ? c.dealer_id === dealerId : true))
      .slice(0, limit);
  }

  async countByDealer(dealerId: string): Promise<number> {
    if (await isDatabaseAvailable()) {
      try {
        const result = await this.db
          .selectFrom('outbound_clicks')
          .select(sql<number>`count(*)::int`.as('count'))
          .where('dealer_id', '=', dealerId)
          .executeTakeFirst();

        return result?.count ?? 0;
      } catch {
        // Fallback below
      }
    }

    return inMemoryClicks.filter((c) => c.dealer_id === dealerId).length;
  }

  async count(): Promise<number> {
    if (await isDatabaseAvailable()) {
      try {
        const res = await this.db
          .selectFrom('outbound_clicks')
          .select((eb) => eb.fn.count<number>('id').as('count'))
          .executeTakeFirst();
        return Number(res?.count ?? inMemoryClicks.length);
      } catch {
        // Fallback below
      }
    }
    return inMemoryClicks.length;
  }
}

export const outboundClicksRepository = new OutboundClicksRepository();
