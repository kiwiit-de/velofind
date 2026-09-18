/**
 * Audit Events Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import { isDatabaseAvailable } from '../pool.ts';
import { generateUUID } from '../utils.ts';
import type { AuditEventTable } from '../schema.ts';
import type { Insertable, Selectable } from 'kysely';

export type AuditEvent = Selectable<AuditEventTable>;
export type NewAuditEvent = Insertable<AuditEventTable>;

const inMemoryEvents: AuditEvent[] = [];

export class AuditEventsRepository {
  private get db() {
    return getKysely();
  }

  async recordEvent(event: NewAuditEvent): Promise<AuditEvent> {
    if (await isDatabaseAvailable()) {
      try {
        return await this.db
          .insertInto('audit_events')
          .values(event)
          .returningAll()
          .executeTakeFirstOrThrow();
      } catch {
        // Fallback below
      }
    }

    const recorded: AuditEvent = {
      id: event.id || generateUUID(),
      actor_id: event.actor_id ?? null,
      actor_role: event.actor_role,
      event_type: event.event_type,
      entity_type: event.entity_type,
      entity_id: event.entity_id,
      metadata: event.metadata ?? null,
      created_at: new Date()
    };
    inMemoryEvents.unshift(recorded);
    return recorded;
  }

  async findAll(limit: number = 100): Promise<AuditEvent[]> {
    if (await isDatabaseAvailable()) {
      try {
        return await this.db
          .selectFrom('audit_events')
          .selectAll()
          .orderBy('created_at', 'desc')
          .limit(limit)
          .execute();
      } catch {
        // Fallback below
      }
    }
    return inMemoryEvents.slice(0, limit);
  }

  async findByEntity(entityType: string, entityId: string, limit: number = 50): Promise<AuditEvent[]> {
    if (await isDatabaseAvailable()) {
      try {
        return await this.db
          .selectFrom('audit_events')
          .selectAll()
          .where('entity_type', '=', entityType)
          .where('entity_id', '=', entityId)
          .orderBy('created_at', 'desc')
          .limit(limit)
          .execute();
      } catch {
        // Fallback below
      }
    }
    return inMemoryEvents
      .filter((e) => e.entity_type === entityType && e.entity_id === entityId)
      .slice(0, limit);
  }
}

export const auditEventsRepository = new AuditEventsRepository();
