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
 * FCM token may not be ready the instant APNs registration fires — retry briefly.
 * @returns {Promise<string | null>}
 */
export async function getIosFcmTokenWithRetry(maxAttempts = 6, delayMs = 500) {
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
