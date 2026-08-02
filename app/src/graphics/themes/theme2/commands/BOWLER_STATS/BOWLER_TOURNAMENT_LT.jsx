import { toBowlerTournamentLt } from '../../adapters/player.adapter';
import { BowlerTournamentLTBar } from '../../layouts/bars/BowlerTournamentLTBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function BOWLER_TOURNAMENT_LT({ isOverlay, tokens, ...props }) {
  const resolved = toBowlerTournamentLt(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="bar" overlayInset="lt" isOverlay={isOverlay}>
      <BowlerTournamentLTBar bowler={resolved.bowler} teams={resolved.teams} edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
