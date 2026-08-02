import { toFallOfWicketsData } from '../../adapters/fallOfWickets.adapter';
import { FallOfWicketsLTBar } from '../../layouts/bars/FallOfWicketsGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function FOW({ isOverlay, tokens, ...props }) {
  const resolved = toFallOfWicketsData(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="bar">
      <FallOfWicketsLTBar data={resolved.data} teams={resolved.teams} edgeToEdge={isOverlay} mode="all" />
    </BroadcastShell>
  );
}
