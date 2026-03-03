import { TeamsTab as ScorecardTeamsTab } from '@/pages/scorecard/tabs/TeamsTab';

/**
 * Teams tab – same view as Scorecard detail Teams tab.
 */
export function TeamsTab({ tournamentId }) {
  return <ScorecardTeamsTab tournamentId={tournamentId} />;
}
