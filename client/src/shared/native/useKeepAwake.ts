import { useEffect } from 'react';

import { acquireKeepAwake, releaseKeepAwake } from '@/shared/native/keepAwake';

/** Keep screen awake while enabled (ref-counted across players). */
export function useKeepAwake(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return undefined;
    void acquireKeepAwake();
    return () => {
      void releaseKeepAwake();
    };
  }, [enabled]);
}
