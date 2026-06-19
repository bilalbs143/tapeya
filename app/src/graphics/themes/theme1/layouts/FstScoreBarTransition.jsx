import { animation } from '../config';
import { ControllerBar, useFrameTransition } from '../primitives';
import { BroadcastShell } from '../primitives/BroadcastShell';

/**
 * Shared FST layout: full-screen flash header + live score bar.
 *
 * Processor supplies `props.event` for the flash. The bar frame omits `event` so
 * ControllerBar does not run EventSweep — keeps the lower third stable.
 *
 * @param {{
 *   Flash: import('react').ComponentType<{ compact?: boolean, fixed?: boolean }>,
 *   isOverlay?: boolean,
 *   bundle: { frame: object, teams: object, match: object } | null,
 *   revealDelayMs?: number,
 * }} props
 */
export function FstScoreBarTransition({ Flash, isOverlay, bundle, revealDelayMs = animation.revealDelayMs.boundary }) {
  const resolvedFrame = useFrameTransition(bundle?.frame ?? null, bundle?.frame ?? null, revealDelayMs);
  if (!bundle) return null;

  const { teams, match } = bundle;
  const barFrame = { ...resolvedFrame, event: null };

  return (
    <BroadcastShell stage="flash" header={() => (resolvedFrame?.event ? <Flash compact={false} fixed /> : null)}>
      <ControllerBar edgeToEdge={isOverlay} frame={barFrame} teams={teams} match={match} />
    </BroadcastShell>
  );
}
