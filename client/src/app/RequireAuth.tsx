import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { guestAuthPath, guestAuthPathSync, useMeQuery } from '@/features/auth';

import { selectAuthHydrated, selectIsAuthenticated } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

function SessionLoading() {
  return <div className="text-muted p-8 text-sm">Loading Session…</div>;
}

/**
 * Product routes only. Guests never see the app shell.
 * Flow: hydrate → login/register → wait for `/me` → Outlet.
 */
export function RequireAuth() {
  const hydrated = useAppSelector(selectAuthHydrated);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;
  const [guestTo, setGuestTo] = useState(guestAuthPathSync);

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

  const { data: me, isLoading: meLoading } = useMeQuery(undefined, {
    skip: !hydrated || !isAuthenticated,
  });

  if (!hydrated) return <SessionLoading />;

  if (!isAuthenticated) {
    return <Navigate to={guestTo} replace state={{ returnTo }} />;
  }

  // Token present but `/me` not ready — keep blank (401 clears session in baseApi).
  if (meLoading && !me) return <SessionLoading />;

  return <Outlet />;
}
