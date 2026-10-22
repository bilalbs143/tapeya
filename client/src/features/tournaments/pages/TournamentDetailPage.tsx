import { Navigate, useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
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

  if (tournamentId == null) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Tournament" onBack={goBack} />
        <div className="px-4 py-8">
          <ErrorState title="Tournament Not Found" description="That link doesn’t look right." />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Tournament" subtitle="Loading Workspace" onBack={goBack} />
        <div className="flex flex-col gap-3 px-4 pt-3.5 pb-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full rounded-card" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Tournament" onBack={goBack} />
        <div className="px-4 py-8">
          <ErrorState title="Couldn't Load Tournament" onRetry={() => void refetch()} />
        </div>
      </div>
    );
  }

  if (tournamentDetailShouldRedirectPublic(data.canManage)) {
    return <Navigate to={tournamentRoutes.public(data.id)} replace />;
  }

  return <TournamentWorkspacePage />;
}
