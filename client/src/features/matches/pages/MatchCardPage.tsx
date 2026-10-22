import { useParams } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { ScreenBar } from '@/shared/layout';
import { EmptyState, ErrorState } from '@/shared/ui/states';

import { FanShareButton } from '../ui/FanMatchHeader';
import { MatchCardBody } from '../ui/MatchCardBody';
import { MatchCardSkeleton } from '../ui/MatchScoreSkeleton';
import { useMatchCard } from '../ui/useMatchCard';

/** Pad and Action dock removed; Overs is a commentary feed. */
export default function MatchCardPage() {
  const { id: idParam } = useParams();
  const matchId = Number(idParam);
  const validId = Number.isFinite(matchId) && matchId > 0;

  const flow = useMatchCard(matchId, validId);
  const { navigate, fixtureQuery, fixture, chrome, showShare, share } = flow;

  const header = (
    <ScreenBar
      title={chrome.title}
      subtitle={chrome.subtitle || undefined}
      onBack={() => navigate(-1)}
      action={showShare ? <FanShareButton onClick={() => void share()} /> : undefined}
    />
  );

  if (!validId) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="px-4 py-8">
          <EmptyState title="Match Not Found" description="This scorecard link is no longer valid." />
        </div>
      </div>
    );
  }

  if (fixtureQuery.isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Match" onBack={() => navigate(-1)} />
        <MatchCardSkeleton />
      </div>
    );
  }

  if (fixtureQuery.isError || !fixture) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Match" onBack={() => navigate(-1)} />
        <div className="px-4 py-8">
          <ErrorState
            title="Couldn't Load This Match"
            description={getApiErrorMessage(fixtureQuery.error, 'Try again in a moment.')}
            onRetry={() => void fixtureQuery.refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface flex min-h-full flex-col">
      {header}
      <MatchCardBody flow={flow} fixture={fixture} />
    </div>
  );
}
