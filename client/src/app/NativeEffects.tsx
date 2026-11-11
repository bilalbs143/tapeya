import { useEffect } from 'react';
import { App } from '@capacitor/app';

import { useAppDeepLink, usePushNotifications } from '@/features/notifications';

import { reapplyAndroidSystemNavHidden, startAndroidSystemNavHidden } from '@/shared/native/androidSystemNav';
import { reapplyKeepAwake } from '@/shared/native/keepAwake';
import { orientationSession } from '@/shared/native/orientationSession';
import { getPlatform, isNativePlatform } from '@/shared/platform/platform';

/** Capacitor-only side effects that need router + auth context. Mount once under BrowserRouter (see AppProviders). */

export function NativeEffects() {
  useAppDeepLink();
  usePushNotifications();

  useEffect(() => {
    if (!isNativePlatform()) return undefined;

    void orientationSession.ensurePortraitBase();
    if (getPlatform() === 'android') void startAndroidSystemNavHidden();

    let removed = false;
    let handle: { remove: () => Promise<void> } | undefined;
    void App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        void orientationSession.reapply();
        void reapplyKeepAwake();
        if (getPlatform() === 'android') void reapplyAndroidSystemNavHidden();
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
