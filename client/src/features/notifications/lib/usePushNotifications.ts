import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { APP_PATHS } from '@/shared/config/paths';
import {
  dispatchDeepLinkNavigation,
  isSafeNotificationNavigatePath,
  normalizeAppPath,
  rewriteLegacyAppPath,
} from '@/shared/lib/deepLinks';
import {
  addPushNotificationActionListener,
  getDevicePushToken,
  getNativePushPlatform,
  type PushActionPayload,
  setStoredPushToken,
} from '@/shared/native/push';
import { isNativePlatform } from '@/shared/platform/platform';

import { useRegisterDeviceTokenMutation } from '../api/deviceTokenApi';

function routeFromPushData(
  data: PushActionPayload,
  navigate: (to: string, opts?: { replace?: boolean }) => void,
  currentPath: string
) {
  const go = (path: string) => {
    const next = rewriteLegacyAppPath(normalizeAppPath(path));
    if (!isSafeNotificationNavigatePath(next)) return;
    dispatchDeepLinkNavigation(navigate, next, { currentPath });
  };

  if (typeof data.deep_link === 'string' && data.deep_link) {
    go(data.deep_link);
    return;
  }

  if (!data.type) return;

  switch (data.type) {
    case 'order_placed':
    case 'order_status_updated':
    case 'order_delivered':
      if (data.vendor_order_id) go(`/seller/orders/${data.vendor_order_id}`);
      else if (data.order_id) go(`/shop/orders/${data.order_id}`);
      break;
    case 'live_stream_created': {
      const streamId = data.stream_id ?? data.streamId;
      if (streamId != null && String(streamId).trim() !== '') {
        go(`${APP_PATHS.liveBroadcast}/${streamId}`);
      } else {
        go(APP_PATHS.live);
      }
      break;
    }
    case 'post_liked':
    case 'post_commented':
    case 'post_comment_reply':
    case 'post_comment_liked':
    case 'post_mentioned':
    case 'post_reposted':
    case 'user_followed':
    case 'manual_broadcast':
      go(APP_PATHS.notifications);
      break;
    default:
      break;
  }
}

/** Native FCM token registration + push tap routing; no-op on web. */
export function usePushNotifications() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location.pathname);

  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  const { data: me } = useMeQuery();
  const [registerToken] = useRegisterDeviceTokenMutation();
  const authed = Boolean(me?.id);

  useEffect(() => {
    if (!isNativePlatform() || !authed) return undefined;

    let cancelled = false;
    let removeAction: (() => void) | undefined;

    void (async () => {
      const token = await getDevicePushToken();
      if (cancelled || !token) return;

      const platform = getNativePushPlatform();
      if (!platform) return;

      setStoredPushToken(token);
      try {
        await registerToken({
          token,
          platform,
          appVersion: import.meta.env.VITE_APP_VERSION as string | undefined,
        }).unwrap();
      } catch {
        // Keep the local token; retry on next mount / auth.
      }
    })();

    void addPushNotificationActionListener((data) => {
      routeFromPushData(data, navigate, locationRef.current);
    }).then((handle) => {
      if (cancelled) handle.remove();
      else removeAction = handle.remove;
    });

    return () => {
      cancelled = true;
      removeAction?.();
    };
  }, [authed, navigate, registerToken]);
}
