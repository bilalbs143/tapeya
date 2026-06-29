export const PLAY_STORE_NAME = 'Play Store';

export const ANDROID_STORE_URL_KEY = 'android_play_store_url';
export const ANDROID_STORE_VERSION_KEY = 'android_play_store_version';

/** @param {string | undefined | null} url */
export function sanitizePlayStoreUrl(url) {
  if (!url) return '';
  try {
    const trimmed = String(url).trim();
    const u = new URL(trimmed);
    return u.hostname === 'play.google.com' ? trimmed : '';
  } catch {
    return '';
  }
}

/** @param {string} url */
export function toNativePlayStoreUrl(url) {
  try {
    const u = new URL(String(url).trim());
    if (u.hostname === 'play.google.com') {
      const id = u.searchParams.get('id');
      if (id) return `market://details?id=${id}`;
    }
  } catch {
    // fall through
  }
  return url;
}
