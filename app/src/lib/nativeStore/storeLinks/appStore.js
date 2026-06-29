export const APP_STORE_NAME = 'App Store';

export const IOS_STORE_URL_KEY = 'ios_app_store_url';
export const IOS_STORE_VERSION_KEY = 'ios_app_store_version';

/** @param {string | undefined | null} url */
export function sanitizeAppStoreUrl(url) {
  if (!url) return '';
  try {
    const trimmed = String(url).trim();
    const u = new URL(trimmed);
    const allowed = u.hostname === 'apps.apple.com' || u.hostname === 'itunes.apple.com';
    return allowed ? trimmed : '';
  } catch {
    return '';
  }
}

/** @param {string} url */
export function toNativeAppStoreUrl(url) {
  try {
    const u = new URL(String(url).trim());
    if (u.hostname === 'apps.apple.com') {
      return url.replace('https://apps.apple.com', 'itms-apps://itunes.apple.com');
    }
  } catch {
    // fall through
  }
  return url;
}
