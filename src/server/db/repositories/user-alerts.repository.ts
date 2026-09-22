/**
 * User Alerts Repository (Kysely)
 * Manages price drop alerts stored in the `user_alerts` (UserAlerts) database table.
 * Supports direct PostgreSQL 17 execution with seamless in-memory fallback.
 */

import { getKysely } from '../kysely.ts';
import { isDatabaseAvailable, getPool } from '../pool.ts';
import { generateUUID } from '../utils.ts';
import type { UserAlertTable } from '../schema.ts';
import type { Insertable, Selectable, Updateable } from 'kysely';
import { PARTNER_OFFERS_DATA } from '../dealer-registry.ts';

export type UserAlertDb = Selectable<UserAlertTable>;
export type NewUserAlert = Insertable<UserAlertTable>;
export type UserAlertUpdate = Updateable<UserAlertTable>;

export interface UserAlertWithDetails extends UserAlertDb {
  offer_title: string;
  current_price_cents: number;
}

// In-memory persistent array for fallback / preview mode
const inMemoryAlerts: UserAlertDb[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    user_id: null,
    offer_id: 'e0000000-0000-0000-0000-000000000001',
    email: 'biker@example.de',
    initial_price_cents: 349900,
    target_price_cents: 320000,
    is_triggered: false,
    triggered_at: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
];

let tableEnsured = false;

export class UserAlertsRepository {
  private get db() {
    return getKysely();
  }

  /**
   * Ensures the user_alerts table exists in PostgreSQL
   */
  private async ensureTable(): Promise<void> {
    if (tableEnsured) return;
    try {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_alerts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          offer_id UUID NOT NULL,
          email VARCHAR(255) NOT NULL,
          initial_price_cents INT NOT NULL,
          target_price_cents INT,
          is_triggered BOOLEAN NOT NULL DEFAULT false,
          triggered_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_user_alerts_offer_id ON user_alerts(offer_id);
        CREATE INDEX IF NOT EXISTS idx_user_alerts_email ON user_alerts(email);
        CREATE OR REPLACE VIEW "UserAlerts" AS SELECT * FROM user_alerts;
      `);
      tableEnsured = true;
    } catch {
      // Table creation attempted, will fall back if unavailable
    }
  }

  /**
   * Create a new price drop alert
   */
  async create(alert: {
    offer_id: string;
    email: string;
    initial_price_cents: number;
    target_price_cents?: number | null;
    user_id?: string | null;
  }): Promise<UserAlertDb> {
    const alertId = generateUUID();
    const now = new Date();

    if (await isDatabaseAvailable()) {
      try {
        await this.ensureTable();
        const created = await this.db
          .insertInto('user_alerts')
          .values({
            id: alertId,
            offer_id: alert.offer_id,
            email: alert.email.toLowerCase().trim(),
            initial_price_cents: alert.initial_price_cents,
            target_price_cents: alert.target_price_cents ?? null,
            user_id: alert.user_id ?? null,
            is_triggered: false,
            triggered_at: null
          })
          .returningAll()
          .executeTakeFirst();

        if (created) return created;
      } catch (err: any) {
        console.warn('[UserAlertsRepository] Postgres create failed, falling back to memory store:', err.message);
      }
    }

    const newAlert: UserAlertDb = {
      id: alertId,
      offer_id: alert.offer_id,
      email: alert.email.toLowerCase().trim(),
      initial_price_cents: alert.initial_price_cents,
      target_price_cents: alert.target_price_cents ?? null,
      user_id: alert.user_id ?? null,
      is_triggered: false,
      triggered_at: null,
      created_at: now,
      updated_at: now
    };

    inMemoryAlerts.unshift(newAlert);
    return newAlert;
  }

  /**
   * Find all active (untriggered) alerts for a given offer
   */
  async findActiveByOfferId(offerId: string): Promise<UserAlertDb[]> {
    if (await isDatabaseAvailable()) {
      try {
        await this.ensureTable();
        return await this.db
          .selectFrom('user_alerts')
          .selectAll()
          .where('offer_id', '=', offerId)
          .where('is_triggered', '=', false)
          .execute();
      } catch {
        // Fallback below
      }
    }

    return inMemoryAlerts.filter(
      (a) => a.offer_id === offerId && !a.is_triggered
    );
  }

  /**
   * Find alerts for a specific email
   */
  async findByEmail(email: string): Promise<UserAlertWithDetails[]> {
    const normalizedEmail = email.toLowerCase().trim();

    if (await isDatabaseAvailable()) {
      try {
        await this.ensureTable();
        const alerts = await this.db
          .selectFrom('user_alerts')
          .selectAll()
          .where('email', '=', normalizedEmail)
          .orderBy('created_at', 'desc')
          .execute();

        return alerts.map((a) => {
          const offer = PARTNER_OFFERS_DATA.find((o) => o.id === a.offer_id);
          return {
            ...a,
            offer_title: offer?.title || 'Fahrrad-Angebot',
            current_price_cents: offer?.price_cents || a.initial_price_cents
          };
        });
      } catch {
        // Fallback below
      }
    }

    return inMemoryAlerts
      .filter((a) => a.email === normalizedEmail)
      .map((a) => {
        const offer = PARTNER_OFFERS_DATA.find((o) => o.id === a.offer_id);
        return {
          ...a,
          offer_title: offer?.title || 'Fahrrad-Angebot',
          current_price_cents: offer?.price_cents || a.initial_price_cents
        };
      });
  }

  /**
   * Count active alerts for an offer
   */
  async countActiveByOfferId(offerId: string): Promise<number> {
    if (await isDatabaseAvailable()) {
      try {
        await this.ensureTable();
        const result = await this.db
          .selectFrom('user_alerts')
          .select((eb) => eb.fn.count<string>('id').as('count'))
          .where('offer_id', '=', offerId)
          .where('is_triggered', '=', false)
          .executeTakeFirst();

        return result ? parseInt(result.count, 10) : 0;
      } catch {
        // Fallback below
      }
    }

    return inMemoryAlerts.filter((a) => a.offer_id === offerId && !a.is_triggered).length;
  }

  /**
   * Mark an alert as triggered when a price drop occurs
   */
  async markAsTriggered(alertId: string): Promise<void> {
    const now = new Date();
    if (await isDatabaseAvailable()) {
      try {
        await this.ensureTable();
        await this.db
          .updateTable('user_alerts')
          .set({
            is_triggered: true,
            triggered_at: now,
            updated_at: now
          })
          .where('id', '=', alertId)
          .execute();
        return;
      } catch {
        // Fallback below
      }
    }

    const alert = inMemoryAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.is_triggered = true;
      alert.triggered_at = now;
      alert.updated_at = now;
    }
  }

  /**
   * Delete an alert subscription by ID
   */
  async delete(alertId: string): Promise<boolean> {
    if (await isDatabaseAvailable()) {
      try {
        await this.ensureTable();
        const res = await this.db
          .deleteFrom('user_alerts')
          .where('id', '=', alertId)
          .executeTakeFirst();
        return Number(res.numDeletedRows) > 0;
      } catch {
        // Fallback below
      }
    }

    const idx = inMemoryAlerts.findIndex((a) => a.id === alertId);
    if (idx !== -1) {
      inMemoryAlerts.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const userAlertsRepository = new UserAlertsRepository();
