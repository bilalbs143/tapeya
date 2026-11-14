import { APP_STORE_NAME, openExternalStoreUrl, PLAY_STORE_NAME } from '@/shared/native/storeLinks';
import { Button } from '@/shared/ui/Button';

import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './BaseDialog';

export type DownloadAppDialogProps = {
  appStoreUrl?: string | undefined;
  playStoreUrl?: string | undefined;
};

/** Hero / promo “get the app” sheet — iOS and Android store buttons when URLs exist. */
export function DownloadAppDialog({ appStoreUrl = '', playStoreUrl = '' }: DownloadAppDialogProps) {
  const iosUrl = appStoreUrl.trim();
  const androidUrl = playStoreUrl.trim();

  return (
    <>
      <DialogHeader>
        <DialogTitle>Get the Tapeya App</DialogTitle>
        <DialogDescription>
          Tapeya works best on mobile. Download the app for live streams, scoring, shop, and notifications.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <div className="flex w-full flex-col gap-2">
          {iosUrl ? (
            <Button type="button" className="w-full" onClick={() => openExternalStoreUrl(iosUrl)}>
              Download on {APP_STORE_NAME}
            </Button>
          ) : null}
          {androidUrl ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => openExternalStoreUrl(androidUrl)}
            >
              Download on {PLAY_STORE_NAME}
            </Button>
          ) : null}
        </div>
      </DialogFooter>
    </>
  );
}
