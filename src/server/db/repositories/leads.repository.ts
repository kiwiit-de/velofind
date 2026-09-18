/**
 * Leads Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import { isDatabaseAvailable } from '../pool.ts';
import { generateUUID } from '../utils.ts';
import type { LeadTable, LeadStatus } from '../schema.ts';
import type { Insertable, Selectable, Updateable } from 'kysely';
import { PARTNER_OFFERS_DATA, PARTNER_DEALERS_DATA } from '../dealer-registry.ts';

export type Lead = Selectable<LeadTable>;
export type NewLead = Insertable<LeadTable>;
export type LeadUpdate = Updateable<LeadTable>;

export interface LeadWithOfferAndDealer extends Lead {
  offer_title: string;
  dealer_name: string;
}

const inMemoryLeads: Lead[] = [];

export class LeadsRepository {
  private get db() {
    return getKysely();
  }

  async findByDealerId(dealerId?: string, status?: LeadStatus): Promise<LeadWithOfferAndDealer[]> {
    if (await isDatabaseAvailable()) {
      try {
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
      } catch {
        // Fallback below
      }
    }

    return inMemoryLeads
      .filter((l) => {
        if (dealerId && l.dealer_id !== dealerId) return false;
        if (status && l.status !== status) return false;
        return true;
      })
      .map((l) => {
        const offer = PARTNER_OFFERS_DATA.find((o) => o.id === l.offer_id);
        const dealer = PARTNER_DEALERS_DATA.find((d) => d.id === l.dealer_id);
        return {
          ...l,
          offer_title: offer?.title || 'Fahrrad-Angebot',
          dealer_name: dealer?.name || 'Partner-Fahrradhändler'
        };
      });
  }

  async findById(id: string): Promise<Lead | undefined> {
    if (await isDatabaseAvailable()) {
      try {
        const lead = await this.db
          .selectFrom('leads')
          .selectAll()
          .where('id', '=', id)
          .executeTakeFirst();
        if (lead) return lead;
      } catch {
        // Fallback below
      }
    }
    return inMemoryLeads.find((l) => l.id === id);
  }

  async create(lead: NewLead): Promise<Lead> {
    if (await isDatabaseAvailable()) {
      try {
        return await this.db
          .insertInto('leads')
          .values(lead)
          .returningAll()
          .executeTakeFirstOrThrow();
      } catch {
        // Fallback below
      }
    }

    const created: Lead = {
      id: lead.id || generateUUID(),
      offer_id: lead.offer_id,
      dealer_id: lead.dealer_id,
      customer_name: lead.customer_name,
      customer_email: lead.customer_email,
      customer_phone: lead.customer_phone ?? null,
      message: lead.message ?? null,
      enquiry_type: lead.enquiry_type ?? 'TEST_RIDE',
      status: (lead.status as LeadStatus) ?? 'NEW',
      consent_given_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };
    inMemoryLeads.unshift(created);
    return created;
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead | undefined> {
    if (await isDatabaseAvailable()) {
      try {
        return await this.db
          .updateTable('leads')
          .set({
            status,
            updated_at: new Date()
          })
          .where('id', '=', id)
          .returningAll()
          .executeTakeFirst();
      } catch {
        // Fallback below
      }
    }

    const item = inMemoryLeads.find((l) => l.id === id);
    if (item) {
      item.status = status;
      item.updated_at = new Date();
      return item;
    }
    return undefined;
  }

  async count(): Promise<number> {
    if (await isDatabaseAvailable()) {
      try {
        const res = await this.db
          .selectFrom('leads')
          .select((eb) => eb.fn.count<number>('id').as('count'))
          .executeTakeFirst();
        return Number(res?.count ?? inMemoryLeads.length);
      } catch {
        // Fallback below
      }
    }
    return inMemoryLeads.length;
  }
}

export const leadsRepository = new LeadsRepository();
