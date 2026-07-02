import { Capacitor, registerPlugin } from '@capacitor/core';

import { isOverlayRoute } from '@/lib/isOverlayRoute';

import { FACEBOOK_PIXEL_ID } from './facebookConfig';
import { initFacebookPixel, trackPixelEvent, trackPixelPurchase } from './facebookPixel';

const FacebookAnalytics = registerPlugin('FacebookAnalytics');

const isNative = Capacitor.isNativePlatform();

/** @type {Promise<boolean> | null} */
let initPromise = null;

// Standard Facebook App Event names (matching Facebook's constants)
export const AppEvents = {
  CONTACT: 'Contact',
  SEARCHED: 'fb_mobile_search',
  COMPLETED_TUTORIAL: 'fb_mobile_tutorial_completion',
  COMPLETED_REGISTRATION: 'fb_mobile_complete_registration',
  AD_CLICK: 'AdClick',
  VIEWED_CONTENT: 'fb_mobile_content_view',
  ACHIEVED_LEVEL: 'fb_mobile_level_achieved',
  SUBSCRIBE: 'Subscribe',
  ADDED_TO_CART: 'fb_mobile_add_to_cart',
  AD_IMPRESSION: 'AdImpression',
  CUSTOMIZED_PRODUCT: 'fb_mobile_customize_product',
  UNLOCKED_ACHIEVEMENT: 'fb_mobile_achievement_unlocked',
  FOUND_LOCATION: 'fb_mobile_find_location',
  DONATED: 'Donate',
  ADDED_TO_WISHLIST: 'fb_mobile_add_to_wishlist',
  INITIATED_CHECKOUT: 'fb_mobile_initiated_checkout',
  START_TRIAL: 'StartTrial',
  SCHEDULE: 'Schedule',
  SUBMIT_APPLICATION: 'SubmitApplication',
  RATED: 'fb_mobile_rate',
  PURCHASED: 'fb_mobile_purchase',
  ADDED_PAYMENT_INFO: 'fb_mobile_add_payment_info',
};

// Standard Facebook App Event parameter keys
export const AppEventParams = {
  CONTENT_ID: 'fb_content_id',
  CONTENT_TYPE: 'fb_content_type',
  CURRENCY: 'fb_currency',
  SUCCESS: 'fb_success',
  MAX_RATING_VALUE: 'fb_max_rating_value',
  REGISTRATION_METHOD: 'fb_registration_method',
  DESCRIPTION: 'fb_description',
  LEVEL: 'fb_level',
};

function initFacebookAnalyticsInternal() {
  if (isNative) {
    // Native SDK credentials come from Info.plist / AndroidManifest.
    return Promise.resolve(true);
  }
  if (isOverlayRoute()) {
    return Promise.resolve(false);
  }
  return initFacebookPixel(FACEBOOK_PIXEL_ID);
}

function ensureInitialized() {
  if (isOverlayRoute()) {
    return Promise.resolve(false);
  }
  initPromise ??= initFacebookAnalyticsInternal();
  return initPromise;
}

/** Analytics must never break user flows (checkout, auth, etc.). */
function swallowAnalyticsErrors(promise) {
  return promise.catch(() => undefined);
}

/** Initialize web Meta Pixel on boot. Native SDK is configured in native project files. */
export function initFacebookAnalytics() {
  return swallowAnalyticsErrors(ensureInitialized());
}

/**
 * Log a standard or custom app event.
 * Native: Facebook App Events SDK. Web: Meta Pixel.
 */
export function logEvent(eventName, parameters = {}, valueToSum = undefined) {
  return swallowAnalyticsErrors(
    ensureInitialized().then((ready) => {
      if (!ready) return;
      if (isNative) {
        return FacebookAnalytics.logEvent({ eventName, parameters, valueToSum });
      }
      return trackPixelEvent(eventName, parameters, valueToSum);
    }),
  );
}

/**
 * Log a purchase event. Prefer this over logEvent for purchases — enables revenue reporting.
 */
export function logPurchase(amount, currency, parameters = {}) {
  return swallowAnalyticsErrors(
    ensureInitialized().then((ready) => {
      if (!ready) return;
      if (isNative) {
        return FacebookAnalytics.logPurchase({ amount, currency, parameters });
      }
      return trackPixelPurchase(amount, currency, parameters);
    }),
  );
}

/** Force-send queued native events. No-op on web (Pixel sends immediately). */
export function flushEvents() {
  if (isNative) {
    return swallowAnalyticsErrors(ensureInitialized().then((ready) => (ready ? FacebookAnalytics.flush() : undefined)));
  }
  return Promise.resolve();
}
