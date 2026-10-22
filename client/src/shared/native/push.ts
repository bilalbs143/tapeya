import { Capacitor, registerPlugin } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

import { getPlatform, isNativePlatform } from '@/shared/platform/platform';

/** Push-token façade — no direct Capacitor imports in features; iOS swaps APNs → FCM via `FcmToken`. §11 */

type FcmTokenPlugin = {
  getToken: () => Promise<{ token?: string }>;
};

const FcmToken = registerPlugin<FcmTokenPlugin>('FcmToken');

const TOKEN_STORAGE_KEY = 'tapeya_fcm_token';

export function getStoredPushToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredPushToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

/** Heuristic — APNs device tokens are 64 hex chars; FCM tokens are longer JWTs/strings. */
export function isLikelyApnsToken(token: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(token.trim());
}

async function getIosFcmToken(): Promise<string | null> {
  try {
    const result = await FcmToken.getToken();
    const token = result?.token?.trim();
    if (token && !isLikelyApnsToken(token)) return token;
  } catch {
    // Plugin missing or Firebase not configured yet.
  }
  return null;
}

/** Request permission and return backend-ready FCM token, or null on web/denial. */
export async function getDevicePushToken(): Promise<string | null> {
  if (!isNativePlatform()) return null;

  try {
    let permission = await PushNotifications.checkPermissions();
    if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
      permission = await PushNotifications.requestPermissions();
    }
    if (permission.receive !== 'granted') return null;

    await PushNotifications.register();

    const registrationToken = await new Promise<string | null>((resolve) => {
      let settled = false;
      const finish = (token: string | null) => {
        if (settled) return;
        settled = true;
        resolve(token);
      };

      void PushNotifications.addListener('registration', (event) => {
        finish(event.value?.trim() || null);
      });
      void PushNotifications.addListener('registrationError', () => {
        finish(null);
      });

      window.setTimeout(() => finish(null), 12_000);
    });

    if (getPlatform() === 'ios') {
      return (await getIosFcmToken()) ?? null;
    }

    if (registrationToken && !isLikelyApnsToken(registrationToken)) {
      return registrationToken;
    }

    return null;
  } catch {
    return null;
  }
}

export async function registerDevicePushToken(_token: string): Promise<void> {
  // Persistence/API sync lives in `usePushNotifications` (needs RTK + auth).
}

export type PushActionPayload = {
  deep_link?: string | undefined;
  type?: string | undefined;
  order_id?: string | number | undefined;
  vendor_order_id?: string | number | undefined;
  actor_id?: string | number | undefined;
  [key: string]: unknown;
};

export async function addPushNotificationActionListener(
  callback: (data: PushActionPayload) => void
): Promise<{ remove: () => void }> {
  if (!isNativePlatform()) return { remove: () => undefined };

  const handle = await PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
    const data = (event.notification?.data ?? {}) as PushActionPayload;
    callback(data);
  });

  return {
    remove: () => {
      void handle.remove();
    },
  };
}

export function getNativePushPlatform(): 'ios' | 'android' | null {
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android' ? platform : null;
}
