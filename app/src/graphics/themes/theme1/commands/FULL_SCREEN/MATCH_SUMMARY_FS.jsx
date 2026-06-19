import { toMatchSummaryBundle } from '../../adapters/fullScreen.adapter';
import { MatchSummaryGraphic } from '../../layouts/full-screen/MatchSummaryGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function MATCH_SUMMARY_FS({ tokens, ...props }) {
  const resolved = toMatchSummaryBundle(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <MatchSummaryGraphic data={resolved.data} teams={resolved.teams} />
    </BroadcastShell>
  );
}
