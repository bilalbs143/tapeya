import { toPlayer } from '../../adapters/player.adapter';
import { PlayerNameLTBar } from '../../layouts/bars/PlayerNameLTBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function BOWLER_NAME_LT({ isOverlay, tokens, ...props }) {
  const resolved = toPlayer(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="bar">
      <PlayerNameLTBar player={resolved.player} teams={resolved.teams} edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
