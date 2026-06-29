import { ANDROID_STORE_URL_KEY, ANDROID_STORE_VERSION_KEY, PLAY_STORE_NAME, sanitizePlayStoreUrl } from './playStore.js';

export { PLAY_STORE_NAME, sanitizePlayStoreUrl };

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

/** @param {string} url */
export function openExternalStoreUrl(url) {
  const safeUrl = sanitizeStoreUrl(url);
  if (!safeUrl) {
    return;
  }

  window.open(safeUrl, '_blank', 'noopener,noreferrer');
}
