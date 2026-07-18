import { useEffect, useState } from 'react';

import { lockScreenOrientation } from '@/native/screenOrientation';
import { isNative } from '@/platform/platform';

/**
 * Hard-locks the device orientation to match the selected broadcast orientation while the
 * go-live screen is mounted, then restores the app's portrait-first posture on leave.
 *
 * Locking the whole native view keeps the WebView chrome and the native camera preview surface
 * rotated together as one coherent unit (the preview re-syncs on the resulting `resize`), which
 * is why this is preferred over CSS-rotating only the DOM chrome for the broadcaster.
 *
 * @param {object} params
 * @param {string} [params.orientation] — resolved stream orientation ('portrait' | 'landscape')
 * @param {boolean} [params.enabled] — set false to skip locking (e.g. non-broadcast contexts)
 * @returns {boolean} true once the device is actually locked natively (false on web / fallback)
 */
export function useBroadcastOrientationLock({ orientation, enabled = true }) {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!enabled || !orientation || !isNative()) {
      setLocked(false);
      return undefined;
    }

    let cancelled = false;
    void (async () => {
      const ok = await lockScreenOrientation(orientation);
      if (!cancelled) {
        setLocked(ok);
      }
    })();

    return () => {
      cancelled = true;
      // Snap back to portrait so returning to the rest of the (portrait-first) app is deterministic.
      void lockScreenOrientation('portrait');
    };
  }, [orientation, enabled]);

  return locked;
}
