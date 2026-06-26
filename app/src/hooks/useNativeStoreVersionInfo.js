import { useEffect, useMemo, useState } from 'react';

import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { getStoreConfig } from '@native-store';

import { mapSystemSettingsByKey } from '@/lib/utils/settingsUtils';
import { useGetPublicSystemSettingsQuery } from '@/store/api/systemSettingsApi';

export function useNativeStoreVersionInfo(options = {}) {
  const { refetchOnAppResume = false } = options;

  const platform = Capacitor.getPlatform();
  const isNativeMobile = Capacitor.isNativePlatform() && (platform === 'ios' || platform === 'android');

  const { data: settingsRows, isSuccess, refetch } = useGetPublicSystemSettingsQuery(undefined, { skip: !isNativeMobile });

  const [installedVersion, setInstalledVersion] = useState('');

  useEffect(() => {
    if (!isNativeMobile) {
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const info = await App.getInfo();
        if (!cancelled) {
          setInstalledVersion(String(info?.version ?? '').trim());
        }
      } catch {
        if (!cancelled) {
          setInstalledVersion('');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNativeMobile]);

  useEffect(() => {
    if (!refetchOnAppResume || !isNativeMobile) {
      return undefined;
    }
    let handle;
    let cancelled = false;
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        refetch();
      }
    }).then((h) => {
      if (cancelled) {
        h?.remove?.();
      } else {
        handle = h;
      }
    });
    return () => {
      cancelled = true;
      handle?.remove?.();
    };
  }, [isNativeMobile, refetch, refetchOnAppResume]);

  const { configuredVersion, storeUrl, storeName } = useMemo(() => {
    if (!isNativeMobile || !isSuccess || !settingsRows?.length) {
      return { configuredVersion: '', storeUrl: '', storeName: '' };
    }
    const map = mapSystemSettingsByKey(settingsRows);
    return getStoreConfig(map);
  }, [isNativeMobile, isSuccess, settingsRows]);

  return {
    isNativeMobile,
    platform,
    installedVersion,
    isSettingsReady: isSuccess,
    settingsRows,
    configuredVersion,
    storeUrl,
    storeName,
    refetch,
  };
}
