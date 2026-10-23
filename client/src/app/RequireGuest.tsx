import { Navigate, Outlet } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { selectAuthHydrated, selectIsAuthenticated } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

/** Auth screens — bounce signed-in users home. */
export function RequireGuest() {
  const hydrated = useAppSelector(selectAuthHydrated);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!hydrated) {
    return <div className="text-muted p-8 text-sm">Loading Session…</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={APP_PATHS.home} replace />;
  }

  return <Outlet />;
}
