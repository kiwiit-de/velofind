/**
 * Saved Searches / Suchagenten Repository
 * Manages user saved searches and automated notifications for new matching bike arrivals.
 * Operates with PostgreSQL 17 execution and in-memory persistent fallback.
 */

import { getKysely } from '../kysely.ts';
import { isDatabaseAvailable, getPool } from '../pool.ts';
import { generateUUID } from '../utils.ts';

export interface SavedSearchRecord {
  id: string;
  email: string;
  title: string;
  filters: Record<string, any>;
  filter_summary: string;
  match_count_at_save: number;
  notify_on_new: boolean;
  frequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
  created_at: string;
  last_checked_at?: string;
  new_matches_count?: number;
}

// In-memory array for preview mode
const inMemorySavedSearches: SavedSearchRecord[] = [
  {
    id: 's0000000-0000-0000-0000-000000000001',
    email: 'biker@example.de',
    title: 'E-MTB Fully • Bosch CX • bis 4.500 €',
    filters: {
      category: 'MTB',
      engineType: 'MITTELMOTOR',
      minTorque: 85,
      maxPrice: 4500
    },
    filter_summary: 'E-MTB • Mittelmotor • ab 85 Nm • bis 4.500 €',
    match_count_at_save: 6,
    notify_on_new: true,
    frequency: 'INSTANT',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_checked_at: new Date().toISOString(),
    new_matches_count: 2
  }
];

let tableEnsured = false;

export class SavedSearchesRepository {
  private get db() {
    return getKysely();
  }

  private async ensureTable(): Promise<void> {
    if (tableEnsured) return;
    try {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS saved_searches (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          filters JSONB NOT NULL,
          filter_summary TEXT,
          match_count_at_save INT DEFAULT 0,
          notify_on_new BOOLEAN NOT NULL DEFAULT true,
          frequency VARCHAR(50) DEFAULT 'INSTANT',
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_checked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_saved_searches_email ON saved_searches(email);
      `);
      tableEnsured = true;
    } catch {
      // Table creation attempted, falls back gracefully
    }
  }

  async create(data: {
    email: string;
    title?: string;
    filters: Record<string, any>;
    filterSummary?: string;
    matchCountAtSave?: number;
    notifyOnNew?: boolean;
    frequency?: 'INSTANT' | 'DAILY' | 'WEEKLY';
  }): Promise<SavedSearchRecord> {
    const id = generateUUID();
    const now = new Date().toISOString();
    const cleanEmail = data.email.toLowerCase().trim();
    const title = data.title?.trim() || data.filterSummary || 'Mein VeloFind Suchagent';

    const record: SavedSearchRecord = {
      id,
      email: cleanEmail,
      title,
      filters: data.filters,
      filter_summary: data.filterSummary || title,
      match_count_at_save: data.matchCountAtSave || 0,
      notify_on_new: data.notifyOnNew ?? true,
      frequency: data.frequency || 'INSTANT',
      created_at: now,
      last_checked_at: now,
      new_matches_count: 0
    };

    if (await isDatabaseAvailable()) {
      try {
        await this.ensureTable();
        const pool = getPool();
        await pool.query(
          `INSERT INTO saved_searches (id, email, title, filters, filter_summary, match_count_at_save, notify_on_new, frequency, created_at, last_checked_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            record.id,
            record.email,
            record.title,
            JSON.stringify(record.filters),
            record.filter_summary,
            record.match_count_at_save,
            record.notify_on_new,
            record.frequency,
            record.created_at,
            record.last_checked_at
          ]
        );
      } catch (err) {
        console.warn('[SavedSearches] Database insert failed, using memory:', err);
      }
    }

    // Always maintain in-memory mirror
    const existingIndex = inMemorySavedSearches.findIndex((s) => s.id === id);
    if (existingIndex >= 0) {
      inMemorySavedSearches[existingIndex] = record;
    } else {
      inMemorySavedSearches.unshift(record);
    }

    return record;
  }

  async findByEmail(email: string): Promise<SavedSearchRecord[]> {
    const cleanEmail = email.toLowerCase().trim();

    if (await isDatabaseAvailable()) {
      try {
        await this.ensureTable();
        const pool = getPool();
        const res = await pool.query(
          `SELECT * FROM saved_searches WHERE email = $1 ORDER BY created_at DESC`,
          [cleanEmail]
        );
        if (res.rows.length > 0) {
          return res.rows.map((row) => ({
            id: row.id,
            email: row.email,
            title: row.title,
            filters: typeof row.filters === 'string' ? JSON.parse(row.filters) : row.filters,
            filter_summary: row.filter_summary,
            match_count_at_save: row.match_count_at_save,
            notify_on_new: row.notify_on_new,
            frequency: row.frequency,
            created_at: new Date(row.created_at).toISOString(),
            last_checked_at: row.last_checked_at ? new Date(row.last_checked_at).toISOString() : undefined
          }));
        }
      } catch (err) {
        console.warn('[SavedSearches] Database query failed, using memory:', err);
      }
    }

    return inMemorySavedSearches.filter((s) => s.email.toLowerCase() === cleanEmail);
  }

  async findById(id: string): Promise<SavedSearchRecord | undefined> {
    if (await isDatabaseAvailable()) {
      try {
        await this.ensureTable();
        const pool = getPool();
        const res = await pool.query(`SELECT * FROM saved_searches WHERE id = $1`, [id]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            email: row.email,
            title: row.title,
            filters: typeof row.filters === 'string' ? JSON.parse(row.filters) : row.filters,
            filter_summary: row.filter_summary,
            match_count_at_save: row.match_count_at_save,
            notify_on_new: row.notify_on_new,
            frequency: row.frequency,
            created_at: new Date(row.created_at).toISOString(),
            last_checked_at: row.last_checked_at ? new Date(row.last_checked_at).toISOString() : undefined
          };
        }
      } catch {}
    }

    return inMemorySavedSearches.find((s) => s.id === id);
  }

  async delete(id: string): Promise<boolean> {
    if (await isDatabaseAvailable()) {
      try {
        await this.ensureTable();
        const pool = getPool();
        await pool.query(`DELETE FROM saved_searches WHERE id = $1`, [id]);
      } catch {}
    }

    const idx = inMemorySavedSearches.findIndex((s) => s.id === id);
    if (idx >= 0) {
      inMemorySavedSearches.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const savedSearchesRepository = new SavedSearchesRepository();
