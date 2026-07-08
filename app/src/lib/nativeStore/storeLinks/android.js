import { APP_STORE_NAME } from './appStore.js';
import { ANDROID_STORE_URL_KEY, ANDROID_STORE_VERSION_KEY, PLAY_STORE_NAME, sanitizePlayStoreUrl } from './playStore.js';

export { APP_STORE_NAME, PLAY_STORE_NAME, sanitizePlayStoreUrl };

const EMPTY_DOWNLOAD_LINKS = {
  appStoreUrl: '',
  appStoreName: APP_STORE_NAME,
  playStoreUrl: '',
  playStoreName: PLAY_STORE_NAME,
};

/** @param {string} url */
export function sanitizeStoreUrl(url) {
  return sanitizePlayStoreUrl(url);
}

/** @param {Record<string, string>} map */
export function getNativeStoreConfig(map) {
  return {
    configuredVersion: map[ANDROID_STORE_VERSION_KEY]?.trim() ?? '',
    storeUrl: sanitizePlayStoreUrl(map[ANDROID_STORE_URL_KEY]),
    storeName: PLAY_STORE_NAME,
  };
}

/**
 * Web-only helpers — stubbed for native builds so shared hooks (useWebStoreLinks)
 * can import from `@store-links` without breaking the Android Rollup graph.
 * Runtime callers skip when Capacitor.isNativePlatform().
 */
export function detectMobileWebStorePlatform() {
  return null;
}

/** @param {Record<string, string>} [_map] */
export function getAppDownloadLinks(_map) {
  return { ...EMPTY_DOWNLOAD_LINKS };
}

/** @param {ReturnType<typeof getAppDownloadLinks>} [links] */
export function resolveDownloadLinksForUserAgent(links) {
  return links ?? { ...EMPTY_DOWNLOAD_LINKS };
}

/** @param {string} url */
export function openExternalStoreUrl(url) {
  const safeUrl = sanitizeStoreUrl(url);
  if (!safeUrl) {
    return;
  }

  window.open(safeUrl, '_blank', 'noopener,noreferrer');
}
