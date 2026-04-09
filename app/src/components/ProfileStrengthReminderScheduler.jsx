import { useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';

import { calculateProfileStrength } from '@/lib/profileStrength';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/selectors';
import { openDialog } from '@/store/slices/commonSlice';
import { store } from '@/store/store';

const INTERVAL_MS = 2 * 60 * 1000;

/**
 * While logged in with an incomplete profile, opens the profile reminder dialog
 * every 2 minutes (unless another dialog is already open or the user is on /profile).
 */
export function ProfileStrengthReminderScheduler() {
  const dispatch = useAppDispatch();
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

  useEffect(() => {
    if (!isAuthenticated || !user?.id || strength >= 100) return undefined;
    if (location.pathname === '/profile') return undefined;

    const tick = () => {
      const st = store.getState();
      if (!st.auth.isAuthenticated) return;
      if (window.location.pathname === '/profile') return;
      if (st.common.dialogKey) return;
      const u = userRef.current;
      if (!u?.id || calculateProfileStrength(u) >= 100) return;
      dispatch(openDialog({ key: 'profileStrengthReminder' }));
    };

    const id = window.setInterval(tick, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [dispatch, isAuthenticated, user?.id, strength, location.pathname]);

  return null;
}
