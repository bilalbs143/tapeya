import { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

import { useDialog } from '@/context/DialogContext';
import {
  isDialogReminderCooldownElapsed,
  markDialogReminderShown,
  PROFILE_STRENGTH_REMINDER_COOLDOWN_MS,
  profileStrengthReminderStorageKey,
} from '@/lib/dialogReminderCooldown';
import { calculateProfileStrength } from '@/lib/utils/playerUtils';
import { isProfileStrengthReminderBlockedPath } from '@/lib/utils/routeUtils';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/selectors';

/**
 * @returns {null | { key: 'profileStrengthReminder' }}
 */
function resolveProfileStrengthReminderPayload(pathname, { isAuthenticated, user }) {
  if (!isAuthenticated) {
    return null;
  }
  if (isProfileStrengthReminderBlockedPath(pathname)) {
    return null;
  }
  if (!user?.id || calculateProfileStrength(user) >= 100) {
    return null;
  }

  return { key: 'profileStrengthReminder' };
}

/**
 * While logged in with an incomplete profile, opens the profile reminder dialog
 * at most once per 24 hours (unless another dialog is already open, the user is
 * on /profile, auth pages (/login, /register, /otp), the graphic overlay
 * /overlay/:matchId, a live broadcast page, or live scoring).
 */
export function ProfileStrengthReminderScheduler() {
  const location = useLocation();
  const { closeDialog, dialogKey, openDialog } = useDialog();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userFromStore = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !userFromStore?.id,
  });
  const user = meResponse?.data ?? userFromStore;

  const eligible = resolveProfileStrengthReminderPayload(location.pathname, { isAuthenticated, user }) !== null;

  useEffect(() => {
    if (isProfileStrengthReminderBlockedPath(location.pathname) && dialogKey === 'profileStrengthReminder') {
      closeDialog();
    }
  }, [location.pathname, dialogKey, closeDialog]);

  useEffect(() => {
    if (!eligible || dialogKey) return;

    const payload = resolveProfileStrengthReminderPayload(location.pathname, { isAuthenticated, user });
    if (!payload) return;

    const storageKey = profileStrengthReminderStorageKey(user?.id);
    if (!isDialogReminderCooldownElapsed(storageKey, PROFILE_STRENGTH_REMINDER_COOLDOWN_MS)) {
      return;
    }

    markDialogReminderShown(storageKey);
    openDialog(payload.key, payload.props ?? {});
  }, [eligible, location.pathname, dialogKey, isAuthenticated, user, openDialog]);

  return null;
}
