import { useParams } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
import { ErrorState } from '@/shared/ui/states';

import { MatchBroadcastGraphicsBody, MatchBroadcastGraphicsFooter } from '../ui/MatchBroadcastGraphicsBody';
import { useBroadcastGraphics } from '../ui/useBroadcastGraphics';

/** White shell baseline (like Match settings). API from app graphic-session. */
export default function MatchBroadcastGraphicsPage() {
  const params = useParams();
  const matchId = Number(params.id);
  const valid = Number.isFinite(matchId) && matchId > 0;

  const flow = useBroadcastGraphics(matchId, valid);
  const { goBack, fixtureQuery, themesQuery, fixture, bootstrapping, readOnly } = flow;

  const showForm = valid && !fixtureQuery.isError && fixture != null && !themesQuery.isError && !bootstrapping;

  return (
    <DockScreen
      title="Broadcast Graphics"
      subtitle="Overlay for OBS · vMix · Wirecast"
      onBack={goBack}
      footer={showForm && !readOnly ? <MatchBroadcastGraphicsFooter flow={flow} /> : undefined}
    >
      {!valid ? (
        <div className="px-4 py-8">
          <ErrorState title="Match Not Found" />
        </div>
      ) : fixtureQuery.isError || (!fixtureQuery.isLoading && !fixture) ? (
        <div className="px-4 py-8">
          <ErrorState title="Couldn't Load This Match" onRetry={() => void fixtureQuery.refetch()} />
        </div>
      ) : themesQuery.isError ? (
        <div className="px-4 py-8">
          <ErrorState title="Couldn't Load Themes" onRetry={() => void themesQuery.refetch()} />
        </div>
      ) : (
        <MatchBroadcastGraphicsBody flow={flow} />
      )}
    </DockScreen>
  );
}
