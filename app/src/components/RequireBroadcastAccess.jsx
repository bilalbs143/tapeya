import { Navigate, Outlet } from 'react-router-dom';

import { isNative } from '@/platform/platform';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

/**
 * Gates /live/go-live* the same way the sidebar's "Go Live" entry point is gated
 * (Capacitor.isNativePlatform() && can_broadcast) — without this, a web user or a native user
 * without broadcast access could open the pre-broadcast form directly by URL. The API still
 * enforces the real checks on submit either way; this only prevents a confusing dead-end UI.
 */
export function RequireBroadcastAccess() {
  const user = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, { skip: !user?.id });
  const profileUser = meResponse?.data ?? user;

  if (!isNative() || !profileUser?.can_broadcast) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
