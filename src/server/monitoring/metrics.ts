/**
 * VeloFind Operational Metrics Registry (Phase 29)
 * Privacy-safe, bounded-cardinality telemetry for HTTP, PostgreSQL pool, feeds, and business events.
 */

import { Request, Response, NextFunction } from 'express';
import { getPool } from '../db/pool.ts';

export interface HttpRouteMetric {
  count: number;
  totalDurationMs: number;
  errorsByClass: {
    '4xx': number;
    '5xx': number;
  };
}

export interface OperationalMetricsSnapshot {
  timestamp: string;
  uptimeSeconds: number;
  http: {
    requestsTotal: number;
    errorsTotal: number;
    errorsByClass: {
      '4xx': number;
      '5xx': number;
    };
    durationSummary: {
      avgMs: number;
      p95EstimateMs: number;
    };
    routes: Record<string, HttpRouteMetric>;
  };
  postgresPool: {
    activeConnections: number;
    idleConnections: number;
    waitingRequests: number;
    maxConnections: number;
    connectionErrorsTotal: number;
  };
  feedIngestion: {
    importRunsTotal: number;
    importedRowsTotal: number;
    quarantinedRowsTotal: number;
    failedImportRunsTotal: number;
  };
  businessEvents: {
    leadsCreatedTotal: number;
    outboundClicksTotal: number;
  };
}

class MetricsRegistry {
  private httpRequestsTotal = 0;
  private httpErrorsByClass = { '4xx': 0, '5xx': 0 };
  private recentDurations: number[] = [];
  private totalDurationSum = 0;
  private routeMetrics = new Map<string, HttpRouteMetric>();

  // Database metrics
  private dbConnectionErrorsTotal = 0;

  // Feed metrics
  private importRunsTotal = 0;
  private importedRowsTotal = 0;
  private quarantinedRowsTotal = 0;
  private failedImportRunsTotal = 0;

  // Business interaction metrics
  private leadsCreatedTotal = 0;
  private outboundClicksTotal = 0;

  private readonly startTime = Date.now();

  /**
   * Normalize an incoming request path into a bounded-cardinality metric label.
   * Eliminates UUIDs, IDs, tokens, and query strings.
   */
  normalizeRoute(method: string, path: string): string {
    const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';

    // Normalize known parametric patterns
    let normalized = cleanPath
      .replace(/\/api\/offers\/[a-zA-Z0-9_-]+/g, '/api/offers/:id')
      .replace(/\/api\/dealers\/[a-zA-Z0-9_-]+/g, '/api/dealers/:id')
      .replace(/\/out\/[a-zA-Z0-9_-]+/g, '/out/:token')
      .replace(/\/api\/leads\/[a-zA-Z0-9_-]+/g, '/api/leads/:id')
      .replace(/\/api\/feeds\/[a-zA-Z0-9_-]+/g, '/api/feeds/:id');

    // Any remaining UUID or numeric IDs replaced
    normalized = normalized
      .replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, ':uuid')
      .replace(/\/\d+(?=\/|$)/g, '/:id');

