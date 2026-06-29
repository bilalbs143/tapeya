import { APP_STORE_NAME, sanitizeAppStoreUrl, toNativeAppStoreUrl } from './storeLinks/appStore.js';

const OPENABLE_STORE_URL_PROTOCOLS = new Set(['http:', 'https:', 'itms-apps:', 'itms:']);

function isOpenableStoreUrl(value) {
  try {
    const u = new URL(String(value).trim());
    return OPENABLE_STORE_URL_PROTOCOLS.has(u.protocol);
  } catch {
    return false;
  }
}

export async function openStoreUrl(url) {
  const safeUrl = sanitizeAppStoreUrl(url);
  if (!safeUrl || !isOpenableStoreUrl(safeUrl)) {
    throw new Error(`Blocked or invalid URL: ${safeUrl || url}`);
  }

  const nativeUrl = toNativeAppStoreUrl(safeUrl);
  window.location.href = nativeUrl;
  return { platform: 'ios', nativeUrl };
}

export { APP_STORE_NAME as STORE_NAME };
