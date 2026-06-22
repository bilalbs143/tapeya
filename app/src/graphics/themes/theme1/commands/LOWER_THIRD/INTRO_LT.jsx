import { toMatchFixtureBundle } from '../../adapters/matchFixture.adapter';
import { MATCH_FIXTURE_DETAIL_SEMIBOLD, MatchFixtureBar } from '../../layouts/bars/MatchFixtureBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function INTRO_LT({ isOverlay, tokens, ...props }) {
  const bundle = toMatchFixtureBundle(props, tokens, 'matchLabel');
  if (!bundle) return null;

  return (
    <BroadcastShell stage="bar" overlayInset="lt" isOverlay={isOverlay}>
      <MatchFixtureBar
        fixture={bundle.fixture}
        teams={bundle.teams}
        edgeToEdge={isOverlay}
        detailClassName={MATCH_FIXTURE_DETAIL_SEMIBOLD}
      />
    </BroadcastShell>
  );
}
