import { toScoreBarBundle } from '../../adapters/scoreBar.adapter';
import { LowerThirdBar } from '../../layouts/bars/LowerThirdBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function AT_STAGE({ isOverlay, tokens, ...props }) {
  const bundle = toScoreBarBundle(props, tokens, { barVariant: 'atStage' });
  if (!bundle) return null;
  const { frame, teams, match } = bundle;

  return (
    <BroadcastShell stage="bar">
      <LowerThirdBar tokens={tokens} edgeToEdge={isOverlay} frame={frame} teams={teams} match={match} barVariant="atStage" />
    </BroadcastShell>
  );
}
