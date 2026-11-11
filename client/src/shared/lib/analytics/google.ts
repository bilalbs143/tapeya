import { Capacitor } from '@capacitor/core';

import { GA_MEASUREMENT_ID } from './googleConfig';

let initPromise: Promise<boolean> | null = null;

function ensureGtagStub(): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') return;

  // Must push `arguments` (not a rest-array) — same as Google's snippet.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params -- GA requires the Arguments object
    window.dataLayer?.push(arguments);
  };
}

/** Load gtag.js and configure GA4. Web only — native uses Firebase Analytics. */
export function initGoogleAnalytics(measurementId: string = GA_MEASUREMENT_ID): Promise<boolean> {
  if (typeof window === 'undefined' || Capacitor.isNativePlatform()) {
    return Promise.resolve(false);
  }

  const id = measurementId.trim();
  if (!id) return Promise.resolve(false);
  if (window.__tapeyaGaInitialized) return Promise.resolve(true);

  initPromise ??= new Promise((resolve) => {
    ensureGtagStub();

    const finish = (ok: boolean) => {
      if (ok) window.__tapeyaGaInitialized = true;
      resolve(ok);
    };

    window.gtag?.('js', new Date());
    window.gtag?.('config', id, { send_page_view: false });

    if (document.querySelector('script[data-tapeya-ga]')) {
      finish(true);
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    script.dataset.tapeyaGa = 'true';
    script.onload = () => finish(Boolean(window.gtag));
    script.onerror = () => finish(false);
    document.head.appendChild(script);
  });

  return initPromise;
}

function swallow(promise: Promise<unknown>): Promise<void> {
  return promise.then(() => undefined).catch(() => undefined);
}

/** SPA page view (web). Prefer `logScreenView` from the app shell. */
export function logPageView(path: string, title?: string): Promise<void> {
  return swallow(
    initGoogleAnalytics().then((ready) => {
      if (!ready || !window.gtag) return;
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href,
      });
    })
  );
}

export function logGaEvent(eventName: string, params: Record<string, unknown> = {}): Promise<void> {
  return swallow(
    initGoogleAnalytics().then((ready) => {
      if (!ready || !window.gtag) return;
      window.gtag('event', eventName, params);
    })
  );
}
