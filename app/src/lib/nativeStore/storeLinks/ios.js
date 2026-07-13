import { APP_STORE_NAME, IOS_STORE_URL_KEY, IOS_STORE_VERSION_KEY, sanitizeAppStoreUrl } from './appStore.js';
import { PLAY_STORE_NAME } from './playStore.js';

export { APP_STORE_NAME, PLAY_STORE_NAME, sanitizeAppStoreUrl };

const EMPTY_DOWNLOAD_LINKS = {
  appStoreUrl: '',
  appStoreName: APP_STORE_NAME,
  playStoreUrl: '',
  playStoreName: PLAY_STORE_NAME,
};

/** @param {string} url */
export function sanitizeStoreUrl(url) {
  return sanitizeAppStoreUrl(url);
}

/** @param {Record<string, string>} map */
export function getNativeStoreConfig(map) {
  return {
    configuredVersion: map[IOS_STORE_VERSION_KEY]?.trim() ?? '',
    storeUrl: sanitizeAppStoreUrl(map[IOS_STORE_URL_KEY]),
    storeName: APP_STORE_NAME,
  };
}

/**
 * Web-only helpers — stubbed for native builds so shared hooks (useWebStoreLinks)
 * can import from `@store-links` without breaking the iOS Rollup graph.
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
