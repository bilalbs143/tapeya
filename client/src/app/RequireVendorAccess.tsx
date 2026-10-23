import { Navigate, Outlet } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { userHasVendorAccess, userProfilePath } from '@/entities/user';

import { APP_PATHS } from '@/shared/config/paths';
import { selectIsAuthenticated } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

/**
 * Gates seller hub + vendor management routes the same way as legacy `RequireVendorAccess`
 * (`user.vendor` present and not rejected). Apply stays outside this gate.
 */
export function RequireVendorAccess() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: me, isLoading, isError } = useMeQuery(undefined, { skip: !isAuthenticated });

  if (!isAuthenticated) {
    return <Navigate to={APP_PATHS.login} replace />;
  }

  if (isLoading && !me) {
    return <div className="text-muted p-8 text-sm">Loading Session…</div>;
  }

  if (isError || !userHasVendorAccess(me)) {
    return <Navigate to={me ? userProfilePath(me) : APP_PATHS.home} replace />;
  }

  return <Outlet />;
}
