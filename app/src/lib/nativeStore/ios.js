const STORE_NAME = 'App Store';

const OPENABLE_STORE_URL_PROTOCOLS = new Set(['http:', 'https:', 'itms-apps:', 'itms:']);

function isOpenableStoreUrl(value) {
  try {
    const u = new URL(String(value).trim());
    return OPENABLE_STORE_URL_PROTOCOLS.has(u.protocol);
  } catch {
    return false;
  }
}

function sanitizeStoreUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(String(url).trim());
    const allowed = u.hostname === 'apps.apple.com' || u.hostname === 'itunes.apple.com';
    return allowed ? String(url).trim() : '';
  } catch {
    return '';
  }
}

function toNativeStoreUrl(url) {
  try {
    const u = new URL(String(url).trim());
    if (u.hostname === 'apps.apple.com') {
      return url.replace('https://apps.apple.com', 'itms-apps://itunes.apple.com');
    }
  } catch {
    // fall through to original url
  }
  return url;
}

export function getStoreConfig(map) {
  return {
    configuredVersion: map.ios_app_store_version?.trim() ?? '',
    storeUrl: sanitizeStoreUrl(map.ios_app_store_url?.trim() ?? ''),
    storeName: STORE_NAME,
  };
}

export async function openStoreUrl(url) {
  const safeUrl = sanitizeStoreUrl(url);
  if (!safeUrl || !isOpenableStoreUrl(safeUrl)) {
    throw new Error(`Blocked or invalid URL: ${safeUrl || url}`);
  }

  window.location.href = toNativeStoreUrl(safeUrl);
  return { platform: 'ios', nativeUrl: toNativeStoreUrl(safeUrl) };
}

export { STORE_NAME };
