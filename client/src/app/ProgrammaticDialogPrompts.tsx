import { useEffect, useEffectEvent } from 'react';
import { useLocation } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { APP_PATHS } from '@/shared/config/paths';
import { dialogStore } from '@/shared/dialogs/dialogStore';
import { shouldPromptAppUpdate } from '@/shared/lib/appVersionCompare';
import {
  appUpdateReminderStorageKey,
  isDialogReminderCooldownElapsed,
  markDialogReminderShown,
  REPEATING_DIALOG_REMINDER_COOLDOWN_MS,
} from '@/shared/lib/dialogReminderCooldown';
import { useNativeStoreVersionInfo } from '@/shared/native/useNativeStoreVersionInfo';
import { selectIsAuthenticated } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

const APP_UPDATE_KEY = 'appUpdate' as const;
const REMINDER_INTERVAL_MS = REPEATING_DIALOG_REMINDER_COOLDOWN_MS;

/** Auth screens only — home (`/`) may show the update prompt. */
function isDialogReminderBlockedPath(pathname: string): boolean {
  return pathname === APP_PATHS.login || pathname === APP_PATHS.register || pathname === APP_PATHS.otp;
}

function closeAppUpdateDialogs(): void {
  for (const entry of dialogStore.getSnapshot()) {
    if (entry.key === APP_UPDATE_KEY) {
      dialogStore.close(entry.id);
    }
  }
}

function hasOpenDialog(): boolean {
  return dialogStore.getSnapshot().length > 0;
}

/**
 * Auto-open soft prompts while logged in (app update on native).
 * Mirrors `app/` `ProgrammaticDialogPrompts` for the update rule.
 */
export function ProgrammaticDialogPrompts() {
  const { pathname } = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: me } = useMeQuery(undefined, { skip: !isAuthenticated });

  const { isNativeMobile, isSettingsReady, settingsRows, installedVersion, configuredVersion, storeUrl, storeName } =
    useNativeStoreVersionInfo({ refetchOnAppResume: true });

  const tryOpenAppUpdate = useEffectEvent(() => {
    if (!isAuthenticated || hasOpenDialog()) return;

    const userId = me?.id;
    if (
      !userId ||
      !isNativeMobile ||
      !isSettingsReady ||
      !settingsRows?.length ||
      isDialogReminderBlockedPath(pathname)
    ) {
      return;
    }

    const installed = installedVersion.trim();
    const configured = configuredVersion.trim();
    const url = storeUrl.trim();
    if (!installed || !configured || !url || !shouldPromptAppUpdate(installed, configured)) {
      return;
    }

    const storageKey = appUpdateReminderStorageKey(userId);
    if (!isDialogReminderCooldownElapsed(storageKey, REPEATING_DIALOG_REMINDER_COOLDOWN_MS)) {
      return;
    }

    markDialogReminderShown(storageKey);
    dialogStore.open(APP_UPDATE_KEY, { storeUrl, storeName });
  });

  useEffect(() => {
    if (!isAuthenticated) {
      closeAppUpdateDialogs();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isDialogReminderBlockedPath(pathname)) {
      closeAppUpdateDialogs();
    }
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const id = window.setInterval(() => tryOpenAppUpdate(), REMINDER_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) tryOpenAppUpdate();
  }, [
    isAuthenticated,
    pathname,
    me?.id,
    isNativeMobile,
    isSettingsReady,
    settingsRows?.length,
    installedVersion,
    configuredVersion,
    storeUrl,
  ]);

  return null;
}
