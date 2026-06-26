import { useCallback } from 'react';

import { openStoreUrl, STORE_NAME } from '@native-store';

import {
  DialogDescription,
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogSaveButton,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

export function AppUpdateDialog({ storeUrl = '', storeName = '' }) {
  const displayStoreName = storeName.trim() || STORE_NAME;

  const handleUpdate = useCallback(async () => {
    if (!storeUrl) return;
    try {
      await openStoreUrl(storeUrl);
    } catch {
      // Invalid or blocked URL — normal flow uses server-configured store links
    }
  }, [storeUrl]);

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Update Available</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <DialogDescription className="text-center text-[13px] leading-relaxed">
          A new version of Tapeya is available on the {displayStoreName}. Please update the app for a better experience.
        </DialogDescription>
      </DialogScrollBody>

      <DialogSaveButton onClick={handleUpdate}>Open in {displayStoreName}</DialogSaveButton>
    </>
  );
}

export default AppUpdateDialog;
