import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';

import { settingsByKey, useGetPublicSystemSettingsQuery } from '@/shared/api/systemSettingsApi';
import { getPlatform, isNativePlatform } from '@/shared/platform/platform';

import { getNativeStoreConfig } from './storeLinks';

type UseNativeStoreVersionInfoOptions = {
  refetchOnAppResume?: boolean | undefined;
};

/**
 * Native drawer + app-update prompt: installed build vs public store version / listing URL.
 * Same data as `app/` `useNativeStoreVersionInfo`.
 */
export function useNativeStoreVersionInfo(options: UseNativeStoreVersionInfoOptions = {}) {
  const { refetchOnAppResume = false } = options;
  const platform = getPlatform();
  const isNativeMobile = isNativePlatform() && (platform === 'ios' || platform === 'android');

  const {
    data: settingsRows,
    isSuccess,
    refetch,
  } = useGetPublicSystemSettingsQuery(undefined, {
    skip: !isNativeMobile,
  });

  const [installedVersion, setInstalledVersion] = useState('');

  useEffect(() => {
    if (!isNativeMobile) return undefined;
    let cancelled = false;
    void App.getInfo()
      .then((info) => {
        if (!cancelled) setInstalledVersion(String(info.version ?? '').trim());
      })
      .catch(() => {
        if (!cancelled) setInstalledVersion('');
      });
    return () => {
      cancelled = true;
    };
  }, [isNativeMobile]);

  useEffect(() => {
    if (!refetchOnAppResume || !isNativeMobile) return undefined;
    let handle: { remove: () => void } | undefined;
    let cancelled = false;
    void App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) void refetch();
    }).then((h) => {
      if (cancelled) {
        void h.remove();
      } else {
        handle = h;
      }
    });
    return () => {
      cancelled = true;
      void handle?.remove();
    };
  }, [isNativeMobile, refetch, refetchOnAppResume]);

  const empty = { configuredVersion: '', storeUrl: '', storeName: '' };
  const config =
    isNativeMobile && isSuccess && settingsRows?.length
      ? getNativeStoreConfig(settingsByKey(settingsRows), platform)
      : empty;

  return {
    isNativeMobile,
    platform,
    installedVersion,
    isSettingsReady: isSuccess,
    settingsRows,
    configuredVersion: config.configuredVersion,
    storeUrl: config.storeUrl,
    storeName: config.storeName,
    refetch,
  };
}
