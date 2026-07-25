import { toScoreBarBundle } from '../../adapters/scoreBar.adapter';
import { LowerThirdBar } from '../../layouts/bars/LowerThirdBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';
import { useLtDefaultZoneCRotation } from '../../primitives/useLtDefaultZoneCRotation';

export default function LT_DEFAULT({ isOverlay, tokens, ...props }) {
  const bundle = toScoreBarBundle(props, tokens, {});
  const zoneCPanel = useLtDefaultZoneCRotation(props, bundle?.frame ?? null);

  if (!bundle) return null;
  const { frame, teams, match } = bundle;

  return (
    <BroadcastShell stage="bar">
      <LowerThirdBar tokens={tokens} edgeToEdge={isOverlay} frame={frame} teams={teams} match={match} zoneCPanel={zoneCPanel} />
    </BroadcastShell>
  );
}
