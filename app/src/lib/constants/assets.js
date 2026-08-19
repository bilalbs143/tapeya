/**
 * CDN bases for static app assets (icons, logos) served from the media CDN (`/app/...`).
 * Uploaded user media uses absolute URLs from the API — do not prefix those here.
 *
 * Call {@link setCdnPublicBaseUrl} from boot (main.jsx) before importing App so
 * module-level `${CLOUDFRONT_APP_BASE}/...` strings resolve to the configured CDN.
 */

/** Fallback CDN origin when settings have not loaded yet. */
export const DEFAULT_CDN_PUBLIC_BASE = 'https://cdn.tapeya.com';

export const DEFAULT_APP_ASSETS_BASE = `${DEFAULT_CDN_PUBLIC_BASE}/app`;

/** Public CDN origin (no trailing slash), e.g. https://cdn.tapeya.com */
export let CDN_PUBLIC_BASE = DEFAULT_CDN_PUBLIC_BASE;

/**
 * Static app asset base (`{CDN}/app`). Prefer importing this; updated at boot from settings.
 * @type {string}
 */
export let CLOUDFRONT_APP_BASE = DEFAULT_APP_ASSETS_BASE;

export let FIXTURE_BG_IMAGE = `${DEFAULT_APP_ASSETS_BASE}/images/background/fixture-bg.png`;

/**
 * @param {string | null | undefined} cdnPublicBaseUrl e.g. https://cdn.tapeya.com
 * @returns {string} effective CDN public base
 */
export function setCdnPublicBaseUrl(cdnPublicBaseUrl) {
  const normalized = normalizeCdnPublicBase(cdnPublicBaseUrl);
  if (!normalized) {
    CDN_PUBLIC_BASE = DEFAULT_CDN_PUBLIC_BASE;
    CLOUDFRONT_APP_BASE = DEFAULT_APP_ASSETS_BASE;
    FIXTURE_BG_IMAGE = `${DEFAULT_APP_ASSETS_BASE}/images/background/fixture-bg.png`;
    return CDN_PUBLIC_BASE;
  }
  CDN_PUBLIC_BASE = normalized;
  CLOUDFRONT_APP_BASE = `${normalized}/app`;
  FIXTURE_BG_IMAGE = `${CLOUDFRONT_APP_BASE}/images/background/fixture-bg.png`;
  return CDN_PUBLIC_BASE;
}

/**
 * @param {string | null | undefined} url
 */
export function normalizeCdnPublicBase(url) {
  if (url == null || typeof url !== 'string') return '';
  let trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

export function getCdnPublicBase() {
  return CDN_PUBLIC_BASE;
}

export function getAppAssetsBase() {
  return CLOUDFRONT_APP_BASE;
}

export function getFixtureBgImage() {
  return FIXTURE_BG_IMAGE;
}

/** Shared × close icon path — used in Dialog, Toast, CountryPickerSheet, ActionMenuSheet. */
export const CLOSE_ICON_PATH =
  'M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z';

/** Max upload size for profile pictures (must match backend validation). */
export const MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024;

/** Max upload size for ID documents — image or PDF (must match backend validation). */
export const MAX_ID_DOCUMENT_BYTES = 10 * 1024 * 1024;
