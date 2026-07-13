import { useMemo } from 'react';

import { Capacitor } from '@capacitor/core';
import { detectMobileWebStorePlatform, getAppDownloadLinks, resolveDownloadLinksForUserAgent } from '@store-links';

import { mapSystemSettingsByKey } from '@/lib/utils/settingsUtils';
import { useGetPublicSystemSettingsQuery } from '@/store/api/systemSettingsApi';

export function useWebStoreLinks() {
  const isWeb = !Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'web';

  const { data: settingsRows, isSuccess } = useGetPublicSystemSettingsQuery(undefined, { skip: !isWeb });

  const links = useMemo(() => {
    if (!isWeb || !isSuccess || !settingsRows?.length) {
      return {
        appStoreUrl: '',
        appStoreName: '',
        playStoreUrl: '',
        playStoreName: '',
      };
    }

    return resolveDownloadLinksForUserAgent(getAppDownloadLinks(mapSystemSettingsByKey(settingsRows)));
  }, [isWeb, isSuccess, settingsRows]);

  const hasStoreLink = Boolean(links.appStoreUrl.trim() || links.playStoreUrl.trim());
  const isMobileWeb = detectMobileWebStorePlatform() !== null;
  const shouldPromptDownloadApp = isWeb && isMobileWeb;

  return {
    isWeb,
    isMobileWeb,
    shouldPromptDownloadApp,
    isSettingsReady: isSuccess,
    settingsRows,
    hasStoreLink,
    ...links,
  };
}
