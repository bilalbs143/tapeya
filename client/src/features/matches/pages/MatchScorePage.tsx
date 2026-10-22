import { Navigate, useParams } from 'react-router-dom';

import { ErrorState } from '@/shared/ui/states';

import { useGetScoringFixtureQuery } from '../api/matchesApi';
import { tossRecorded } from '../model/scoringFixture';
import { matchRoutes } from '../routes';
import { MatchScoreSkeleton } from '../ui/MatchScoreSkeleton';
import { ScoringDesk } from '../ui/ScoringDesk';

export default function MatchScorePage() {
  const params = useParams();
  const matchId = Number(params.id);
  const valid = Number.isFinite(matchId) && matchId > 0;
  const fixtureQuery = useGetScoringFixtureQuery(matchId, { skip: !valid });

  if (!valid) {
    return (
      <div className="px-4 py-8">
        <ErrorState title="Match Not Found" />
      </div>
    );
  }

  if (fixtureQuery.isLoading) {
    return <MatchScoreSkeleton />;
  }

  if (fixtureQuery.isError || !fixtureQuery.data) {
    return (
      <div className="px-4 py-8">
        <ErrorState title="Couldn't Load This Match" onRetry={() => void fixtureQuery.refetch()} />
      </div>
    );
  }

  if (!tossRecorded(fixtureQuery.data)) {
    return <Navigate to={matchRoutes.toss(matchId)} replace />;
  }

  return <ScoringDesk matchId={matchId} />;
}
