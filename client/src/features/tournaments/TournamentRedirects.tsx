import { Navigate, useParams, useSearchParams } from 'react-router-dom';

import { tournamentRoutes } from './tournamentPaths';

/** Old `/tournaments/:id/teams` → workspace. */

export function TeamsToWorkspaceRedirect() {
  const { id } = useParams<{ id: string }>();
  const tournamentId = Number(id);
  if (!Number.isFinite(tournamentId) || tournamentId <= 0) {
    return <Navigate to={tournamentRoutes.list()} replace />;
  }
  return <Navigate to={tournamentRoutes.detail(tournamentId)} replace />;
}

/** Old `/upcoming-tournaments/:id` → public hub (`?tab=fixtures` → `schedule`). */

export function UpcomingDetailRedirect() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tournamentId = Number(id);

  if (!Number.isFinite(tournamentId) || tournamentId <= 0) {
    return <Navigate to={tournamentRoutes.upcoming()} replace />;
  }

  const next = new URLSearchParams();
  const tab = searchParams.get('tab');
  if (tab === 'fixtures') next.set('tab', 'schedule');
  else if (tab === 'teams' || tab === 'squads' || tab === 'live' || tab === 'table' || tab === 'stats') {
    next.set('tab', tab);
  }
  const team = searchParams.get('team');
  if (team) next.set('team', team);

  const qs = next.toString();
  const to = qs ? `${tournamentRoutes.public(tournamentId)}?${qs}` : tournamentRoutes.public(tournamentId);

  return <Navigate to={to} replace />;
}
