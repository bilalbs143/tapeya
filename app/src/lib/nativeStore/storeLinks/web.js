import { APP_STORE_NAME, IOS_STORE_URL_KEY, sanitizeAppStoreUrl } from './appStore.js';
import { ANDROID_STORE_URL_KEY, PLAY_STORE_NAME, sanitizePlayStoreUrl } from './playStore.js';

export { APP_STORE_NAME, PLAY_STORE_NAME, sanitizeAppStoreUrl, sanitizePlayStoreUrl };

/** Accept only known App Store or Play Store HTTPS URLs. */
export function sanitizeStoreUrl(url) {
  return sanitizeAppStoreUrl(url) || sanitizePlayStoreUrl(url);
}

/**
 * On mobile web, prefer a single store button. Desktop / unknown UA keeps both.
 * @returns {'ios' | 'android' | null}
 */
export function detectMobileWebStorePlatform() {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const ua = navigator.userAgent ?? '';
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);

  if (isIos) {
    return 'ios';
  }

  if (/Android/i.test(ua)) {
    return 'android';
  }

  return null;
}

/**
 * @param {Record<string, string>} map
 */
export function getAppDownloadLinks(map) {
  return {
    appStoreUrl: sanitizeAppStoreUrl(map[IOS_STORE_URL_KEY]),
    appStoreName: APP_STORE_NAME,
    playStoreUrl: sanitizePlayStoreUrl(map[ANDROID_STORE_URL_KEY]),
    playStoreName: PLAY_STORE_NAME,
  };
}

/**
 * @param {ReturnType<typeof getAppDownloadLinks>} links
 */
export function resolveDownloadLinksForUserAgent(links) {
  const ios = (links.appStoreUrl ?? '').trim();
  const android = (links.playStoreUrl ?? '').trim();
  const platform = detectMobileWebStorePlatform();

  if (platform === 'ios') {
    return {
      ...links,
      appStoreUrl: ios,
      playStoreUrl: ios ? '' : android,
    };
  }

  if (platform === 'android') {
    return {
      ...links,
      appStoreUrl: android ? '' : ios,
      playStoreUrl: android,
    };
  }

  return {
    ...links,
    appStoreUrl: ios,
    playStoreUrl: android,
  };
}

/** Unused on web builds; native update uses platform-specific @store-links entries. */
export function getNativeStoreConfig(map, platform) {
  if (platform === 'ios') {
    return {
      configuredVersion: map.ios_app_store_version?.trim() ?? '',
      storeUrl: sanitizeAppStoreUrl(map[IOS_STORE_URL_KEY]),
      storeName: APP_STORE_NAME,
    };
  }

  if (platform === 'android') {
    return {
      configuredVersion: map.android_play_store_version?.trim() ?? '',
      storeUrl: sanitizePlayStoreUrl(map[ANDROID_STORE_URL_KEY]),
      storeName: PLAY_STORE_NAME,
    };
  }

  return { configuredVersion: '', storeUrl: '', storeName: '' };
}

/** @param {string} url */
export function openExternalStoreUrl(url) {
  const safeUrl = sanitizeStoreUrl(url);
  if (!safeUrl) {
    return;
  }

  window.open(safeUrl, '_blank', 'noopener,noreferrer');
}
