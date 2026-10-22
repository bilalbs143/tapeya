import { useMemo } from 'react';

import { settingsByKey, useGetPublicSystemSettingsQuery } from '@/shared/api/systemSettingsApi';
import { getPlatform } from '@/shared/platform/platform';

import type { HeroStoreLinks } from './heroSliderCta';

const IOS_STORE_URL_KEY = 'ios_app_store_url';
const ANDROID_STORE_URL_KEY = 'android_play_store_url';

/** Public system-settings store URLs for hero `downloadApp` / `appUpdate` CTAs. */
export function useHeroStoreLinks(): HeroStoreLinks {
  const platform = getPlatform();
  const { data: rows } = useGetPublicSystemSettingsQuery();

  return useMemo(() => {
    const map = settingsByKey(rows);
    return {
      platform,
      iosStoreUrl: (map[IOS_STORE_URL_KEY] ?? '').trim(),
      playStoreUrl: (map[ANDROID_STORE_URL_KEY] ?? '').trim(),
    };
  }, [platform, rows]);
}
