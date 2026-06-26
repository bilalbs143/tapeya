const STORE_NAME = 'Play Store';

const OPENABLE_STORE_URL_PROTOCOLS = new Set(['http:', 'https:', 'market:']);

function isOpenableStoreUrl(value) {
  try {
    const u = new URL(String(value).trim());
    return OPENABLE_STORE_URL_PROTOCOLS.has(u.protocol);
  } catch {
    return false;
  }
}

function toNativeStoreUrl(url) {
  try {
    const u = new URL(String(url).trim());
    if (u.hostname === 'play.google.com') {
      const id = u.searchParams.get('id');
      if (id) return `market://details?id=${id}`;
    }
  } catch {
    // fall through to original url
  }
  return url;
}

export function getStoreConfig(map) {
  return {
    configuredVersion: map.android_play_store_version?.trim() ?? '',
    storeUrl: map.android_play_store_url?.trim() ?? '',
    storeName: STORE_NAME,
  };
}

export async function openStoreUrl(url) {
  if (!url || !isOpenableStoreUrl(url)) {
    throw new Error(`Blocked or invalid URL: ${url}`);
  }

  const nativeUrl = toNativeStoreUrl(url);
  window.location.href = nativeUrl;
  return { platform: 'android', nativeUrl };
}

export { STORE_NAME };
