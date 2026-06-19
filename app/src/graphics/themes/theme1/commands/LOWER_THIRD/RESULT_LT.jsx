import { toMatchFixtureBundle } from '../../adapters/matchFixture.adapter';
import { MATCH_FIXTURE_DETAIL_SEMIBOLD, MatchFixtureBar } from '../../layouts/bars/MatchFixtureBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function RESULT_LT({ isOverlay, tokens, ...props }) {
  const bundle = toMatchFixtureBundle(props, tokens, 'matchDetail');
  if (!bundle) return null;

  return (
    <BroadcastShell stage="bar">
      <MatchFixtureBar
        fixture={bundle.fixture}
        teams={bundle.teams}
        edgeToEdge={isOverlay}
        detailClassName={MATCH_FIXTURE_DETAIL_SEMIBOLD}
      />
    </BroadcastShell>
  );
}
