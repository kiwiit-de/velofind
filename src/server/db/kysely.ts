/**
 * VeloFind Kysely Database Instance
 * Connects Kysely query builder to PostgreSQL 17 via the shared connection pool.
 */

import { Kysely, PostgresDialect } from 'kysely';
import { getPool } from './pool.ts';
import type { Database } from './schema.ts';

let dbInstance: Kysely<Database> | null = null;

export function getKysely(): Kysely<Database> {
  if (!dbInstance) {
    dbInstance = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: getPool()
      })
    });
  }
  return dbInstance;
}

export type { Database } from './schema.ts';
