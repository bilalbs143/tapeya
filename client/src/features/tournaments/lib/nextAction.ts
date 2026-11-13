import { APP_PATHS } from '@/shared/config/paths';

import type { Tournament } from '../model/schemas';
import { tournamentRoutes } from '../tournamentPaths';

export type TournamentNextAction = {
  kind: 'teams' | 'fixtures' | 'workspace' | 'done' | 'scoring';
  label: string;
  to: string;
};

/** One rule for hub card footers and workspace banners. Team attach lives on the workspace (`detail`); squad counts come from occupancy there. */

export function tournamentNextAction(t: Tournament): TournamentNextAction {
  if (t.hubSection === 'previous' || t.status === 'previous' || t.status === 'inactive') {
    return { kind: 'done', label: 'View Tournament', to: tournamentRoutes.public(t.id) };
  }

  const cap = t.teamCap;
  if (cap != null && t.teamsCount === 0) {
    return { kind: 'teams', label: 'Add the First Team', to: tournamentRoutes.detail(t.id) };
  }
  if (cap != null && t.teamsCount < cap) {
    const missing = cap - t.teamsCount;
    return {
      kind: 'teams',
      label: `Add ${missing} More Team${missing > 1 ? 's' : ''}`,
      to: tournamentRoutes.detail(t.id),
    };
  }
  if (t.matchesCount === 0) {
    return {
      kind: 'fixtures',
      label: 'Add the First Fixture',
      to: `${APP_PATHS.startMatch}?tournamentId=${t.id}`,
    };
  }
  return { kind: 'scoring', label: 'Score Match Day', to: APP_PATHS.matches };
}
