import { toMatchFixtureBundle } from '../../adapters/matchFixture.adapter';
import { fixtureDetailStyle, MATCH_FIXTURE_DETAIL_TOSS } from '../../layouts/bars/fixtureBarLayout';
import { MatchFixtureBar } from '../../layouts/bars/MatchFixtureBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function TOSS_LT({ isOverlay, tokens, ...props }) {
  const bundle = toMatchFixtureBundle(props, tokens, 'decision');
  if (!bundle) return null;

  return (
    <BroadcastShell stage="bar" overlayInset="lt" isOverlay={isOverlay}>
      <MatchFixtureBar
        fixture={bundle.fixture}
        teams={bundle.teams}
        edgeToEdge={isOverlay}
        detailClassName={MATCH_FIXTURE_DETAIL_TOSS}
        detailStyle={fixtureDetailStyle('toss')}
      />
    </BroadcastShell>
  );
}
