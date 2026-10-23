import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { guestAuthPath } from '@/features/auth';

import { selectAuthHydrated, selectIsAuthenticated } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

/**
 * Product gate — every non-auth route waits for session hydrate.
 * Guests → register on first install, login on returning devices (`guestAuthPath`).
 */
export function RequireAuth() {
  const hydrated = useAppSelector(selectAuthHydrated);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;
  const [guestTo, setGuestTo] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || isAuthenticated) return;
    let cancelled = false;
    void guestAuthPath().then((to) => {
      if (!cancelled) setGuestTo(to);
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
