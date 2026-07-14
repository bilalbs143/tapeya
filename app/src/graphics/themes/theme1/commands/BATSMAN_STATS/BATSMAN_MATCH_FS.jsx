import { BROADCAST_NAME_STYLE } from '../../adapters/_shared';
import { toPlayer } from '../../adapters/player.adapter';
import { PlayerNameFSGraphic } from '../../layouts/full-screen/PlayerNameFSGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function BATSMAN_MATCH_FS({ tokens, ...props }) {
  const resolved = toPlayer(props, tokens, { nameStyle: BROADCAST_NAME_STYLE.standard });
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
