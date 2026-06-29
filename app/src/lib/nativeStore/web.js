import { Browser } from '@capacitor/browser';
import { openExternalStoreUrl, sanitizeStoreUrl } from '@store-links';

export async function openStoreUrl(url) {
  const safeUrl = sanitizeStoreUrl(url);
  if (!safeUrl) {
    throw new Error('Missing or invalid store URL');
  }
  await Browser.open({ url: safeUrl });
  return { platform: 'web', nativeUrl: safeUrl };
}

export { openExternalStoreUrl };

export const STORE_NAME = '';
