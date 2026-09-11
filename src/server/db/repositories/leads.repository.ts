/**
 * Leads Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import type { LeadTable, LeadStatus } from '../schema.ts';
import type { Insertable, Selectable, Updateable } from 'kysely';

export type Lead = Selectable<LeadTable>;
export type NewLead = Insertable<LeadTable>;
export type LeadUpdate = Updateable<LeadTable>;

export interface LeadWithOfferAndDealer extends Lead {
  offer_title: string;
  dealer_name: string;
}

export class LeadsRepository {
  private get db() {
    return getKysely();
  }

  async findByDealerId(dealerId?: string, status?: LeadStatus): Promise<LeadWithOfferAndDealer[]> {
    let query = this.db
      .selectFrom('leads as l')
      .innerJoin('offers as o', 'o.id', 'l.offer_id')
      .innerJoin('dealers as d', 'd.id', 'l.dealer_id')
      .selectAll('l')
      .select([
        'o.title as offer_title',
        'd.name as dealer_name'
      ]);

    if (dealerId) {
      query = query.where('l.dealer_id', '=', dealerId);
    }
    if (status) {
      query = query.where('l.status', '=', status);
    }

    return await query.orderBy('l.created_at', 'desc').execute() as unknown as LeadWithOfferAndDealer[];
  }

  async findById(id: string): Promise<Lead | undefined> {
    return await this.db
      .selectFrom('leads')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async create(lead: NewLead): Promise<Lead> {
    return await this.db
      .insertInto('leads')
      .values(lead)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead | undefined> {
    return await this.db
      .updateTable('leads')
      .set({
        status,
        updated_at: new Date()
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async count(): Promise<number> {
    const res = await this.db
      .selectFrom('leads')
      .select((eb) => eb.fn.count<number>('id').as('count'))
      .executeTakeFirst();
    return Number(res?.count ?? 0);
  }
}

export const leadsRepository = new LeadsRepository();
