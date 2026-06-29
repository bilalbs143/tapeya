import { useRef } from 'react';

import { useLocation } from 'react-router-dom';

import { DIALOG_REMINDER_INTERVAL_MS, useIntervalDialogPrompt } from '@/hooks/useIntervalDialogPrompt';
import { useWebStoreLinks } from '@/hooks/useWebStoreLinks';
import { isWebDownloadAppBlockedPath } from '@/lib/utils/routeUtils';

export function DownloadAppPrompt() {
  const location = useLocation();
  const onBlockedPath = isWebDownloadAppBlockedPath(location.pathname);

  const { isWeb, isSettingsReady, settingsRows, hasStoreLink, appStoreUrl, appStoreName, playStoreUrl, playStoreName } =
    useWebStoreLinks();

  const ctxRef = useRef({
    isWeb,
    isSettingsReady,
    hasSettingsRows: false,
    hasStoreLink,
    appStoreUrl,
    appStoreName,
    playStoreUrl,
    playStoreName,
  });
  ctxRef.current = {
    isWeb,
    isSettingsReady,
    hasSettingsRows: Boolean(settingsRows?.length),
    hasStoreLink,
    appStoreUrl,
    appStoreName,
    playStoreUrl,
    playStoreName,
  };

  const enabled = !onBlockedPath && isWeb && isSettingsReady && Boolean(settingsRows?.length) && hasStoreLink;

  useIntervalDialogPrompt({
    intervalMs: DIALOG_REMINDER_INTERVAL_MS,
    enabled,
    getOpenDialogPayload: () => {
      const c = ctxRef.current;
      if (!c.isWeb || !c.isSettingsReady || !c.hasSettingsRows || !c.hasStoreLink) {
        return null;
      }
      if (isWebDownloadAppBlockedPath(location.pathname)) {
        return null;
      }

      return {
        key: 'downloadApp',
        props: {
          appStoreUrl: c.appStoreUrl,
          appStoreName: c.appStoreName,
          playStoreUrl: c.playStoreUrl,
          playStoreName: c.playStoreName,
        },
      };
    },
  });

  return null;
}

export default DownloadAppPrompt;
