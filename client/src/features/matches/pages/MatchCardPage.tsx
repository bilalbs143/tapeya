import { useParams } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { DockScreen } from '@/shared/layout';
import { EmptyState, ErrorState } from '@/shared/ui/states';

import { FanLiveDock } from '../ui/FanLiveDock';
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
  const { navigate, fixtureQuery, fixture, chrome, showShare, share, showLiveDock, selectTab } = flow;

  const onBack = () => navigate(-1);
  const ready = validId && !fixtureQuery.isLoading && !fixtureQuery.isError && fixture != null;
  const title = ready ? chrome.title : 'Match';
  const subtitle = ready ? chrome.subtitle || undefined : undefined;

  return (
    <DockScreen
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      action={ready && showShare ? <FanShareButton onClick={() => void share()} /> : undefined}
      footer={
        ready && showLiveDock && fixture.stream != null ? (
          <FanLiveDock
            streamId={fixture.stream.id}
            homeShort={fixture.home?.short ?? 'HOME'}
            awayShort={fixture.away?.short ?? 'AWAY'}
            onOpenScorecard={() => selectTab('scorecard')}
          />
        ) : undefined
      }
    >
      {!validId ? (
        <div className="px-4 py-8">
          <EmptyState title="Match Not Found" description="This scorecard link is no longer valid." />
        </div>
      ) : fixtureQuery.isLoading ? (
        <MatchCardSkeleton />
      ) : fixtureQuery.isError || !fixture ? (
        <div className="px-4 py-8">
          <ErrorState
            title="Couldn't Load This Match"
            description={getApiErrorMessage(fixtureQuery.error, 'Try again in a moment.')}
            onRetry={() => void fixtureQuery.refetch()}
          />
        </div>
      ) : (
        <MatchCardBody flow={flow} fixture={fixture} />
      )}
    </DockScreen>
  );
}
