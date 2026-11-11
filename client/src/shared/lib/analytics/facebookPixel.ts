/**
 * Meta Pixel (web) — loads fbq and maps App Event names/params to standard Pixel events.
 */

import { FACEBOOK_PIXEL_ID } from './facebookConfig';

/** App Event name → Meta Pixel standard event name */
const APP_EVENT_TO_PIXEL: Record<string, string> = {
  fb_mobile_complete_registration: 'CompleteRegistration',
  fb_mobile_content_view: 'ViewContent',
  fb_mobile_add_to_cart: 'AddToCart',
  fb_mobile_initiated_checkout: 'InitiateCheckout',
  fb_mobile_purchase: 'Purchase',
};

/** App Event param → Pixel param (content_id becomes content_ids[]). */
const STRING_PARAM_TO_PIXEL: Record<string, string> = {
  fb_content_type: 'content_type',
  fb_currency: 'currency',
  fb_registration_method: 'registration_method',
};

let initPromise: Promise<boolean> | null = null;

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  push?: unknown;
  loaded?: boolean;
  version?: string;
  queue?: unknown[][];
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
    __facebookPixelInitialized?: boolean;
  }
}

function ensureFbqStub(): void {
  if (typeof window === 'undefined' || window.fbq) return;

  const queue: unknown[][] = [];
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }
    queue.push(args);
  } as FbqFn;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = queue;
  window.fbq = fbq;
  window._fbq = fbq;
}

function trackPageView(pixelId: string): void {
  window.fbq?.('init', pixelId);
  window.fbq?.('track', 'PageView');
}

/** Load Meta Pixel script and fire initial PageView. */
export function initFacebookPixel(pixelId: string = FACEBOOK_PIXEL_ID): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  const id = pixelId.trim();
  if (!id) return Promise.resolve(false);
  if (window.__facebookPixelInitialized) return Promise.resolve(true);

  initPromise ??= new Promise((resolve) => {
    ensureFbqStub();

    const finish = (ok: boolean) => {
      if (ok) window.__facebookPixelInitialized = true;
      resolve(ok);
    };

    if (document.querySelector('script[data-tapeya-fb-pixel]')) {
      trackPageView(id);
      finish(true);
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.dataset.tapeyaFbPixel = 'true';
    script.onload = () => {
      trackPageView(id);
      finish(Boolean(window.fbq));
    };
    script.onerror = () => finish(false);
    document.head.appendChild(script);
  });

  return initPromise;
}

export function mapAppParamsToPixel(
  parameters: Record<string, unknown> = {},
  valueToSum?: number
): Record<string, unknown> {
  const pixel: Record<string, unknown> = {};

  const contentId = parameters.fb_content_id;
  if (contentId != null && contentId !== '') {
    pixel.content_ids = [String(contentId)];
  }

  for (const [appKey, pixelKey] of Object.entries(STRING_PARAM_TO_PIXEL)) {
    const value = parameters[appKey];
    if (value != null && value !== '') {
      pixel[pixelKey] = String(value);
    }
  }

  if (valueToSum != null && !Number.isNaN(Number(valueToSum))) {
    pixel.value = Number(valueToSum);
  }

  return pixel;
}

export async function trackPixelEvent(
  eventName: string,
  parameters: Record<string, unknown> = {},
  valueToSum?: number
): Promise<void> {
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

export async function trackPixelPurchase(
  amount: number,
  currency: string,
  parameters: Record<string, unknown> = {}
): Promise<void> {
  const ready = await initFacebookPixel();
  if (!ready || !window.fbq) return;

  window.fbq('track', 'Purchase', {
    ...mapAppParamsToPixel(parameters),
    value: Number(amount),
    currency: String(currency),
  });
}
