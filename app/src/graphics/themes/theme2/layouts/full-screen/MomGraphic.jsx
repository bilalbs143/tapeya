/**
 * Man of the Match full-screen announcement.
 */
import { PlayerNameFSGraphic } from './PlayerNameFSGraphic';

/**
 * @param {{ player: object, teams: Record<string, object>, sub?: string }} props
 */
export function MomGraphic({ player, teams, sub }) {
  if (!player) return null;

  return (
    <PlayerNameFSGraphic
      player={player}
      teams={teams}
      sub={sub}
      topLabel="PLAYER OF THE MATCH"
      statFields={[]}
      statValues={{}}
      careerLabel={player.awardLine ?? 'Match Award'}
      panelDetail={player.role}
    />
  );
}
