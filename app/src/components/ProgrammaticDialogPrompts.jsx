import { useCallback, useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';

import { useDialog } from '@/context/DialogContext';
import { useNativeStoreVersionInfo } from '@/hooks/useNativeStoreVersionInfo';
import { useWebStoreLinks } from '@/hooks/useWebStoreLinks';
import { shouldPromptAppUpdate } from '@/lib/appVersionCompare';
import {
  appUpdateReminderStorageKey,
  downloadAppReminderStorageKey,
  isDialogReminderCooldownElapsed,
  markDialogReminderShown,
  PROFILE_STRENGTH_REMINDER_COOLDOWN_MS,
  profileStrengthReminderStorageKey,
  REPEATING_DIALOG_REMINDER_COOLDOWN_MS,
} from '@/lib/dialogReminderCooldown';
import { calculateProfileStrength } from '@/lib/utils/playerUtils';
import {
  isDialogReminderBlockedPath,
  isProfileStrengthReminderBlockedPath,
  isWebDownloadAppBlockedPath,
} from '@/lib/utils/routeUtils';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/selectors';

/** Poll interval for repeating reminder dialogs (app update, download app). */
const REMINDER_INTERVAL_MS = REPEATING_DIALOG_REMINDER_COOLDOWN_MS;

/** Dialog keys opened automatically — not from explicit user taps. */
const PROGRAMMATIC_DIALOG_KEYS = {
  profileStrengthReminder: 'profileStrengthReminder',
  appUpdate: 'appUpdate',
  downloadApp: 'downloadApp',
};

const AUTO_DIALOG_KEYS = new Set(Object.values(PROGRAMMATIC_DIALOG_KEYS));

/**
 * @typedef {object} ProgrammaticDialogContext
 * @property {string} pathname
 * @property {object|null|undefined} user
 * @property {boolean} isNativeMobile
 * @property {boolean} isSettingsReady
 * @property {boolean} hasSettingsRows
 * @property {string} installedVersion
 * @property {string} configuredVersion
 * @property {string} storeUrl
 * @property {string} storeName
 * @property {boolean} isWeb
 * @property {boolean} hasStoreLink
 * @property {string} appStoreUrl
 * @property {string} appStoreName
 * @property {string} playStoreUrl
 * @property {string} playStoreName
 */

/**
 * @typedef {object} ProgrammaticDialogRule
 * @property {string} key
 * @property {(pathname: string) => boolean} isBlockedPath
 * @property {(ctx: ProgrammaticDialogContext) => null | { key: string, props?: object }}
 * @property {(ctx: ProgrammaticDialogContext, payload: { key: string, props?: object }) => boolean} [beforeOpen]
 */

/** Priority order: first eligible rule wins when no dialog is open. */
const PROGRAMMATIC_DIALOG_RULES = /** @type {ProgrammaticDialogRule[]} */ ([
  {
    key: PROGRAMMATIC_DIALOG_KEYS.profileStrengthReminder,
    isBlockedPath: isProfileStrengthReminderBlockedPath,
    resolve(ctx) {
      if (isProfileStrengthReminderBlockedPath(ctx.pathname)) {
        return null;
      }
      if (!ctx.user?.id || calculateProfileStrength(ctx.user) >= 100) {
        return null;
      }
      return { key: PROGRAMMATIC_DIALOG_KEYS.profileStrengthReminder };
    },
    beforeOpen(ctx) {
      const storageKey = profileStrengthReminderStorageKey(ctx.user?.id);
      if (!isDialogReminderCooldownElapsed(storageKey, PROFILE_STRENGTH_REMINDER_COOLDOWN_MS)) {
        return false;
      }
      markDialogReminderShown(storageKey);
      return true;
    },
  },
  {
    key: PROGRAMMATIC_DIALOG_KEYS.appUpdate,
    isBlockedPath: isDialogReminderBlockedPath,
    resolve(ctx) {
      if (
        !ctx.user?.id ||
        !ctx.isNativeMobile ||
        !ctx.isSettingsReady ||
        !ctx.hasSettingsRows ||
        isDialogReminderBlockedPath(ctx.pathname)
      ) {
        return null;
      }
      const installed = String(ctx.installedVersion ?? '').trim();
      const configured = String(ctx.configuredVersion ?? '').trim();
      const url = String(ctx.storeUrl ?? '').trim();
      if (!installed || !configured || !url || !shouldPromptAppUpdate(installed, configured)) {
        return null;
      }
      return {
        key: PROGRAMMATIC_DIALOG_KEYS.appUpdate,
        props: { storeUrl: ctx.storeUrl, storeName: ctx.storeName },
      };
    },
    beforeOpen(ctx) {
      if (!ctx.user?.id) {
        return false;
      }
      const storageKey = appUpdateReminderStorageKey(ctx.user.id);
      if (!isDialogReminderCooldownElapsed(storageKey, REPEATING_DIALOG_REMINDER_COOLDOWN_MS)) {
        return false;
      }
      markDialogReminderShown(storageKey);
      return true;
    },
  },
  {
    key: PROGRAMMATIC_DIALOG_KEYS.downloadApp,
    isBlockedPath: isWebDownloadAppBlockedPath,
    resolve(ctx) {
      if (
        !ctx.user?.id ||
        !ctx.isWeb ||
        !ctx.isSettingsReady ||
        !ctx.hasSettingsRows ||
        !ctx.hasStoreLink ||
        isWebDownloadAppBlockedPath(ctx.pathname)
      ) {
        return null;
      }
      return {
        key: PROGRAMMATIC_DIALOG_KEYS.downloadApp,
        props: {
          appStoreUrl: ctx.appStoreUrl,
          appStoreName: ctx.appStoreName,
          playStoreUrl: ctx.playStoreUrl,
          playStoreName: ctx.playStoreName,
        },
      };
    },
    beforeOpen(ctx) {
      if (!ctx.user?.id) {
        return false;
      }
      const storageKey = downloadAppReminderStorageKey(ctx.user.id);
      if (!isDialogReminderCooldownElapsed(storageKey, REPEATING_DIALOG_REMINDER_COOLDOWN_MS)) {
        return false;
      }
      markDialogReminderShown(storageKey);
      return true;
    },
  },
]);

/**
 * Single source of truth for all auto-open dialogs (profile reminder, app update, download app).
 *
 * Only runs while the user is logged in. Closes open reminder dialogs on logout or blocked routes.
 * To add a new auto-dialog: extend PROGRAMMATIC_DIALOG_KEYS, add a rule to PROGRAMMATIC_DIALOG_RULES,
 * and register the component in DialogManager.
 */
export function ProgrammaticDialogPrompts() {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userFromStore = useAppSelector(selectUser);
  const { closeDialog, dialogKey, openDialog } = useDialog();
  const dialogKeyRef = useRef(dialogKey);
  dialogKeyRef.current = dialogKey;

  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !userFromStore?.id,
  });
  const user = meResponse?.data ?? userFromStore;

  const {
    isNativeMobile,
    isSettingsReady: isNativeSettingsReady,
    settingsRows: nativeSettingsRows,
    installedVersion,
    configuredVersion,
    storeUrl,
    storeName,
  } = useNativeStoreVersionInfo({ refetchOnAppResume: true });

  const {
    isWeb,
    isSettingsReady: isWebSettingsReady,
    settingsRows: webSettingsRows,
    hasStoreLink,
    appStoreUrl,
    appStoreName,
    playStoreUrl,
    playStoreName,
  } = useWebStoreLinks();

  const context = /** @type {ProgrammaticDialogContext} */ ({
    pathname: location.pathname,
    user,
    isNativeMobile,
    isSettingsReady: isNativeMobile ? isNativeSettingsReady : isWebSettingsReady,
    hasSettingsRows: Boolean((isNativeMobile ? nativeSettingsRows : webSettingsRows)?.length),
    installedVersion,
    configuredVersion,
    storeUrl,
    storeName,
    isWeb,
    hasStoreLink,
    appStoreUrl,
    appStoreName,
    playStoreUrl,
    playStoreName,
  });

  const isReminderSettingsReady = isNativeMobile
    ? isNativeSettingsReady && Boolean(nativeSettingsRows?.length)
    : isWebSettingsReady && Boolean(webSettingsRows?.length);

  const contextRef = useRef(context);
  contextRef.current = context;

  const tryOpenProgrammaticDialog = useCallback(() => {
    if (!isAuthenticated || dialogKeyRef.current) {
      return;
    }

    const ctx = contextRef.current;

    for (const rule of PROGRAMMATIC_DIALOG_RULES) {
      if (rule.isBlockedPath(ctx.pathname)) {
        continue;
      }

      const payload = rule.resolve(ctx);
      if (!payload) {
        continue;
      }

      if (rule.beforeOpen && !rule.beforeOpen(ctx, payload)) {
        continue;
      }

      openDialog(payload.key, payload.props ?? {});
      return;
    }
  }, [isAuthenticated, openDialog]);

  useEffect(() => {
    if (!isAuthenticated && dialogKey && AUTO_DIALOG_KEYS.has(dialogKey)) {
      closeDialog();
    }
  }, [isAuthenticated, dialogKey, closeDialog]);

  useEffect(() => {
    if (!dialogKey || !AUTO_DIALOG_KEYS.has(dialogKey)) {
      return;
    }

    const rule = PROGRAMMATIC_DIALOG_RULES.find((r) => r.key === dialogKey);
    if (rule?.isBlockedPath(location.pathname)) {
      closeDialog();
    }
  }, [location.pathname, dialogKey, closeDialog]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const id = window.setInterval(tryOpenProgrammaticDialog, REMINDER_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isAuthenticated, tryOpenProgrammaticDialog]);

  useEffect(() => {
    if (isAuthenticated) {
      tryOpenProgrammaticDialog();
    }
  }, [isAuthenticated, tryOpenProgrammaticDialog, location.pathname, user?.id, isReminderSettingsReady, hasStoreLink]);

  return null;
}

export default ProgrammaticDialogPrompts;
