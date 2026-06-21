import { toMatchSummaryLtBundle } from '../../adapters/matchSummary.adapter';
import { MatchSummaryLTBar } from '../../layouts/bars/MatchSummaryLTBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function MATCH_SUMMARY({ isOverlay, tokens, ...props }) {
  const bundle = toMatchSummaryLtBundle(props, tokens);
  if (!bundle) return null;

  return (
    <BroadcastShell stage="bar" overlayInset="wide" isOverlay={isOverlay}>
      <MatchSummaryLTBar summary={bundle.summary} teams={bundle.teams} edgeToEdge={isOverlay} />
    </BroadcastShell>
  );
}
