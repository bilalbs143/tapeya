import { useEffect, useRef } from 'react';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { USER_APP_BROADCAST_EVENTS } from '@/config/broadcastEvents';
import { getReverbClientConfig } from '@/config/reverb';
import { useGetMeQuery } from '@/store/api/authApi';
import { baseApi, getApiOrigin } from '@/store/api/baseApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';

/**
 * Subscribes to Laravel Reverb on `private-App.Models.User.{id}` when logged in.
 * Listens for each event in `USER_APP_BROADCAST_EVENTS` (see `BroadcastEventNames` on API).
 *
 * Calls GET /api/v1/me whenever a bearer token exists so we always have a user id for
 * the private channel and `/broadcasting/auth` (Echo), even if persisted `auth.user` lacked `id`.
 *
 * Config: `src/config/reverb.js` (host/port/scheme derived from `VITE_API_URL` / `baseApi` origin, like backoffice `environment.ts`).
 */
export function ReverbNotificationListener() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth?.accessToken);
  const userFromStore = useAppSelector((s) => s.auth?.user);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });
  const meUser = meResponse?.data;
  const userId = meUser?.id ?? userFromStore?.id;
  const echoRef = useRef(null);

  // Heal rehydrated sessions where token exists but `user.id` was missing (Echo would never connect).
  useEffect(() => {
    if (!accessToken || !meUser?.id || userFromStore?.id != null) {
      return;
    }
    dispatch(updateUser(meUser));
  }, [accessToken, meUser, userFromStore?.id, dispatch]);

  useEffect(() => {
    const reverb = getReverbClientConfig();
    if (!reverb.enabled) {
      return undefined;
    }

    if (!accessToken || userId == null || userId === '') {
      if (echoRef.current) {
        echoRef.current.disconnect();
        echoRef.current = null;
      }
      return undefined;
    }

    const origin = getApiOrigin();
    if (!origin) {
      return undefined;
    }

    const w = window;
    w.Pusher = Pusher;

    const echo = new Echo({
      broadcaster: 'reverb',
      key: reverb.appKey,
      wsHost: reverb.host,
      wsPort: reverb.port,
      wssPort: reverb.port,
      forceTLS: reverb.scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${origin}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    });

    echoRef.current = echo;

    const channel = echo.private(`App.Models.User.${userId}`);
    const invalidateNotifications = () => {
      dispatch(
        baseApi.util.invalidateTags([{ type: 'List', id: 'Notifications' }]),
      );
    };
    USER_APP_BROADCAST_EVENTS.forEach((eventName) => {
      channel.listen(eventName, invalidateNotifications);
    });

    return () => {
      echo.disconnect();
      echoRef.current = null;
    };
  }, [accessToken, userId, dispatch]);

  return null;
}
