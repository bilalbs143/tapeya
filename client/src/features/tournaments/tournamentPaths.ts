import { APP_PATHS } from '@/shared/config/paths';

export const tournamentRoutes = {
  list: () => APP_PATHS.tournaments,
  create: () => APP_PATHS.tournamentCreate,
  /** Organizer workspace — roster + stages. */
  detail: (id: number) => `${APP_PATHS.tournaments}/${id}/workspace`,
  squad: (id: number, teamId?: number) =>
    teamId != null ? `${APP_PATHS.tournaments}/${id}/squad?team=${teamId}` : `${APP_PATHS.tournaments}/${id}/squad`,
  /** Canonical public hub. */
  public: (id: number) => `${APP_PATHS.tournaments}/${id}`,
  upcoming: () => APP_PATHS.upcomingTournaments,
};
