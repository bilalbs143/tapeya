import { toBatsmanTournamentLt } from '../../adapters/player.adapter';
import { BatsmanTournamentLTBar } from '../../layouts/bars/BatsmanTournamentLTBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function BATSMAN_TOURNAMENT_LT({ isOverlay, tokens, ...props }) {
  const resolved = toBatsmanTournamentLt(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="bar">
      <BatsmanTournamentLTBar batter={resolved.batter} teams={resolved.teams} edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
