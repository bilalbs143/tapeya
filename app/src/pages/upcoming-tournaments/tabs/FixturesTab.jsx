import { MOCK_MATCHES } from '@/pages/scorecard/mockMatches';
import { ScheduleTab } from '@/pages/scorecard/tabs/ScheduleTab';

/**
 * Fixtures tab – same view as Scorecard detail Schedule tab (MatchCard list).
 * Uses scorecard ScheduleTab with upcoming matches; league set to tournamentId for links.
 */
export function FixturesTab({ tournamentId, startDate, endDate }) {
  const leagueId = tournamentId ?? 'upcoming';
  const matches = MOCK_MATCHES.filter((m) => m.status === 'upcoming').map(
    (m) => ({ ...m, league: leagueId }),
  );

  return <ScheduleTab matches={matches} />;
}
