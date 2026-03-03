import { useSearchParams } from 'react-router-dom';

import { SquadSingle } from './SquadSingle';
import { SquadTeams } from './SquadTeams';

export function SquadsTab({ tournamentId }) {
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('team');

  if (teamId) {
    return <SquadSingle tournamentId={tournamentId} teamId={teamId} />;
  }

  return <SquadTeams tournamentId={tournamentId} />;
}
