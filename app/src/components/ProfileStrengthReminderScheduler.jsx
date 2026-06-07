import { useRef } from 'react';

import { useLocation } from 'react-router-dom';

import { DIALOG_REMINDER_INTERVAL_MS, useIntervalDialogPrompt } from '@/hooks/useIntervalDialogPrompt';
import { calculateProfileStrength } from '@/lib/utils/playerUtils';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/selectors';
import { store } from '@/store/store';

/**
 * @returns {null | { key: 'profileStrengthReminder' }}
 */
function resolveProfileStrengthReminderPayload(pathname, { isAuthenticated, user }) {
  if (!isAuthenticated) {
    return null;
  }
  if (pathname === '/profile' || pathname.startsWith('/overlay/')) {
    return null;
  }
  if (!user?.id || calculateProfileStrength(user) >= 100) {
    return null;
  }

  return { key: 'profileStrengthReminder' };
}

/**
 * While logged in with an incomplete profile, opens the profile reminder dialog
 * on a timer (unless another dialog is already open, the user is on /profile,
 * or the route is the graphic overlay /overlay/:matchId).
 */
export function ProfileStrengthReminderScheduler() {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userFromStore = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !userFromStore?.id,
  });
  const user = meResponse?.data ?? userFromStore;

  const userRef = useRef(user);
  userRef.current = user;

  const enabled = resolveProfileStrengthReminderPayload(location.pathname, { isAuthenticated, user }) !== null;

  useIntervalDialogPrompt({
    intervalMs: DIALOG_REMINDER_INTERVAL_MS,
    enabled,
    getOpenDialogPayload: () => {
      const st = store.getState();

      return resolveProfileStrengthReminderPayload(window.location.pathname, {
        isAuthenticated: st.auth.isAuthenticated,
        user: userRef.current,
      });
    },
  });

  return null;
}
