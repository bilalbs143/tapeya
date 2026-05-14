import { useCallback } from 'react';

import { App } from '@capacitor/app';

import { APP_UPDATE_DISMISS_STORAGE_KEY } from '@/lib/constants/appUpdate';
import { useAppDispatch } from '@/store/hooks';
import { closeDialog } from '@/store/slices/commonSlice';
import { Button } from '@/ui/Button';
import {
  DialogDescription,
  DialogHeaderClose,
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

function isValidHttpUrl(value) {
  try {
    const u = new URL(String(value).trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

async function openStoreUrl(url) {
  if (!isValidHttpUrl(url)) {
    return;
  }
  await App.openUrl({ url: String(url).trim() });
}

export function AppUpdateDialog({
  storeUrl = '',
  storeName = '',
  installedLabel = '',
  configuredLabel = '',
}) {
  const dispatch = useAppDispatch();

  const recordDismiss = useCallback(() => {
    if (configuredLabel) {
      sessionStorage.setItem(APP_UPDATE_DISMISS_STORAGE_KEY, configuredLabel);
    }
  }, [configuredLabel]);

  const dismiss = useCallback(() => {
    recordDismiss();
    dispatch(closeDialog());
  }, [dispatch, recordDismiss]);

  const handleUpdate = useCallback(() => {
    openStoreUrl(storeUrl);
  }, [storeUrl]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeaderRow
        closeSlot={
          <DialogHeaderClose aria-label="Close" onClick={recordDismiss} />
        }
      >
        <DialogTitle className={dialogPrimaryTitleClass}>
          Update Available
        </DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col gap-2 px-5 pb-2">
        <DialogDescription className="text-center text-[13px] leading-relaxed">
          A new version of Tapeya ({configuredLabel}) is available on the{' '}
          {storeName}. You are on version {installedLabel}.
        </DialogDescription>
      </DialogScrollBody>

      <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 px-4 py-4">
        <Button
          type="button"
          variant="orangeDialog"
          size="dialog"
          onClick={handleUpdate}
        >
          Open in {storeName}
        </Button>
        <Button type="button" variant="black" size="dialog" onClick={dismiss}>
          Later
        </Button>
      </div>
    </div>
  );
}

export default AppUpdateDialog;
