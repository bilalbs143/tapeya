import { APP_STORE_NAME, IOS_STORE_URL_KEY, IOS_STORE_VERSION_KEY, sanitizeAppStoreUrl } from './appStore.js';

export { APP_STORE_NAME, sanitizeAppStoreUrl };

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

/** @param {string} url */
export function openExternalStoreUrl(url) {
  const safeUrl = sanitizeStoreUrl(url);
  if (!safeUrl) {
    return;
  }

  window.open(safeUrl, '_blank', 'noopener,noreferrer');
}
