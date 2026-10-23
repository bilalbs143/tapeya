import { useMemo } from 'react';

import { useStoreLinks } from '@/shared/native/useStoreLinks';
import { getPlatform } from '@/shared/platform/platform';

import type { HeroStoreLinks } from './heroSliderCta';

/** Public system-settings store URLs for hero `downloadApp` / `appUpdate` CTAs. */
export function useHeroStoreLinks(): HeroStoreLinks {
  const platform = getPlatform();
  const { iosStoreUrl, playStoreUrl } = useStoreLinks();

  return useMemo(
    () => ({
      platform,
      iosStoreUrl,
      playStoreUrl,
    }),
    [platform, iosStoreUrl, playStoreUrl]
  );
}
