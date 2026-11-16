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
        <ErrorState page title="Match Not Found" />
      ) : fixtureQuery.isError || (!fixtureQuery.isLoading && !fixture) ? (
        <ErrorState page title="Couldn't Load This Match" onRetry={() => void fixtureQuery.refetch()} />
      ) : themesQuery.isError ? (
        <ErrorState page title="Couldn't Load Themes" onRetry={() => void themesQuery.refetch()} />
      ) : (
        <MatchBroadcastGraphicsBody flow={flow} />
      )}
    </DockScreen>
  );
}
