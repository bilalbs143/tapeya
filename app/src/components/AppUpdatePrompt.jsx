import { useEffect } from 'react';

import { useNativeStoreVersionInfo } from '@/hooks/useNativeStoreVersionInfo';
import { APP_UPDATE_DISMISS_STORAGE_KEY } from '@/lib/constants/appUpdate';
import { shouldPromptAppUpdate } from '@/lib/appVersionCompare';
import { useAppDispatch } from '@/store/hooks';
import { openDialog } from '@/store/slices/commonSlice';
import { store } from '@/store/store';

export function AppUpdatePrompt() {
  const dispatch = useAppDispatch();
  const {
    isNativeMobile,
    isSettingsReady,
    settingsRows,
    installedVersion,
    configuredVersion,
    storeUrl,
    storeName,
  } = useNativeStoreVersionInfo({ refetchOnAppResume: true });

  useEffect(() => {
    if (!isNativeMobile || !isSettingsReady || !settingsRows?.length) {
      return undefined;
    }
    const installed = installedVersion.trim();
    const configured = configuredVersion.trim();
    if (!installed || !configured) {
      return undefined;
    }
    if (!shouldPromptAppUpdate(installed, configured)) {
      return undefined;
    }
    if (sessionStorage.getItem(APP_UPDATE_DISMISS_STORAGE_KEY) === configured) {
      return undefined;
    }
    if (store.getState().common.dialogKey) {
      return undefined;
    }
    dispatch(
      openDialog({
        key: 'appUpdate',
        props: {
          storeUrl,
          storeName,
          installedLabel: installed,
          configuredLabel: configured,
        },
      }),
    );
  }, [
    configuredVersion,
    dispatch,
    installedVersion,
    isNativeMobile,
    isSettingsReady,
    settingsRows,
    storeName,
    storeUrl,
  ]);

  return null;
}

export default AppUpdatePrompt;
