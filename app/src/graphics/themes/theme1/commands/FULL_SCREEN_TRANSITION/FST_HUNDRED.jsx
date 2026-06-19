import { toScoreBarBundle } from '../../adapters/scoreBar.adapter';
import { animation } from '../../config';
import { ControllerBar, HundredUpFlash, useFrameTransition } from '../../primitives';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function FST_HUNDRED({ isOverlay, tokens, ...props }) {
  const bundle = toScoreBarBundle(props, tokens);
  const resolvedFrame = useFrameTransition(bundle?.frame ?? null, bundle?.frame ?? null, animation.revealDelayMs.boundary);
  if (!bundle) return null;
  const { teams, match } = bundle;

  return (
    <BroadcastShell stage="flash" header={() => (resolvedFrame.event ? <HundredUpFlash compact={false} fixed /> : null)}>
      <ControllerBar edgeToEdge={isOverlay} frame={resolvedFrame} teams={teams} match={match} />
    </BroadcastShell>
  );
}
