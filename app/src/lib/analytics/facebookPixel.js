/**
 * Meta Pixel (web) — loads fbq and maps App Event names/params to standard Pixel events.
 */

import { isOverlayRoute } from '@/lib/isOverlayRoute';

import { FACEBOOK_PIXEL_ID } from './facebookConfig';

/** App Event name → Meta Pixel standard event name */
const APP_EVENT_TO_PIXEL = {
  fb_mobile_complete_registration: 'CompleteRegistration',
  fb_mobile_content_view: 'ViewContent',
  fb_mobile_add_to_cart: 'AddToCart',
  fb_mobile_initiated_checkout: 'InitiateCheckout',
  fb_mobile_purchase: 'Purchase',
  SubmitApplication: 'SubmitApplication',
};

const PARAM_CONTENT_ID = 'fb_content_id';
const PARAM_CONTENT_TYPE = 'fb_content_type';
const PARAM_CURRENCY = 'fb_currency';
const PARAM_REGISTRATION_METHOD = 'fb_registration_method';

/** @type {Promise<boolean> | null} */
let initPromise = null;

function ensureFbqStub() {
  if (typeof window === 'undefined' || window.fbq) return;

  const queue = [];
  const fbq = function (...args) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }
    queue.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = queue;
  window.fbq = fbq;
  window._fbq = fbq;
}

/**
 * Load Meta Pixel script and fire initial PageView.
 * @param {string} [pixelId=FACEBOOK_PIXEL_ID]
 * @returns {Promise<boolean>}
 */
export function initFacebookPixel(pixelId = FACEBOOK_PIXEL_ID) {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (isOverlayRoute()) return Promise.resolve(false);

  const id = pixelId && String(pixelId).trim();
  if (!id) return Promise.resolve(false);

  if (window.__facebookPixelInitialized) return Promise.resolve(true);

  initPromise ??= new Promise((resolve) => {
    ensureFbqStub();

    const finish = (ok) => {
      if (ok) window.__facebookPixelInitialized = true;
      resolve(ok);
    };

    if (document.querySelector('script[data-tapeya-fb-pixel]')) {
      window.fbq?.('init', id);
      window.fbq?.('track', 'PageView');
      finish(true);
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.dataset.tapeyaFbPixel = 'true';
    script.onload = () => {
      window.fbq?.('init', id);
      window.fbq?.('track', 'PageView');
      finish(Boolean(window.fbq));
    };
    script.onerror = () => finish(false);
    document.head.appendChild(script);
  });

  return initPromise;
}

/**
 * @param {Record<string, unknown>} parameters
 * @param {number | undefined} valueToSum
 */
export function mapAppParamsToPixel(parameters = {}, valueToSum = undefined) {
  /** @type {Record<string, unknown>} */
  const pixel = {};

  const contentId = parameters[PARAM_CONTENT_ID];
  if (contentId != null && contentId !== '') {
    pixel.content_ids = [String(contentId)];
  }

  const contentType = parameters[PARAM_CONTENT_TYPE];
  if (contentType != null && contentType !== '') {
    pixel.content_type = String(contentType);
  }

  const currency = parameters[PARAM_CURRENCY];
  if (currency != null && currency !== '') {
    pixel.currency = String(currency);
  }

  const registrationMethod = parameters[PARAM_REGISTRATION_METHOD];
  if (registrationMethod != null && registrationMethod !== '') {
    pixel.registration_method = String(registrationMethod);
  }

  if (valueToSum != null && !Number.isNaN(Number(valueToSum))) {
    pixel.value = Number(valueToSum);
  }

  return pixel;
}

/**
 * @param {string} eventName
 * @param {Record<string, unknown>} [parameters]
 * @param {number | undefined} [valueToSum]
 */
export async function trackPixelEvent(eventName, parameters = {}, valueToSum = undefined) {
  if (isOverlayRoute()) return;

  const ready = await initFacebookPixel();
  if (!ready || !window.fbq) return;

  const pixelParams = mapAppParamsToPixel(parameters, valueToSum);
  const standardEvent = APP_EVENT_TO_PIXEL[eventName];

  if (standardEvent) {
    window.fbq('track', standardEvent, pixelParams);
  } else {
    window.fbq('trackCustom', eventName, pixelParams);
  }
}

/**
 * @param {number} amount
 * @param {string} currency
 * @param {Record<string, unknown>} [parameters]
 */
export async function trackPixelPurchase(amount, currency, parameters = {}) {
  if (isOverlayRoute()) return;

  const ready = await initFacebookPixel();
  if (!ready || !window.fbq) return;

  const pixelParams = {
    ...mapAppParamsToPixel(parameters),
    value: Number(amount),
    currency: String(currency),
  };

  window.fbq('track', 'Purchase', pixelParams);
}
