/**
 * VeloFind Price Drop Alert & Notification Service
 * Watches price changes, queries the `user_alerts` (UserAlerts) database table,
 * and executes notifications when bicycle prices drop.
 */

import {
  userAlertsRepository,
  auditEventsRepository,
  offersRepository
} from '../db/repositories/index.ts';
import { PARTNER_OFFERS_DATA } from '../db/dealer-registry.ts';

export interface TriggeredPriceAlertResult {
  alertId: string;
  email: string;
  offerId: string;
  offerTitle: string;
  oldPriceCents: number;
  newPriceCents: number;
  savingsCents: number;
  targetPriceCents: number | null;
  notifiedAt: string;
}

export class PriceAlertService {
  /**
   * Subscribe an email to a price drop alert for an offer
   */
  async subscribe(params: {
    offerId: string;
    email: string;
    targetPriceCents?: number | null;
    userId?: string | null;
  }) {
    const { offerId, email, targetPriceCents, userId } = params;

    // Verify offer exists
    const offer =
      (await offersRepository.findById(offerId)) ||
      PARTNER_OFFERS_DATA.find((o) => o.id === offerId);

    if (!offer) {
      throw new Error(`Fahrrad-Angebot mit ID "${offerId}" wurde nicht gefunden.`);
    }

    const currentPriceCents = offer.price_cents;

    // Check if user already has an active alert for this offer
    const existingAlerts = await userAlertsRepository.findActiveByOfferId(offerId);
    const existing = existingAlerts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (existing) {
      return {
        isNew: false,
        alert: existing,
        offerTitle: offer.title,
        currentPriceCents
      };
    }

    // Persist new alert in `user_alerts` database table
    const alert = await userAlertsRepository.create({
      offer_id: offerId,
      email,
      initial_price_cents: currentPriceCents,
      target_price_cents: targetPriceCents ?? null,
      user_id: userId ?? null
    });

    // Record audit event
    await auditEventsRepository.recordEvent({
      actor_role: 'CONSUMER',
      event_type: 'USER_ALERT_SUBSCRIBED',
      entity_type: 'USER_ALERT',
      entity_id: alert.id,
      metadata: {
        offer_id: offerId,
        email: alert.email,
        initial_price_cents: currentPriceCents,
        target_price_cents: targetPriceCents
      }
    });

    console.log(
      `[PriceAlertService] Persisted new Price Drop Alert in UserAlerts table: ${alert.email} watching "${offer.title}" (current: €${(currentPriceCents / 100).toFixed(2)})`
    );

    return {
      isNew: true,
      alert,
      offerTitle: offer.title,
      currentPriceCents
    };
  }

  /**
   * Evaluates active alerts and triggers notifications when an offer price drops
   */
  async checkAndTriggerAlertsForPriceDrop(
    offerId: string,
    oldPriceCents: number,
    newPriceCents: number
  ): Promise<TriggeredPriceAlertResult[]> {
    // Only trigger if price has actually dropped
    if (newPriceCents >= oldPriceCents) {
      return [];
    }

    const offer =
      (await offersRepository.findById(offerId)) ||
      PARTNER_OFFERS_DATA.find((o) => o.id === offerId);
    const offerTitle = offer?.title || 'Fahrrad-Angebot';

    const activeAlerts = await userAlertsRepository.findActiveByOfferId(offerId);
    const triggered: TriggeredPriceAlertResult[] = [];

    for (const alert of activeAlerts) {
      // If target_price_cents is set, only trigger if new price meets or beats the target
      if (alert.target_price_cents && newPriceCents > alert.target_price_cents) {
        continue;
      }

      // Mark alert as triggered in UserAlerts table
      await userAlertsRepository.markAsTriggered(alert.id);

      const savingsCents = oldPriceCents - newPriceCents;
      const result: TriggeredPriceAlertResult = {
        alertId: alert.id,
        email: alert.email,
        offerId,
        offerTitle,
        oldPriceCents,
        newPriceCents,
        savingsCents,
        targetPriceCents: alert.target_price_cents,
        notifiedAt: new Date().toISOString()
      };

      triggered.push(result);

      // Audit and notification log
      await auditEventsRepository.recordEvent({
        actor_role: 'SYSTEM',
        event_type: 'USER_ALERT_TRIGGERED',
        entity_type: 'USER_ALERT',
        entity_id: alert.id,
        metadata: {
          offer_id: offerId,
          email: alert.email,
          old_price_cents: oldPriceCents,
          new_price_cents: newPriceCents,
          savings_cents: savingsCents
        }
      });

      console.log(
        `[PriceAlertService] NOTIFIED ${alert.email}: Price drop on "${offerTitle}"! Old: €${(oldPriceCents / 100).toFixed(2)} -> New: €${(newPriceCents / 100).toFixed(2)} (Savings: €${(savingsCents / 100).toFixed(2)})`
      );
    }

    return triggered;
  }

  /**
   * Helper to simulate a price drop for testing/demonstration
   */
  async simulatePriceDrop(offerId: string, dropPercent: number = 10) {
    const offer =
      (await offersRepository.findById(offerId)) ||
      PARTNER_OFFERS_DATA.find((o) => o.id === offerId);

    if (!offer) {
      throw new Error(`Offer "${offerId}" not found`);
    }

    const oldPrice = offer.price_cents;
    const newPrice = Math.round(oldPrice * (1 - dropPercent / 100));

    // Update in memory registry
    offer.price_cents = newPrice;
    if (!offer.compare_at_price_cents) {
      offer.compare_at_price_cents = oldPrice;
    }

    // Trigger alerts
    const notifications = await this.checkAndTriggerAlertsForPriceDrop(
      offerId,
      oldPrice,
      newPrice
    );

    return {
      offerId,
      offerTitle: offer.title,
      oldPriceCents: oldPrice,
      newPriceCents: newPrice,
      notificationsSent: notifications.length,
      notifications
    };
  }
}

export const priceAlertService = new PriceAlertService();
