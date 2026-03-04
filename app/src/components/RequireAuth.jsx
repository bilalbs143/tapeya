import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/selectors';

/**
 * Renders child routes only when the user is authenticated.
 * Otherwise redirects to /login, preserving the attempted URL for redirect after login.
 */
export function RequireAuth() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
