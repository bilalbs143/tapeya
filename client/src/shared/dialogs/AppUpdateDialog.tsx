import { APP_STORE_NAME, openStoreUrl } from '@/shared/native/storeLinks';
import { Button } from '@/shared/ui/Button';

import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './BaseDialog';

export type AppUpdateDialogProps = {
  storeUrl?: string | undefined;
  storeName?: string | undefined;
};

/** Native soft-update prompt — opens the configured App Store / Play Store listing. */
export function AppUpdateDialog({ storeUrl = '', storeName = '' }: AppUpdateDialogProps) {
  const displayStoreName = storeName.trim() || APP_STORE_NAME;

  function handleUpdate() {
    if (!storeUrl) return;
    openStoreUrl(storeUrl);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Update Available</DialogTitle>
        <DialogDescription>
          A new version of Tapeya is available on the {displayStoreName}. Please update the app for a better experience.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" onClick={handleUpdate} disabled={!storeUrl}>
          Open in {displayStoreName}
        </Button>
      </DialogFooter>
    </>
  );
}
