import { toBowlerMatchLt } from '../../adapters/player.adapter';
import { BowlerMatchLTBar } from '../../layouts/bars/BowlerMatchLTBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function BOWLER_MATCH_LT({ isOverlay, tokens, ...props }) {
  const resolved = toBowlerMatchLt(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="bar">
      <BowlerMatchLTBar bowler={resolved.bowler} teams={resolved.teams} edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
