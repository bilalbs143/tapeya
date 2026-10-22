import { useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { ErrorState } from '@/shared/ui/states';

import { MatchBroadcastGraphicsBody } from '../ui/MatchBroadcastGraphicsBody';
import { useBroadcastGraphics } from '../ui/useBroadcastGraphics';

/** White shell baseline (like Match settings). API from app graphic-session. */
export default function MatchBroadcastGraphicsPage() {
  const params = useParams();
  const matchId = Number(params.id);
  const valid = Number.isFinite(matchId) && matchId > 0;

  const flow = useBroadcastGraphics(matchId, valid);
  const { goBack, fixtureQuery, themesQuery, fixture } = flow;

  const header = <ScreenBar title="Broadcast Graphics" subtitle="Overlay for OBS · vMix · Wirecast" onBack={goBack} />;

  if (!valid) {
    return (
      <div className="bg-surface flex min-h-full flex-col px-4 py-8">
        <ErrorState title="Match Not Found" />
      </div>
    );
  }

  if (fixtureQuery.isError || (!fixtureQuery.isLoading && !fixture)) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="px-4 py-8">
          <ErrorState title="Couldn't Load This Match" onRetry={() => void fixtureQuery.refetch()} />
        </div>
      </div>
    );
  }

  if (themesQuery.isError) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="px-4 py-8">
          <ErrorState title="Couldn't Load Themes" onRetry={() => void themesQuery.refetch()} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface flex min-h-full flex-col">
      {header}
      <MatchBroadcastGraphicsBody flow={flow} />
    </div>
  );
}
