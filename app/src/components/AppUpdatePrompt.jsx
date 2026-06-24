import { useRef } from 'react';

import { DIALOG_REMINDER_INTERVAL_MS, useIntervalDialogPrompt } from '@/hooks/useIntervalDialogPrompt';
import { useNativeStoreVersionInfo } from '@/hooks/useNativeStoreVersionInfo';
import { shouldPromptAppUpdate } from '@/lib/appVersionCompare';

export function AppUpdatePrompt() {
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
      if (!c.isNativeMobile || !c.isSettingsReady || !c.hasSettingsRows) {
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
