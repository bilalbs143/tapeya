import { useRef } from 'react';

import { useLocation } from 'react-router-dom';

import {
  DIALOG_REMINDER_INTERVAL_MS,
  useIntervalDialogPrompt,
} from '@/hooks/useIntervalDialogPrompt';
import { calculateProfileStrength } from '@/lib/profileStrength';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/selectors';
import { store } from '@/store/store';

/**
 * While logged in with an incomplete profile, opens the profile reminder dialog
 * on a timer (unless another dialog is already open or the user is on /profile).
 */
export function ProfileStrengthReminderScheduler() {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userFromStore = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !userFromStore?.id,
  });
  const user = meResponse?.data ?? userFromStore;
  const strength = user ? calculateProfileStrength(user) : 100;

  const userRef = useRef(user);
  userRef.current = user;

  const enabled =
    isAuthenticated &&
    Boolean(user?.id) &&
    strength < 100 &&
    location.pathname !== '/profile';

  useIntervalDialogPrompt({
    intervalMs: DIALOG_REMINDER_INTERVAL_MS,
    enabled,
    getOpenDialogPayload: () => {
      const st = store.getState();
      if (!st.auth.isAuthenticated) {
        return null;
      }
      if (window.location.pathname === '/profile') {
        return null;
      }
      const u = userRef.current;
      if (!u?.id || calculateProfileStrength(u) >= 100) {
        return null;
      }
      return { key: 'profileStrengthReminder' };
    },
  });

  return null;
}
