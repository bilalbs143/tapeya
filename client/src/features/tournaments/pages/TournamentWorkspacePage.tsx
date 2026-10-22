import { useNavigate, useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { ErrorState, Skeleton } from '@/shared/ui/states';

import { tournamentMetaLine } from '../model/schemas';
import { tournamentRoutes } from '../tournamentPaths';
import { TournamentWorkspaceBody } from '../ui/TournamentWorkspaceBody';
import { useTournamentWorkspace } from '../ui/useTournamentWorkspace';

/** Replaces the separate `/teams` list as the place to manage clubs. */
export default function TournamentWorkspacePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const tournamentId = Number(id);
  const validId = Number.isFinite(tournamentId) && tournamentId > 0;

  const flow = useTournamentWorkspace(tournamentId, validId);
  const { tournamentQuery, teamsQuery, tournament, empty } = flow;

  if (!validId) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar
          title="Workspace"
          subtitle="Teams, Squads and Fixtures"
          onBack={() => navigate(tournamentRoutes.list())}
        />
        <div className="px-4 py-8">
          <ErrorState title="Tournament Not Found" description="That link doesn’t look right." />
        </div>
      </div>
    );
  }

  if (tournamentQuery.isLoading || teamsQuery.isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar
          title="Workspace"
          subtitle="Teams, Squads and Fixtures"
          onBack={() => navigate(tournamentRoutes.list())}
        />
        <div className="flex flex-col gap-3 px-4 py-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-16 w-full rounded-card" />
          <Skeleton className="h-20 w-full rounded-card" />
        </div>
      </div>
    );
  }

  if (tournamentQuery.isError || !tournament) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar
          title="Workspace"
          subtitle="Teams, Squads and Fixtures"
          onBack={() => navigate(tournamentRoutes.list())}
        />
        <div className="px-4 py-8">
          <ErrorState
            title="Couldn't Load Workspace"
            description="Check your connection and try again."
            onRetry={() => {
              void tournamentQuery.refetch();
              void teamsQuery.refetch();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar
        title={tournament.name}
        subtitle={tournamentMetaLine(tournament)}
        onBack={() => navigate(tournamentRoutes.list())}
        action={
          empty ? (
            <span className="bg-positive/16 text-positive-2 font-mono shrink-0 rounded-full px-[9px] py-[5px] text-4xs leading-normal font-bold tracking-[.06em] uppercase">
              {tournament.statusLabel ?? 'Active'}
            </span>
          ) : null
        }
      />
      <TournamentWorkspaceBody flow={flow} tournament={tournament} />
    </div>
  );
}
