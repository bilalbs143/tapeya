import { toBatsmanMatchLt } from '../../adapters/player.adapter';
import { BatsmanMatchLTBar } from '../../layouts/bars/BatsmanMatchLTBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function BATSMAN_MATCH_LT({ isOverlay, tokens, ...props }) {
  const resolved = toBatsmanMatchLt(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="bar" overlayInset="stats" isOverlay={isOverlay}>
      <BatsmanMatchLTBar batter={resolved.batter} teams={resolved.teams} edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
