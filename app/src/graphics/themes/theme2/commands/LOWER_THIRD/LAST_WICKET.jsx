import { toLastWicketFsBatter } from '../../adapters/fallOfWickets.adapter';
import { LastWicketLTBar } from '../../layouts/bars/LastWicketLTBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function LAST_WICKET({ isOverlay, tokens, ...props }) {
  const resolved = toLastWicketFsBatter(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="bar" overlayInset="lt" isOverlay={isOverlay}>
      <LastWicketLTBar batter={resolved.batter} teams={resolved.teams} edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
