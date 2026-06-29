import { useCallback } from 'react';

import { APP_STORE_NAME, openExternalStoreUrl, PLAY_STORE_NAME } from '@store-links';

import {
  DialogDescription,
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogSaveButton,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

export function DownloadAppDialog({
  appStoreUrl = '',
  appStoreName = APP_STORE_NAME,
  playStoreUrl = '',
  playStoreName = PLAY_STORE_NAME,
}) {
  const iosUrl = appStoreUrl.trim();
  const androidUrl = playStoreUrl.trim();

  const openAppStore = useCallback(() => {
    openExternalStoreUrl(iosUrl);
  }, [iosUrl]);

  const openPlayStore = useCallback(() => {
    openExternalStoreUrl(androidUrl);
  }, [androidUrl]);

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Get the Tapeya App</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <DialogDescription className="text-center text-[13px] leading-relaxed">
          Tapeya works best on mobile. Download the app for live streams, scoring, shop, and notifications.
        </DialogDescription>
      </DialogScrollBody>

      <div className="flex flex-col">
        {iosUrl ? <DialogSaveButton onClick={openAppStore}>Download on {appStoreName}</DialogSaveButton> : null}
        {androidUrl ? (
          <DialogSaveButton className={iosUrl ? 'border-t border-white/10' : ''} onClick={openPlayStore}>
            Download on {playStoreName}
          </DialogSaveButton>
        ) : null}
      </div>
    </>
  );
}

export default DownloadAppDialog;
