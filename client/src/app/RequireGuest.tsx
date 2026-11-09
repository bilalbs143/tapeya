import { Navigate, Outlet } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { selectAuthHydrated, selectIsAuthenticated } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

import { AppBootLoader } from './AppBootLoader';

/** Auth screens — bounce signed-in users home. */
export function RequireGuest() {
  const hydrated = useAppSelector(selectAuthHydrated);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!hydrated) {
    return <AppBootLoader label="Loading Session" />;
  }

  if (isAuthenticated) {
    return <Navigate to={APP_PATHS.home} replace />;
  }

  return <Outlet />;
}
