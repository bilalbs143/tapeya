import { useCallback, useEffect, useRef } from 'react';

import { useUpdateActivePlatformMutation } from '@/shared/api/activePlatformApi';
import { isDue, POLL_INTERVAL_MS, setLastSyncTime, shouldSyncPlatform } from '@/shared/lib/platformTracking';
import { getPlatform } from '@/shared/platform/platform';
import { selectAccessToken } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

/**
 * Tracks active platform (web / ios / android).
 * Syncs on login and registration (token change), then at most every 24h while authenticated.
 */
export function usePlatformTracking() {
  const accessToken = useAppSelector(selectAccessToken);
  const [updateActivePlatform] = useUpdateActivePlatformMutation();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTokenRef = useRef(accessToken);

  const sync = useCallback(() => {
    const platform = getPlatform();
    void updateActivePlatform(platform)
      .unwrap()
      .then(() => setLastSyncTime())
      .catch(() => {
        // best-effort — next login or poll retries
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
