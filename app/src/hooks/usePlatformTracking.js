import { useCallback, useEffect, useRef } from 'react';

import { isDue, POLL_INTERVAL_MS, setLastSyncTime, shouldSyncPlatform } from '@/lib/platformTracking';
import { getPlatform } from '@/platform/platform';
import { useUpdateActivePlatformMutation } from '@/store/api/userApi';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/selectors';

/**
 * Tracks the user's active platform (web / ios / android).
 * Syncs on login/registration (token change), then at most once every 24 hours while authenticated.
 * Must be called inside RouterEffects (needs Redux + auth state).
 */
export function usePlatformTracking() {
  const accessToken = useAppSelector(selectAccessToken);
  const [updateActivePlatform] = useUpdateActivePlatformMutation();
  const timerRef = useRef(null);
  const prevTokenRef = useRef(accessToken);

  const sync = useCallback(() => {
    const platform = getPlatform();
    updateActivePlatform(platform)
      .unwrap()
      .then(() => setLastSyncTime())
      .catch(() => {
        // best-effort — login or next poll will retry
      });
  }, [updateActivePlatform]);

  useEffect(() => {
    if (!accessToken) {
      prevTokenRef.current = null;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const tokenChanged = accessToken !== prevTokenRef.current;
    prevTokenRef.current = accessToken;

    if (shouldSyncPlatform({ justLoggedIn: tokenChanged })) {
      sync();
    }

    timerRef.current = setInterval(() => {
      if (isDue()) sync();
    }, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [accessToken, sync]);
}
