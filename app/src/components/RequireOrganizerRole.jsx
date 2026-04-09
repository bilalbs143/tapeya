import { Navigate, Outlet } from 'react-router-dom';

import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

function userHasOrganizerRole(user) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.slug === 'organizer');
}

/**
 * Allows nested routes only when the current user has the organizer role.
 * Waits for /me when roles are not yet on the store user.
 */
export function RequireOrganizerRole() {
  const user = useAppSelector(selectUser);
  const { data: meResponse, isLoading } = useGetMeQuery(undefined, {
    skip: !user?.id,
  });
  const profileUser = meResponse?.data ?? user;
  const roles = profileUser?.roles;
  const hasOrganizer = userHasOrganizerRole(profileUser);

  if (isLoading && !Array.isArray(roles)) {
    return null;
  }

  if (!hasOrganizer) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
