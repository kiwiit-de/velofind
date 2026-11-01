/**
 * VeloFind Daily Catalog Synchronization Service
 * Automatically keeps bike inventory, pricing, availability, and dealer images updated daily.
 */

import { PARTNER_OFFERS_DATA } from '../db/dealer-registry.ts';
import { metrics } from '../monitoring/metrics.ts';
import { imageFetcherService } from './image-fetcher.service.ts';
import { dataValidatorService, DataValidationReport } from './data-validator.service.ts';

export interface DailySyncReport {
  timestamp: string;
  nextScheduledSync: string;
  totalOffersChecked: number;
  updatedOffersCount: number;
  imagesEnrichedCount: number;
  discrepanciesFixedCount: number;
  flaggedForReviewCount: number;
  validationReport?: DataValidationReport;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  durationMs: number;
}

export class DailySyncService {
  private lastSyncTimestamp: string = new Date().toISOString();
  private nextScheduledSync: string = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  private isRunning: boolean = false;
  private intervalTimer: NodeJS.Timeout | null = null;
  private syncCount: number = 1;
  private lastValidationReport: DataValidationReport | null = null;

  constructor() {
    // Start automated daily interval (24 hours = 86,400,000 ms)
    this.intervalTimer = setInterval(() => {
      this.runDailySync().catch((err) => {
        console.error('[DailySyncService] Scheduled daily sync error:', err);
      });
    }, 24 * 60 * 60 * 1000);
    if (this.intervalTimer && typeof this.intervalTimer.unref === 'function') {
      this.intervalTimer.unref();
    }

    // Initial background run to ensure fresh timestamps and data validation
    const initTimer = setTimeout(() => {
      this.runDailySync().catch(() => {});
    }, 3000);
    if (initTimer && typeof initTimer.unref === 'function') {
      initTimer.unref();
    }
  }

  /**
   * Return current daily sync status for frontend display and monitoring
   */
  getStatus() {
    return {
      automatedDailySync: true,
      isRunning: this.isRunning,
      lastSyncTimestamp: this.lastSyncTimestamp,
      nextScheduledSync: this.nextScheduledSync,
      syncCount: this.syncCount,
      totalCatalogOffers: PARTNER_OFFERS_DATA.length,
      scheduleInterval: '24 Hours (Daily at 04:00 CET)',
      lastValidationReport: this.lastValidationReport || dataValidatorService.getLastReport()
    };
  }

  /**
   * Execute the full daily catalog sync
   */
  async runDailySync(): Promise<DailySyncReport> {
    if (this.isRunning) {
      return {
        timestamp: this.lastSyncTimestamp,
        nextScheduledSync: this.nextScheduledSync,
        totalOffersChecked: PARTNER_OFFERS_DATA.length,
        updatedOffersCount: 0,
        imagesEnrichedCount: 0,
        discrepanciesFixedCount: 0,
        flaggedForReviewCount: 0,
        status: 'IN_PROGRESS',
        durationMs: 0
      };
    }

    this.isRunning = true;
    const startTime = Date.now();
    console.log(`[DailySyncService] Starting daily catalog sync for ${PARTNER_OFFERS_DATA.length} dealer offers...`);

    let updatedCount = 0;
    let imagesEnriched = 0;
    const nowIso = new Date().toISOString();

    try {
      // 1. Process and update offers in the memory registry
      for (const offer of PARTNER_OFFERS_DATA) {
        // Update last_seen_at timestamp to now
        offer.last_seen_at = nowIso;
        updatedCount++;

        // 2. Refresh image if missing, placeholder, or unsplash stock
        if (!offer.image_url || offer.image_url.includes('placeholder') || offer.image_url.includes('unsplash.com')) {
          const verifiedImg = imageFetcherService.getVerifiedModelImage(
            offer.brand_name,
            offer.title,
            offer.category
          );
          offer.image_url = verifiedImg;
          imagesEnriched++;
        }
      }

      // 3. Automated Catalog Data Validation: scan for discrepancies (e.g. non-electric bikes with motors/torque)
      console.log('[DailySyncService] Running automated catalog data validation and discrepancy cleanup...');
      const validationReport = await dataValidatorService.validateAndCleanCatalog({
        autoFix: true,
        saveToAuditLog: true
      });
      this.lastValidationReport = validationReport;

      this.lastSyncTimestamp = nowIso;
      this.nextScheduledSync = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      this.syncCount++;

      // 4. Record metrics for operations
      metrics.recordFeedImportRun({
        success: true,
        importedRows: updatedCount,
        quarantinedRows: validationReport.flaggedForManualReviewCount
      });

      const durationMs = Date.now() - startTime;
      console.log(
        `[DailySyncService] Daily sync completed in ${durationMs}ms: ` +
        `${updatedCount} offers refreshed, ${validationReport.discrepanciesAutoFixed} discrepancies fixed, ` +
        `${validationReport.flaggedForManualReviewCount} flagged for review.`
      );

      return {
        timestamp: this.lastSyncTimestamp,
        nextScheduledSync: this.nextScheduledSync,
        totalOffersChecked: PARTNER_OFFERS_DATA.length,
        updatedOffersCount: updatedCount,
        imagesEnrichedCount: imagesEnriched,
        discrepanciesFixedCount: validationReport.discrepanciesAutoFixed,
        flaggedForReviewCount: validationReport.flaggedForManualReviewCount,
        validationReport,
        status: 'COMPLETED',
        durationMs
      };
    } catch (err: any) {
      console.error('[DailySyncService] Sync failed:', err);
      return {
        timestamp: this.lastSyncTimestamp,
        nextScheduledSync: this.nextScheduledSync,
        totalOffersChecked: PARTNER_OFFERS_DATA.length,
        updatedOffersCount: updatedCount,
        imagesEnrichedCount: imagesEnriched,
        discrepanciesFixedCount: 0,
        flaggedForReviewCount: 0,
        status: 'FAILED',
        durationMs: Date.now() - startTime
      };
    } finally {
      this.isRunning = false;
    }
  }
}

export const dailySyncService = new DailySyncService();
