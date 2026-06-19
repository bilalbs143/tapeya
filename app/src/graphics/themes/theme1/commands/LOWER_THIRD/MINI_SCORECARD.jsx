import { toMiniScoreCardBundle } from '../../adapters/miniScoreCard.adapter';
import { MiniScoreCardLTBar } from '../../layouts/bars/MiniScoreCardLTBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function MINI_SCORECARD({ isOverlay, tokens, ...props }) {
  const bundle = toMiniScoreCardBundle(props, tokens);
  if (!bundle) return null;

  return (
    <BroadcastShell stage="bar">
      <MiniScoreCardLTBar miniScoreCard={bundle.miniScoreCard} teams={bundle.teams} edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
