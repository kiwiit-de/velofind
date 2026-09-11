/**
 * VeloFind Health & Readiness Probes (Phase 29)
 * Production liveness and readiness health checks with zero secret exposure.
 */

import { Request, Response } from 'express';
import { getPool, verifyPostgresConnection, verifyPostgisExtension } from '../db/pool.ts';

export interface LivenessResponse {
  status: 'ok';
  uptimeSeconds: number;
  timestamp: string;
}

export interface ReadinessCheckResult {
  ready: boolean;
  timestamp: string;
  checks: {
    postgres: {
      ready: boolean;
      latencyMs?: number;
      error?: string;
    };
    postgis: {
      ready: boolean;
      version?: string;
      error?: string;
    };
    migrations: {
      ready: boolean;
      latestVersion?: string;
      totalApplied?: number;
      error?: string;
    };
    criticalTables: {
      ready: boolean;
      error?: string;
    };
  };
}

/**
 * Liveness Probe: Confirms the Node.js process and HTTP event loop are functioning.
 * CRITICAL: Zero database queries are performed to avoid cascading failure loops.
 */
export function handleLivenessCheck(_req: Request, res: Response): void {
  const responsePayload: LivenessResponse = {
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.status(200).json(responsePayload);
}

/**
 * Query and validate the Flyway migration history table
 */
export async function verifyFlywayMigrationState(): Promise<{
  ready: boolean;
  latestVersion?: string;
  totalApplied?: number;
  error?: string;
}> {
  const pool = getPool();
  try {
    const client = await pool.connect();
    try {
      // 1. Check if flyway_schema_history exists
      const tableCheck = await client.query<{ exists: boolean }>(
        `SELECT EXISTS (
           SELECT FROM information_schema.tables 
           WHERE table_schema = 'public' 
           AND table_name = 'flyway_schema_history'
         );`
      );

      if (!tableCheck.rows[0]?.exists) {
        return {
          ready: false,
          error: 'flyway_schema_history table not found'
        };
      }

      // 2. Query for failed migrations
      const failedCheck = await client.query<{ failed_count: string }>(
        `SELECT count(*) AS failed_count 
         FROM flyway_schema_history 
         WHERE success = false;`
      );
      const failedCount = parseInt(failedCheck.rows[0]?.failed_count || '0', 10);
      if (failedCount > 0) {
        return {
          ready: false,
          error: `${failedCount} migration(s) recorded with success=false`
        };
      }

      // 3. Query total and latest migration version
      const versionCheck = await client.query<{ version: string; total: string }>(
        `SELECT version, count(*) OVER() as total
         FROM flyway_schema_history 
         WHERE success = true 
         ORDER BY installed_rank DESC 
         LIMIT 1;`
      );

      const latest = versionCheck.rows[0];
      if (!latest) {
        return {
          ready: false,
          error: 'No successful migrations recorded in flyway_schema_history'
        };
      }

      return {
        ready: true,
        latestVersion: latest.version,
        totalApplied: parseInt(latest.total || '0', 10)
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    // Sanitize any error message so connection details or credentials are never leaked
    return {
      ready: false,
      error: 'Failed to inspect Flyway migration state'
    };
  }
}

/**
 * Verify accessibility of core catalog tables (brands, bike_models, offers, dealers, leasing_providers)
 */
export async function verifyCriticalTables(): Promise<{ ready: boolean; error?: string }> {
  const pool = getPool();
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1 FROM brands, bike_models, offers, dealers, leasing_providers LIMIT 1;');
      return { ready: true };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return {
      ready: false,
      error: 'Critical catalog tables inaccessible or missing relations'
    };
  }
}

/**
 * Readiness Probe: Verifies all application-critical dependencies:
 * 1. PostgreSQL connectivity & pool latency
 * 2. PostGIS spatial extension
 * 3. Flyway migration state
 * 4. Critical database relations
 */
export async function handleReadinessCheck(_req: Request, res: Response): Promise<void> {
  const pgStatus = await verifyPostgresConnection();

  let postgisStatus = { available: false, error: 'Database offline' };
  let migrationStatus = { ready: false, error: 'Database offline' };
  let criticalTablesStatus = { ready: false, error: 'Database offline' };

  if (pgStatus.connected) {
    const [pgis, migs, tables] = await Promise.all([
      verifyPostgisExtension(),
      verifyFlywayMigrationState(),
      verifyCriticalTables()
    ]);
    postgisStatus = pgis;
    migrationStatus = migs;
    criticalTablesStatus = tables;
  }

  const isReady =
    pgStatus.connected &&
    postgisStatus.available &&
    migrationStatus.ready &&
    criticalTablesStatus.ready;

  const result: ReadinessCheckResult = {
    ready: isReady,
    timestamp: new Date().toISOString(),
    checks: {
      postgres: {
        ready: pgStatus.connected,
        latencyMs: pgStatus.latencyMs,
        error: pgStatus.connected ? undefined : 'PostgreSQL connection failed'
      },
      postgis: {
        ready: postgisStatus.available,
        version: postgisStatus.installedVersion || postgisStatus.fullVersion,
        error: postgisStatus.available ? undefined : (postgisStatus.error || 'PostGIS unavailable')
      },
      migrations: {
        ready: migrationStatus.ready,
        latestVersion: migrationStatus.latestVersion,
        totalApplied: migrationStatus.totalApplied,
        error: migrationStatus.ready ? undefined : migrationStatus.error
      },
      criticalTables: {
        ready: criticalTablesStatus.ready,
        error: criticalTablesStatus.ready ? undefined : criticalTablesStatus.error
      }
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  if (isReady) {
    res.status(200).json(result);
  } else {
    res.status(503).json(result);
  }
}
