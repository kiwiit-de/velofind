/**
 * VeloFind PostgreSQL 17 + PostGIS Connection Pool
 * Production-ready connection pooling, connection verification, and PostGIS checks.
 */

import pg from 'pg';

const { Pool } = pg;

export interface PostgresHealthStatus {
  connected: boolean;
  version?: string;
  database?: string;
  host?: string;
  port?: number;
  poolSize?: number;
  activeClients?: number;
  idleClients?: number;
  latencyMs?: number;
  error?: string;
}

export interface PostgisHealthStatus {
  available: boolean;
  installedVersion?: string;
  fullVersion?: string;
  error?: string;
}

let pool: pg.Pool | null = null;
let onConnectionError: (() => void) | null = null;

let dbOnlineStatus = false;
let lastDbCheck = 0;
const DB_CHECK_INTERVAL_MS = 15000;

export function setDbConnectionErrorListener(fn: () => void): void {
  onConnectionError = fn;
}

/**
 * Checks whether PostgreSQL connection parameters (DATABASE_URL or PGHOST) are configured
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.PGHOST);
}

/**
 * Checks if the PostgreSQL database is configured and reachable
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }
  const now = Date.now();
  if (now - lastDbCheck < DB_CHECK_INTERVAL_MS) {
    return dbOnlineStatus;
  }
  lastDbCheck = now;
  try {
    const status = await verifyPostgresConnection();
    dbOnlineStatus = status.connected;
    return dbOnlineStatus;
  } catch {
    dbOnlineStatus = false;
    return false;
  }
}

/**
 * Lazily initialize and return the PostgreSQL Connection Pool
 */
export function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    const poolConfig: pg.PoolConfig = connectionString
      ? {
          connectionString,
          ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
          max: parseInt(process.env.PGPOOL_MAX || '20', 10),
          idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT_MS || '30000', 10),
          connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT_MS || '3000', 10)
        }
      : {
          host: process.env.PGHOST || 'localhost',
          port: parseInt(process.env.PGPORT || '5432', 10),
          user: process.env.PGUSER || 'velofind',
          password: process.env.PGPASSWORD || 'velofind_secure_password',
          database: process.env.PGDATABASE || 'velofind_db',
          ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
          max: parseInt(process.env.PGPOOL_MAX || '20', 10),
          idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT_MS || '30000', 10),
          connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT_MS || '3000', 10)
        };

    pool = new Pool(poolConfig);

    pool.on('error', (err) => {
      if (isDatabaseConfigured()) {
        console.error('[PostgreSQL Pool] Unexpected error on idle client:', err.message);
      }
      onConnectionError?.();
    });
  }

  return pool;
}

/**
 * Verify connectivity to PostgreSQL 17 on startup with latency measurement
 */
export async function verifyPostgresConnection(): Promise<PostgresHealthStatus> {
  if (!isDatabaseConfigured()) {
    return {
      connected: false,
      error: 'PostgreSQL is not configured; running in partner registry mode',
      latencyMs: 0
    };
  }

  const p = getPool();
  const startTime = Date.now();

  try {
    const client = await p.connect();
    try {
      const res = await client.query<{ version: string; current_database: string }>(
        'SELECT version(), current_database();'
      );
      const latencyMs = Date.now() - startTime;
      const row = res.rows[0];

      return {
        connected: true,
        version: row?.version || 'Unknown',
        database: row?.current_database || 'velofind_db',
        host: p.options.host || 'remote',
        port: p.options.port || 5432,
        poolSize: p.totalCount,
        activeClients: p.waitingCount,
        idleClients: p.idleCount,
        latencyMs
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    onConnectionError?.();
    return {
      connected: false,
      error: err.message,
      latencyMs: Date.now() - startTime
    };
  }
}

/**
 * Verify PostGIS spatial extension availability and version
 */
export async function verifyPostgisExtension(): Promise<PostgisHealthStatus> {
  if (!isDatabaseConfigured()) {
    return {
      available: false,
      error: 'PostgreSQL is not configured'
    };
  }

  const p = getPool();

  try {
    const client = await p.connect();
    try {
      // First try PostGIS_Full_Version() if already installed
      try {
        const fullVerRes = await client.query<{ postgis_full_version: string }>(
          'SELECT PostGIS_Full_Version() AS postgis_full_version;'
        );
        if (fullVerRes.rows.length > 0) {
          return {
            available: true,
            fullVersion: fullVerRes.rows[0].postgis_full_version,
            installedVersion: fullVerRes.rows[0].postgis_full_version.split(' ')[1] || '3.5+'
          };
        }
      } catch {
        // Fallback: Check if extension exists in pg_available_extensions
      }

      const extRes = await client.query<{ name: string; default_version: string; installed_version: string | null }>(
        "SELECT name, default_version, installed_version FROM pg_available_extensions WHERE name = 'postgis';"
      );

      if (extRes.rows.length > 0) {
        const ext = extRes.rows[0];
        return {
          available: true,
          installedVersion: ext.installed_version || ext.default_version,
          fullVersion: `PostGIS available (default ${ext.default_version}, installed: ${ext.installed_version || 'pending migration'})`
        };
      }

      return {
        available: false,
        error: 'PostGIS extension not found in pg_available_extensions'
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return {
      available: false,
      error: `Failed to query PostGIS extension: ${err.message}`
    };
  }
}

/**
 * Close the pool gracefully on application shutdown
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
