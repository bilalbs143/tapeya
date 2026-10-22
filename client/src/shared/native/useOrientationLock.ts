import { useEffect, useId, useState } from 'react';

import { orientationSession, type SessionOrientation } from '@/shared/native/orientationSession';
import { isNativePlatform } from '@/shared/platform/platform';

/** Claim orientation on the session stack while mounted; false on web / plugin fail. */
export function useOrientationLock(orientation: SessionOrientation | null | undefined, enabled = true): boolean {
  const id = useId();
  const [locked, setLocked] = useState(false);
  const active = Boolean(enabled && orientation && isNativePlatform());

  useEffect(() => {
    if (!active || !orientation) return undefined;

    let cancelled = false;
    void orientationSession.push(id, orientation).then((ok) => {
      if (!cancelled) setLocked(ok);
    });

    return () => {
      cancelled = true;
      void orientationSession.pop(id);
    };
  }, [active, id, orientation]);

  return active ? locked : false;
}
