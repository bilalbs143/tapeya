import { Navigate, Outlet } from 'react-router-dom';

import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

function userIsTournamentManager(user) {
  return Boolean(user?.capabilities?.tournament_manager);
}

/**
 * Allows nested routes only when the current user manages at least one tournament
 * (organizer_id / created_by / broadcast staff — see capabilities.tournament_manager).
 */
export function RequireOrganizerRole() {
  const user = useAppSelector(selectUser);
  const { data: meResponse, isLoading } = useGetMeQuery(undefined, {
    skip: !user?.id,
  });
  const profileUser = meResponse?.data ?? user;
  const hasCaps = profileUser?.capabilities != null;
  const allowed = userIsTournamentManager(profileUser);

  if (isLoading && !hasCaps) {
    return null;
  }

  if (!allowed) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
