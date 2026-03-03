import { SquadsTab as ScorecardSquadsTab } from '@/pages/scorecard/tabs/SquadsTab';

/**
 * Squads tab – same flow as Scorecard detail Squads tab:
 * list of teams (SquadTeams), then single team squad (SquadSingle) when ?team=id.
 */
export function SquadsTab({ tournamentId }) {
  return <ScorecardSquadsTab tournamentId={tournamentId} />;
}
