import { useMemo } from 'react';

import { settingsByKey, useGetPublicSystemSettingsQuery } from '@/shared/api/systemSettingsApi';

import { ANDROID_STORE_URL_KEY, IOS_STORE_URL_KEY, sanitizeAppStoreUrl, sanitizePlayStoreUrl } from './storeLinks';

export type StoreLinks = {
  iosStoreUrl: string;
  playStoreUrl: string;
};

/** Public system-settings App Store / Play Store listing URLs. */
export function useStoreLinks(): StoreLinks {
  const { data: rows } = useGetPublicSystemSettingsQuery();

  return useMemo(() => {
    const map = settingsByKey(rows);
    return {
      iosStoreUrl: sanitizeAppStoreUrl(map[IOS_STORE_URL_KEY]),
      playStoreUrl: sanitizePlayStoreUrl(map[ANDROID_STORE_URL_KEY]),
    };
  }, [rows]);
}
