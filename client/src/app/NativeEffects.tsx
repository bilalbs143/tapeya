import { useEffect } from 'react';
import { App } from '@capacitor/app';

import { useAppDeepLink, usePushNotifications } from '@/features/notifications';

import { reapplyKeepAwake } from '@/shared/native/keepAwake';
import { orientationSession } from '@/shared/native/orientationSession';
import { isNativePlatform } from '@/shared/platform/platform';

/** Capacitor-only side effects that need router + auth context. Mount once under BrowserRouter (see AppProviders). */

export function NativeEffects() {
  useAppDeepLink();
  usePushNotifications();

  useEffect(() => {
    if (!isNativePlatform()) return undefined;

    void orientationSession.ensurePortraitBase();

    let removed = false;
    let handle: { remove: () => Promise<void> } | undefined;
    void App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        void orientationSession.reapply();
        void reapplyKeepAwake();
      }
    }).then((h) => {
      if (removed) {
        void h.remove();
        return;
      }
      handle = h;
    });

    return () => {
      removed = true;
      void handle?.remove();
    };
  }, []);

  // Web Wake Lock is released when the tab is hidden — re-request on visible if still held.
  useEffect(() => {
    if (isNativePlatform()) return undefined;
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reapplyKeepAwake();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return null;
}
