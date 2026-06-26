import { useRef } from 'react';

import { useLocation } from 'react-router-dom';

import { DIALOG_REMINDER_INTERVAL_MS, useIntervalDialogPrompt } from '@/hooks/useIntervalDialogPrompt';
import { useNativeStoreVersionInfo } from '@/hooks/useNativeStoreVersionInfo';
import { shouldPromptAppUpdate } from '@/lib/appVersionCompare';
import { isAuthPath } from '@/lib/utils/routeUtils';

export function AppUpdatePrompt() {
  const location = useLocation();
  const onAuthPath = isAuthPath(location.pathname);

  const { isNativeMobile, isSettingsReady, settingsRows, installedVersion, configuredVersion, storeUrl, storeName } =
    useNativeStoreVersionInfo({ refetchOnAppResume: true });

  const ctxRef = useRef({
    isNativeMobile,
    isSettingsReady,
    hasSettingsRows: false,
    installedVersion,
    configuredVersion,
    storeUrl,
    storeName,
  });
  ctxRef.current = {
    isNativeMobile,
    isSettingsReady,
    hasSettingsRows: Boolean(settingsRows?.length),
    installedVersion,
    configuredVersion,
    storeUrl,
    storeName,
  };

  const installed = installedVersion.trim();
  const configured = configuredVersion.trim();
  const enabled =
    !onAuthPath &&
    isNativeMobile &&
    isSettingsReady &&
    Boolean(settingsRows?.length) &&
    Boolean(installed) &&
    Boolean(configured) &&
    Boolean(storeUrl.trim()) &&
    shouldPromptAppUpdate(installed, configured);

  useIntervalDialogPrompt({
    intervalMs: DIALOG_REMINDER_INTERVAL_MS,
    enabled,
    getOpenDialogPayload: () => {
      const c = ctxRef.current;
      if (!c.isNativeMobile || !c.isSettingsReady || !c.hasSettingsRows || isAuthPath(location.pathname)) {
        return null;
      }
      const inst = String(c.installedVersion ?? '').trim();
      const conf = String(c.configuredVersion ?? '').trim();
      const url = String(c.storeUrl ?? '').trim();
      if (!inst || !conf || !url || !shouldPromptAppUpdate(inst, conf)) {
        return null;
      }
      return {
        key: 'appUpdate',
        props: {
          storeUrl: c.storeUrl,
          storeName: c.storeName,
        },
      };
    },
  });

  return null;
}

export default AppUpdatePrompt;