    return `${method.toUpperCase()} ${normalized}`;
  }

  recordHttpRequest(method: string, path: string, statusCode: number, durationMs: number): void {
    this.httpRequestsTotal++;
    this.totalDurationSum += durationMs;

    // Keep rolling window of last 500 requests for p95 estimation
    this.recentDurations.push(durationMs);
    if (this.recentDurations.length > 500) {
      this.recentDurations.shift();
    }

    const routeKey = this.normalizeRoute(method, path);
    let routeMetric = this.routeMetrics.get(routeKey);
    if (!routeMetric) {
      routeMetric = {
        count: 0,
        totalDurationMs: 0,
        errorsByClass: { '4xx': 0, '5xx': 0 }
      };
      this.routeMetrics.set(routeKey, routeMetric);
    }

    routeMetric.count++;
    routeMetric.totalDurationMs += durationMs;

    if (statusCode >= 400 && statusCode < 500) {
      this.httpErrorsByClass['4xx']++;
      routeMetric.errorsByClass['4xx']++;
    } else if (statusCode >= 500) {
      this.httpErrorsByClass['5xx']++;
      routeMetric.errorsByClass['5xx']++;
    }
  }

  recordDbConnectionError(): void {
    this.dbConnectionErrorsTotal++;
  }

  recordFeedImportRun(result: { success: boolean; importedRows: number; quarantinedRows: number }): void {
    this.importRunsTotal++;
    this.importedRowsTotal += Math.max(0, result.importedRows);
    this.quarantinedRowsTotal += Math.max(0, result.quarantinedRows);
    if (!result.success) {
      this.failedImportRunsTotal++;
    }
  }

  recordLeadCreated(): void {
    this.leadsCreatedTotal++;
  }

  recordOutboundClick(): void {
    this.outboundClicksTotal++;
  }

  private calculateP95(): number {
    if (this.recentDurations.length === 0) return 0;
    const sorted = [...this.recentDurations].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return Math.round(sorted[index] * 100) / 100;
  }

  getSnapshot(): OperationalMetricsSnapshot {
    const pool = getPool();
    const activeConnections = Math.max(0, pool.totalCount - pool.idleCount);

    const routesObject: Record<string, HttpRouteMetric> = {};
    for (const [key, val] of this.routeMetrics.entries()) {
      routesObject[key] = {
        count: val.count,
        totalDurationMs: Math.round(val.totalDurationMs * 10) / 10,
        errorsByClass: { ...val.errorsByClass }
      };
    }

    const avgMs = this.httpRequestsTotal > 0
      ? Math.round((this.totalDurationSum / this.httpRequestsTotal) * 100) / 100
      : 0;

    return {
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      http: {
        requestsTotal: this.httpRequestsTotal,
        errorsTotal: this.httpErrorsByClass['4xx'] + this.httpErrorsByClass['5xx'],
        errorsByClass: { ...this.httpErrorsByClass },
        durationSummary: {
          avgMs,
          p95EstimateMs: this.calculateP95()
        },
        routes: routesObject
      },
      postgresPool: {
        activeConnections,
        idleConnections: pool.idleCount,
        waitingRequests: pool.waitingCount,
        maxConnections: pool.options.max || 20,
        connectionErrorsTotal: this.dbConnectionErrorsTotal
      },
      feedIngestion: {
        importRunsTotal: this.importRunsTotal,
        importedRowsTotal: this.importedRowsTotal,
        quarantinedRowsTotal: this.quarantinedRowsTotal,
        failedImportRunsTotal: this.failedImportRunsTotal
      },
      businessEvents: {
        leadsCreatedTotal: this.leadsCreatedTotal,
        outboundClicksTotal: this.outboundClicksTotal
      }
    };
  }

  /**
   * Reset internal counters (useful for unit tests)
   */
  reset(): void {
    this.httpRequestsTotal = 0;
    this.httpErrorsByClass = { '4xx': 0, '5xx': 0 };
    this.recentDurations = [];
    this.totalDurationSum = 0;
    this.routeMetrics.clear();
    this.dbConnectionErrorsTotal = 0;
    this.importRunsTotal = 0;
    this.importedRowsTotal = 0;
    this.quarantinedRowsTotal = 0;
    this.failedImportRunsTotal = 0;
    this.leadsCreatedTotal = 0;
    this.outboundClicksTotal = 0;
  }
}

export const metrics = new MetricsRegistry();

/**
 * Express middleware to track HTTP request timing, route counts, and status codes.
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    metrics.recordHttpRequest(req.method, req.path, res.statusCode, durationMs);
  });

  next();
}

/**
 * Handler for GET /api/metrics
 * Protected by token authentication or local loopback access.
 */
export function handleMetricsEndpoint(req: Request, res: Response): void {
  const authToken = process.env.MONITORING_AUTH_TOKEN;
  const authHeader = req.headers.authorization;
  const tokenHeader = req.headers['x-monitoring-token'];

  // If a monitoring token is configured, enforce security
  if (authToken) {
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const provided = bearerToken || tokenHeader;

    if (!provided || provided !== authToken) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid monitoring authorization token required'
      });
      return;
    }
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.status(200).json(metrics.getSnapshot());
}
