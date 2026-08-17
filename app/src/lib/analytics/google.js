import { Capacitor } from '@capacitor/core';

import { isOverlayRoute } from '@/lib/isOverlayRoute';

import { GA_MEASUREMENT_ID } from './googleConfig';

const isNative = Capacitor.isNativePlatform();

/** @type {Promise<boolean> | null} */
let initPromise = null;

function ensureGtagStub() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') return;

  // Must push `arguments` (not a rest-array) — same as Google's snippet.
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
}

/**
 * Load gtag.js and configure GA4. Skips native (use Firebase / mobile streams) and overlay routes.
 * @param {string} [measurementId=GA_MEASUREMENT_ID]
 * @returns {Promise<boolean>}
 */
export function initGoogleAnalytics(measurementId = GA_MEASUREMENT_ID) {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (isNative || isOverlayRoute()) return Promise.resolve(false);

  const id = measurementId && String(measurementId).trim();
  if (!id) return Promise.resolve(false);

  if (window.__tapeyaGaInitialized) return Promise.resolve(true);

  initPromise ??= new Promise((resolve) => {
    ensureGtagStub();

    const finish = (ok) => {
      if (ok) window.__tapeyaGaInitialized = true;
      resolve(ok);
    };

    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: false });

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

function ensureInitialized() {
  if (isNative || isOverlayRoute()) return Promise.resolve(false);
  return initGoogleAnalytics();
}

function swallow(promise) {
  return promise.catch(() => undefined);
}

/**
 * SPA page view — call on route changes.
 * @param {string} path
 * @param {string} [title]
 */
export function logPageView(path, title) {
  return swallow(
    ensureInitialized().then((ready) => {
      if (!ready || !window.gtag) return;
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
        page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      });
    }),
  );
}

/**
 * @param {string} eventName
 * @param {Record<string, unknown>} [params]
 */
export function logGaEvent(eventName, params = {}) {
  return swallow(
    ensureInitialized().then((ready) => {
      if (!ready || !window.gtag) return;
      window.gtag('event', eventName, params);
    }),
  );
}
