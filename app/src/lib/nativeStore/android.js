import { PLAY_STORE_NAME, sanitizePlayStoreUrl, toNativePlayStoreUrl } from './storeLinks/playStore.js';

const OPENABLE_STORE_URL_PROTOCOLS = new Set(['http:', 'https:', 'market:']);

function isOpenableStoreUrl(value) {
  try {
    const u = new URL(String(value).trim());
    return OPENABLE_STORE_URL_PROTOCOLS.has(u.protocol);
  } catch {
    return false;
  }
}

export async function openStoreUrl(url) {
  const safeUrl = sanitizePlayStoreUrl(url);
  if (!safeUrl || !isOpenableStoreUrl(safeUrl)) {
    throw new Error(`Blocked or invalid URL: ${safeUrl || url}`);
  }

  const nativeUrl = toNativePlayStoreUrl(safeUrl);
  window.location.href = nativeUrl;
  return { platform: 'android', nativeUrl };
}

export { PLAY_STORE_NAME as STORE_NAME };
