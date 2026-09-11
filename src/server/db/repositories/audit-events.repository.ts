/**
 * Audit Events Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import type { AuditEventTable } from '../schema.ts';
import type { Insertable, Selectable } from 'kysely';

export type AuditEvent = Selectable<AuditEventTable>;
export type NewAuditEvent = Insertable<AuditEventTable>;

export class AuditEventsRepository {
  private get db() {
    return getKysely();
  }

  async recordEvent(event: NewAuditEvent): Promise<AuditEvent> {
    return await this.db
      .insertInto('audit_events')
      .values(event)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findAll(limit: number = 100): Promise<AuditEvent[]> {
    return await this.db
      .selectFrom('audit_events')
      .selectAll()
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute();
  }

  async findByEntity(entityType: string, entityId: string, limit: number = 50): Promise<AuditEvent[]> {
    return await this.db
      .selectFrom('audit_events')
      .selectAll()
      .where('entity_type', '=', entityType)
      .where('entity_id', '=', entityId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute();
  }
}

export const auditEventsRepository = new AuditEventsRepository();
