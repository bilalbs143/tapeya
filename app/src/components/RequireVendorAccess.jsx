import { Navigate, Outlet } from 'react-router-dom';

import { resolveOwnProfilePath } from '@/lib/share';
import { userHasVendorAccess } from '@/lib/vendorAccess';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { FullScreenLoader } from '@/ui/Loader';

export function RequireVendorAccess() {
  const user = useAppSelector(selectUser);
  const { data: meResponse, isLoading } = useGetMeQuery(undefined, {
    skip: !user?.id,
  });
  const profileUser = meResponse?.data ?? user;

  if (isLoading && meResponse == null) {
    return <FullScreenLoader label="Checking access" />;
  }

  if (!userHasVendorAccess(profileUser)) {
    return <Navigate to={resolveOwnProfilePath(profileUser?.id)} replace />;
  }

  return <Outlet />;
}
