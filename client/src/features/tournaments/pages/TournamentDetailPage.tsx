import { Navigate, useParams } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
import { ErrorState, Skeleton } from '@/shared/ui/states';

import { parseTournamentIdParam, tournamentDetailShouldRedirectPublic } from '../lib/tournamentDetail';
import { tournamentRoutes } from '../tournamentPaths';
import { useTournamentDetail } from '../ui/useTournamentDetail';
import TournamentWorkspacePage from './TournamentWorkspacePage';

/**
 * `/tournaments/:id/workspace` — organizers land in workspace; others redirect to public `/tournaments/:id`.
 */

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tournamentId = parseTournamentIdParam(id);
  const { data, isLoading, isError, refetch, goBack } = useTournamentDetail(tournamentId);

  const ready = tournamentId != null && !isLoading && !isError && data != null;

  if (ready && tournamentDetailShouldRedirectPublic(data.canManage)) {
    return <Navigate to={tournamentRoutes.public(data.id)} replace />;
  }

  if (ready) {
    return <TournamentWorkspacePage />;
  }

  return (
    <DockScreen title="Tournament" subtitle={isLoading ? 'Loading Workspace' : undefined} onBack={goBack}>
      {tournamentId == null ? (
        <div className="px-4 py-8">
          <ErrorState title="Tournament Not Found" description="That link doesn’t look right." />
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-3 px-4 pt-3.5 pb-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full rounded-card" />
        </div>
      ) : (
        <div className="px-4 py-8">
          <ErrorState title="Couldn't Load Tournament" onRetry={() => void refetch()} />
        </div>
      )}
    </DockScreen>
  );
}
