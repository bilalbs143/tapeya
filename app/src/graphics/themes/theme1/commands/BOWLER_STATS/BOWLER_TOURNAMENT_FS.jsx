import { toPlayer } from '../../adapters/player.adapter';
import { PlayerNameFSGraphic } from '../../layouts/full-screen/PlayerNameFSGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function BOWLER_TOURNAMENT_FS({ tokens, ...props }) {
  const resolved = toPlayer(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <PlayerNameFSGraphic
        player={resolved.player}
        teams={resolved.teams}
        statFields={resolved.statFields}
        statValues={resolved.statValues}
        careerLabel={resolved.careerLabel}
        panelDetail={resolved.panelDetail}
        sub={resolved.sub}
      />
    </BroadcastShell>
  );
}
