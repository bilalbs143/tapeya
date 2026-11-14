import { useSyncExternalStore } from 'react';

/** Matches Tailwind `tab:` (900px) — desk chrome vs phone chrome. */
const TAB_MQ = '(min-width: 900px)';

/**
 * True at the `tab` breakpoint. Use to mount a single layout branch instead of
 * dual CSS-hidden trees (two `<Outlet />`s would double-mount pages like Reels).
 */
export function useTabLayout(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(TAB_MQ);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia(TAB_MQ).matches,
    () => false
  );
}
