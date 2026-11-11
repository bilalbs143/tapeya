import { Capacitor, registerPlugin } from '@capacitor/core';

import { FACEBOOK_PIXEL_ID } from './facebookConfig';
import { initFacebookPixel, trackPixelEvent, trackPixelPurchase } from './facebookPixel';

type FacebookAnalyticsPlugin = {
  logEvent: (options: {
    eventName: string;
    parameters?: Record<string, unknown>;
    valueToSum?: number;
  }) => Promise<void>;
  logPurchase: (options: { amount: number; currency: string; parameters?: Record<string, unknown> }) => Promise<void>;
  flush: () => Promise<void>;
};

const FacebookAnalytics = registerPlugin<FacebookAnalyticsPlugin>('FacebookAnalytics');

const isNative = Capacitor.isNativePlatform();

let initPromise: Promise<boolean> | null = null;

/** App Event names we fire (Meta App Events / Pixel mapping). */
export const AppEvents = {
  COMPLETED_REGISTRATION: 'fb_mobile_complete_registration',
  VIEWED_CONTENT: 'fb_mobile_content_view',
  ADDED_TO_CART: 'fb_mobile_add_to_cart',
  INITIATED_CHECKOUT: 'fb_mobile_initiated_checkout',
} as const;

/** App Event parameter keys we send. */
export const AppEventParams = {
  CONTENT_ID: 'fb_content_id',
  CONTENT_TYPE: 'fb_content_type',
  CURRENCY: 'fb_currency',
  REGISTRATION_METHOD: 'fb_registration_method',
} as const;

function ensureInitialized(): Promise<boolean> {
  initPromise ??= isNative ? Promise.resolve(true) : initFacebookPixel(FACEBOOK_PIXEL_ID);
  return initPromise;
}

/** Analytics must never break user flows (checkout, auth, etc.). */
function swallow(promise: Promise<unknown>): Promise<void> {
  return promise.then(() => undefined).catch(() => undefined);
}

/** Initialize web Meta Pixel on boot. Native SDK is configured in native project files. */
export function initFacebookAnalytics(): Promise<void> {
  return swallow(ensureInitialized());
}

/** Native: Facebook App Events SDK. Web: Meta Pixel. */
export function logEvent(
  eventName: string,
  parameters: Record<string, unknown> = {},
  valueToSum?: number
): Promise<void> {
  return swallow(
    ensureInitialized().then((ready) => {
      if (!ready) return;
      if (isNative) {
        return FacebookAnalytics.logEvent({
          eventName,
          parameters,
          ...(valueToSum != null ? { valueToSum } : {}),
        });
      }
      return trackPixelEvent(eventName, parameters, valueToSum);
    })
  );
}

/** Prefer this over logEvent for purchases — enables revenue reporting. */
export function logPurchase(amount: number, currency: string, parameters: Record<string, unknown> = {}): Promise<void> {
  return swallow(
    ensureInitialized().then((ready) => {
      if (!ready) return;
      if (isNative) {
        return FacebookAnalytics.logPurchase({ amount, currency, parameters });
      }
      return trackPixelPurchase(amount, currency, parameters);
    })
  );
}

/** Force-send queued native events. No-op on web (Pixel sends immediately). */
export function flushEvents(): Promise<void> {
  if (!isNative) return Promise.resolve();
  return swallow(ensureInitialized().then((ready) => (ready ? FacebookAnalytics.flush() : undefined)));
}
