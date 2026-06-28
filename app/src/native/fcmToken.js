import { Capacitor, registerPlugin } from '@capacitor/core';

const FcmToken = registerPlugin('FcmToken');

/** Raw APNs device tokens are 64-char hex strings; FCM tokens are much longer. */
export function isLikelyApnsToken(token) {
  return typeof token === 'string' && token.length <= 64 && /^[0-9a-fA-F]+$/.test(token);
}

/** @returns {Promise<string | null>} */
export async function getIosFcmToken() {
  if (Capacitor.getPlatform() !== 'ios') {
    return null;
  }

  try {
    const result = await FcmToken.getToken();
    const token = result?.value;

    if (!token || isLikelyApnsToken(token)) {
      return null;
    }

    return token;
  } catch {
    return null;
  }
}

/**
 * Wait until Firebase has the APNs token before requesting FCM.
 * @returns {Promise<boolean>}
 */
export async function waitForNativeApnsReady(maxAttempts = 30, delayMs = 500) {
  if (Capacitor.getPlatform() !== 'ios') {
    return false;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const info = await FcmToken.getDebugInfo();
      if (info?.hasApnsToken) {
        return true;
      }

      if (typeof info?.cachedFcmToken === 'string' && info.cachedFcmToken && !isLikelyApnsToken(info.cachedFcmToken)) {
        return true;
      }
    } catch {
      // native plugin not ready yet
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }
  }

  return false;
}

/**
 * FCM token may not be ready the instant APNs registration fires — retry briefly.
 * @returns {Promise<string | null>}
 */
export async function getIosFcmTokenWithRetry(maxAttempts = 20, delayMs = 1500) {
  if (Capacitor.getPlatform() === 'ios') {
    await waitForNativeApnsReady();
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const token = await getIosFcmToken();
    if (token) {
      return token;
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }
  }

  return null;
}

/**
 * @param {(token: string) => void | Promise<void>} callback
 * @returns {Promise<{ remove: () => Promise<void> }>}
 */
export function addIosFcmTokenRefreshListener(callback) {
  if (Capacitor.getPlatform() !== 'ios') {
    return Promise.resolve({ remove: async () => {} });
  }

  return FcmToken.addListener('tokenRefresh', async ({ value }) => {
    if (!value || isLikelyApnsToken(value)) {
      return;
    }

    await callback(value);
  });
}
