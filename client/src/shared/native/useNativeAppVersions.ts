import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';

import { settingsByKey, useGetPublicSystemSettingsQuery } from '@/shared/api/systemSettingsApi';
import { getPlatform, isNativePlatform } from '@/shared/platform/platform';

const CONFIGURED_VERSION_KEY = {
  ios: 'ios_app_store_version',
  android: 'android_play_store_version',
} as const;

/** Native drawer: installed app version vs public system-settings store version. */
export function useNativeAppVersions() {
  const platform = getPlatform();
  const isNativeMobile = isNativePlatform() && (platform === 'ios' || platform === 'android');

  const { data: rows, isSuccess } = useGetPublicSystemSettingsQuery(undefined, {
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

  let configuredVersion = '';
  if (isNativeMobile && isSuccess) {
    const map = settingsByKey(rows);
    const key = CONFIGURED_VERSION_KEY[platform];
    configuredVersion = (map[key] ?? '').trim();
  }

  return { isNativeMobile, installedVersion, configuredVersion };
}
