import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { isReturningUser } from '@/features/auth';

import { APP_PATHS } from '@/shared/config/paths';
import { selectAuthHydrated, selectIsAuthenticated } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

/** Auth gate — wait for session rehydrate; first install → register, else login. */

export function RequireAuth() {
  const hydrated = useAppSelector(selectAuthHydrated);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;
  const [guestTo, setGuestTo] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || isAuthenticated) return;
    let cancelled = false;
    void isReturningUser().then((returning) => {
      if (!cancelled) setGuestTo(returning ? APP_PATHS.login : APP_PATHS.register);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated]);

  if (!hydrated) {
    return <div className="text-muted p-8 text-sm">Loading Session…</div>;
  }

  if (!isAuthenticated) {
    if (!guestTo) {
      return <div className="text-muted p-8 text-sm">Loading Session…</div>;
    }
    return <Navigate to={guestTo} replace state={{ returnTo }} />;
  }

  return <Outlet />;
}
