import { useSyncExternalStore } from 'react';

/** Desk layout from 900px — boxed 9:16 with prev/next vs phone snap scroll. */
export function useReelsTabLayout() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia('(min-width: 900px)');
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(min-width: 900px)').matches,
    () => false
  );
}
