import { Browser } from '@capacitor/browser';

const STORE_NAME = '';

export function getStoreConfig() {
  return { configuredVersion: '', storeUrl: '', storeName: STORE_NAME };
}

export async function openStoreUrl(url) {
  if (!url) {
    throw new Error('Missing store URL');
  }
  await Browser.open({ url });
  return { platform: 'web', nativeUrl: url };
}

export { STORE_NAME };
