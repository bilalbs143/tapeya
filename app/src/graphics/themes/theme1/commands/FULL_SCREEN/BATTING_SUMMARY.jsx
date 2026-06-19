import { toBattingSummaryBundle } from '../../adapters/fullScreen.adapter';
import { BattingSummaryGraphic } from '../../layouts/full-screen/BattingSummaryGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function BATTING_SUMMARY({ tokens, ...props }) {
  const resolved = toBattingSummaryBundle(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <BattingSummaryGraphic data={resolved.data} teams={resolved.teams} />
    </BroadcastShell>
  );
}
