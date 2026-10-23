import { getPlatform, isNativePlatform } from '@/shared/platform/platform';

/** Public system-settings keys for store listing URLs / versions (same as `app/`). */
export const IOS_STORE_URL_KEY = 'ios_app_store_url';
export const ANDROID_STORE_URL_KEY = 'android_play_store_url';
export const IOS_STORE_VERSION_KEY = 'ios_app_store_version';
export const ANDROID_STORE_VERSION_KEY = 'android_play_store_version';

export const APP_STORE_NAME = 'App Store';
export const PLAY_STORE_NAME = 'Play Store';

/** Accept only known App Store HTTPS hosts. */
export function sanitizeAppStoreUrl(url: string | null | undefined): string {
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

/** Accept only Play Store HTTPS hosts. */
export function sanitizePlayStoreUrl(url: string | null | undefined): string {
  if (!url) return '';
  try {
    const trimmed = String(url).trim();
    const u = new URL(trimmed);
    return u.hostname === 'play.google.com' ? trimmed : '';
  } catch {
    return '';
  }
}

export function toNativeAppStoreUrl(url: string): string {
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

export function toNativePlayStoreUrl(url: string): string {
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

export type NativeStoreConfig = {
  configuredVersion: string;
  storeUrl: string;
  storeName: string;
};

/** Platform store listing + configured version from public system-settings map. */
export function getNativeStoreConfig(
  map: Record<string, string>,
  platform: ReturnType<typeof getPlatform> = getPlatform()
): NativeStoreConfig {
  if (platform === 'ios') {
    return {
      configuredVersion: (map[IOS_STORE_VERSION_KEY] ?? '').trim(),
      storeUrl: sanitizeAppStoreUrl(map[IOS_STORE_URL_KEY]),
      storeName: APP_STORE_NAME,
    };
  }
  if (platform === 'android') {
    return {
      configuredVersion: (map[ANDROID_STORE_VERSION_KEY] ?? '').trim(),
      storeUrl: sanitizePlayStoreUrl(map[ANDROID_STORE_URL_KEY]),
      storeName: PLAY_STORE_NAME,
    };
  }
  return { configuredVersion: '', storeUrl: '', storeName: '' };
}

/** Open a sanitized App Store / Play Store URL in a new tab (web SideNav / hero). */
export function openExternalStoreUrl(url: string): void {
  const safe = sanitizeAppStoreUrl(url) || sanitizePlayStoreUrl(url);
  if (!safe || typeof window === 'undefined') return;
  window.open(safe, '_blank', 'noopener,noreferrer');
}

/**
 * Open the platform store listing — native deep link when on device, else new tab.
 * Same behaviour as `app/` `@native-store` / `@store-links`.
 */
export function openStoreUrl(url: string): void {
  const platform = getPlatform();
  if (platform === 'ios') {
    const safe = sanitizeAppStoreUrl(url);
    if (!safe) return;
    if (isNativePlatform()) {
      window.location.href = toNativeAppStoreUrl(safe);
      return;
    }
    openExternalStoreUrl(safe);
    return;
  }
  if (platform === 'android') {
    const safe = sanitizePlayStoreUrl(url);
    if (!safe) return;
    if (isNativePlatform()) {
      window.location.href = toNativePlayStoreUrl(safe);
      return;
    }
    openExternalStoreUrl(safe);
    return;
  }
  openExternalStoreUrl(url);
}
