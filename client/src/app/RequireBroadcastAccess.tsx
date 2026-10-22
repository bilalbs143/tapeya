import { Navigate, Outlet } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { APP_PATHS } from '@/shared/config/paths';
import { selectIsAuthenticated } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

/**
 * Gates `/live/go-live*` the same way the MainDrawer "Go Live" CTA is gated
 * (`can_broadcast`). Web is allowed so operators can create a stream and copy RTMP
 * for OBS; camera encode still requires the native plugin on device.
 * The API enforces the real check on create/start; this avoids a dead-end form.
 */
export function RequireBroadcastAccess() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: me, isLoading, isError } = useMeQuery(undefined, { skip: !isAuthenticated });

  if (!isAuthenticated) {
    return <Navigate to={APP_PATHS.login} replace />;
  }

  if (isLoading && !me) {
    return <div className="text-muted p-8 text-sm">Loading Session…</div>;
  }

  if (isError || !me?.canBroadcast) {
    return <Navigate to={APP_PATHS.home} replace />;
  }

  return <Outlet />;
}
