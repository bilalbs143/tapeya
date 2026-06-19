import { toScoreBarBundle } from '../../adapters/scoreBar.adapter';
import { LowerThirdBar } from '../../layouts/bars/LowerThirdBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function PREVIOUS_OVER({ isOverlay, tokens, ...props }) {
  const bundle = toScoreBarBundle(props, tokens, { barVariant: 'previousOver' });
  if (!bundle) return null;
  const { frame, teams, match } = bundle;

  return (
    <BroadcastShell stage="bar">
      <LowerThirdBar edgeToEdge={isOverlay} frame={frame} teams={teams} match={match} barVariant="previousOver" />
    </BroadcastShell>
  );
}
