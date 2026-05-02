import { useEffect, useRef } from 'react';

import { USER_APP_BROADCAST_EVENTS } from '@/config/broadcastEvents';
import { createEcho } from '@/config/reverb';
import { useGetMeQuery } from '@/store/api/authApi';
import { baseApi } from '@/store/api/baseApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';

/**
 * Subscribes to Laravel Reverb on `private-App.Models.User.{id}` when logged in.
 * Listens for each event in `USER_APP_BROADCAST_EVENTS` and invalidates the
 * Notifications list cache so the UI updates in real time.
 *
 * Also heals rehydrated sessions where the token exists but `user.id` was
 * missing — without a user id Echo can never join the private channel.
 */
export function useReverbNotifications() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth?.accessToken);
  const userFromStore = useAppSelector((s) => s.auth?.user);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });
  const meUser = meResponse?.data;
  const userId = meUser?.id ?? userFromStore?.id;
  const echoRef = useRef(null);

  useEffect(() => {
    if (!accessToken || !meUser?.id || userFromStore?.id != null) return;
    dispatch(updateUser(meUser));
  }, [accessToken, meUser, userFromStore?.id, dispatch]);

  useEffect(() => {
    if (!accessToken || userId == null || userId === '') {
      if (echoRef.current) {
        echoRef.current.disconnect();
        echoRef.current = null;
      }
      return undefined;
    }

    const echo = createEcho({ authToken: accessToken });
    if (!echo) return undefined;

    echoRef.current = echo;

    const invalidate = () => {
      dispatch(baseApi.util.invalidateTags([{ type: 'List', id: 'Notifications' }]));
    };

    const channel = echo.private(`App.Models.User.${userId}`);
    USER_APP_BROADCAST_EVENTS.forEach((eventName) => {
      channel.listen(eventName, invalidate);
    });

    return () => {
      echo.disconnect();
      echoRef.current = null;
    };
  }, [accessToken, userId, dispatch]);
}
