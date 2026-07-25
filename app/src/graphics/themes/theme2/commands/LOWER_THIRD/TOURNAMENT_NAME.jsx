import { toTournamentNameBundle } from '../../adapters/matchFixture.adapter';
import { MATCH_FIXTURE_DETAIL_SEMIBOLD } from '../../layouts/bars/fixtureBarLayout';
import { MatchFixtureBar } from '../../layouts/bars/MatchFixtureBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function TOURNAMENT_NAME({ isOverlay, tokens, ...props }) {
  const bundle = toTournamentNameBundle(props, tokens);
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
