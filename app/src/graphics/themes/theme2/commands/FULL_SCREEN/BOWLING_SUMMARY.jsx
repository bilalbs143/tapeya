import { toBowlingSummaryBundle } from '../../adapters/fullScreen.adapter';
import { BowlingSummaryGraphic } from '../../layouts/full-screen/BowlingSummaryGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function BOWLING_SUMMARY({ tokens, ...props }) {
  const resolved = toBowlingSummaryBundle(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <BowlingSummaryGraphic data={resolved.data} teams={resolved.teams} />
    </BroadcastShell>
  );
}
