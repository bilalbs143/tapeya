import { Navigate, Outlet } from 'react-router-dom';

import { userHasVendorAccess } from '@/lib/vendorAccess';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

export function RequireVendorAccess() {
  const user = useAppSelector(selectUser);
  const { data: meResponse, isLoading } = useGetMeQuery(undefined, {
    skip: !user?.id,
  });
  const profileUser = meResponse?.data ?? user;
  const hasCaps = profileUser?.capabilities != null;
  const allowed = userHasVendorAccess(profileUser);

  if (isLoading && !hasCaps) {
    return null;
  }

  if (!allowed) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}
