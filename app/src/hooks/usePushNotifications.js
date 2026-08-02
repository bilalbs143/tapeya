/**
 * Capacitor push notification lifecycle: permission, token registration, tap routing.
 * No-op on web — push is native-only in Phase 1.
 *
 * iOS: Capacitor returns a raw APNs token; we fetch the FCM registration token via FcmTokenPlugin.
 * Android: Capacitor registration event already provides an FCM token.
 */

import { useEffect, useRef } from 'react';

import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';

import { isSafeNotificationNavigatePath, normalizeAppPath } from '@/lib/deepLinks/deepLinkRegistry';
import { addIosFcmTokenRefreshListener, getIosFcmTokenWithRetry, isLikelyApnsToken } from '@/native/fcmToken';
import { isNative } from '@/platform/platform';
import { useRegisterDeviceTokenMutation } from '@/store/api/deviceTokenApi';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUserAndToken } from '@/store/selectors';

const TOKEN_STORAGE_KEY = 'tapeya_fcm_token';

/** @returns {string | null} */
export function getStoredPushToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** @param {string | null} token */
function setStoredPushToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * @param {ReturnType<typeof useRegisterDeviceTokenMutation>[0]} registerToken
 * @param {string} token
 * @returns {Promise<boolean>}
 */
async function syncDeviceTokenWithApi(registerToken, token) {
  const platform = Capacitor.getPlatform();
  if (platform !== 'android' && platform !== 'ios') {
    return false;
  }

  if (isLikelyApnsToken(token)) {
    return false;
  }

  setStoredPushToken(token);

  try {
    await registerToken({
      token,
      platform,
      app_version: import.meta.env.VITE_APP_VERSION || undefined,
    }).unwrap();
    return true;
  } catch {
    return false;
  }
}

/**
 * @returns {Promise<string | null>}
 */
async function resolvePushTokenForApi(registrationToken) {
  const platform = Capacitor.getPlatform();

  if (platform === 'ios') {
    return getIosFcmTokenWithRetry();
  }

  if (platform === 'android' && registrationToken && !isLikelyApnsToken(registrationToken)) {
    return registrationToken;
  }

  return null;
}

function routeFromPushData(navigate, data) {
  if (!data) return;

  if (typeof data.deep_link === 'string' && data.deep_link) {
    const path = normalizeAppPath(data.deep_link);
    if (isSafeNotificationNavigatePath(path)) {
      navigate(path);
      return;
    }
  }

  if (!data.type) return;

  switch (data.type) {
    case 'order_placed':
    case 'order_status_updated':
    case 'order_delivered':
      if (data.order_id) {
        navigate(`/shop/orders/${data.order_id}`);
      }
      break;
    case 'post_liked':
    case 'post_commented':
    case 'post_comment_reply':
    case 'post_mentioned':
    case 'post_reposted':
    case 'post_published':
      navigate('/notification-center');
      break;
    case 'user_followed':
      navigate('/notification-center');
      break;
    case 'manual_broadcast':
      navigate('/home');
      break;
    default:
      break;
  }
}

/**
 * Wire push notifications when the user is authenticated on a native platform.
 */
export function usePushNotifications() {
  const navigate = useNavigate();
  const { accessToken } = useAppSelector(selectAuthUserAndToken);
  const [registerToken] = useRegisterDeviceTokenMutation();
  const initializedRef = useRef(false);
  const setupInProgressRef = useRef(false);

  useEffect(() => {
    if (!isNative() || !accessToken) {
      initializedRef.current = false;
      return undefined;
    }

    if (initializedRef.current || setupInProgressRef.current) {
      return undefined;
    }

    let cancelled = false;
    /** @type {Array<{ remove: () => Promise<void> }>} */
    const listeners = [];

    const markSynced = () => {
      initializedRef.current = true;
    };

    const setup = async () => {
      setupInProgressRef.current = true;
      let apiSynced = false;

      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');

        const permission = await PushNotifications.checkPermissions();
        let receive = permission.receive;

        if (receive === 'prompt' || receive === 'prompt-with-rationale') {
          const requested = await PushNotifications.requestPermissions();
          receive = requested.receive;
        }

        if (receive !== 'granted') {
          return;
        }

        listeners.push(
          await addIosFcmTokenRefreshListener(async (token) => {
            if (cancelled) return;
            if (await syncDeviceTokenWithApi(registerToken, token)) {
              apiSynced = true;
              markSynced();
            }
          }),
        );

        // Listeners must be attached before register() or the token event may be missed.
        listeners.push(
          await PushNotifications.addListener('registration', async (tokenEvent) => {
            if (cancelled) return;

            const token = await resolvePushTokenForApi(tokenEvent.value);
            if (!token) return;

            if (await syncDeviceTokenWithApi(registerToken, token)) {
              apiSynced = true;
              markSynced();
            }
          }),
        );

        listeners.push(
          await PushNotifications.addListener('registrationError', () => {
            // permission denied or APNs misconfigured — silent fail
          }),
        );

        listeners.push(
          await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            const data = action.notification?.data;
            if (data) {
              routeFromPushData(navigate, data);
            }
          }),
        );

        await PushNotifications.register();

        // Re-login often reuses the same OS token without firing registration again.
        if (Capacitor.getPlatform() === 'ios') {
          const fcmToken = await getIosFcmTokenWithRetry();
          if (fcmToken && !cancelled && (await syncDeviceTokenWithApi(registerToken, fcmToken))) {
            apiSynced = true;
          }
        } else {
          const storedToken = getStoredPushToken();
          if (storedToken && !cancelled && (await syncDeviceTokenWithApi(registerToken, storedToken))) {
            apiSynced = true;
          }
        }

        if (!cancelled && apiSynced) {
          markSynced();
        }
      } catch {
        // plugin unavailable or misconfigured
      } finally {
        setupInProgressRef.current = false;
      }
    };

    const handleForeground = async () => {
      if (cancelled || Capacitor.getPlatform() !== 'ios' || initializedRef.current) return;

      const fcmToken = await getIosFcmTokenWithRetry(6, 1000);
      if (fcmToken && !cancelled && (await syncDeviceTokenWithApi(registerToken, fcmToken))) {
        markSynced();
      }
    };

    setup().then(() => {
      if (!cancelled && Capacitor.getPlatform() === 'ios') {
        import('@capacitor/app').then(({ App }) => {
          App.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
              void handleForeground();
            }
          }).then((l) => {
            listeners.push(l);
          });
        });
      }
    });

    return () => {
      cancelled = true;
      listeners.forEach((l) => l.remove().catch(() => {}));
    };
  }, [accessToken, navigate, registerToken]);
}
