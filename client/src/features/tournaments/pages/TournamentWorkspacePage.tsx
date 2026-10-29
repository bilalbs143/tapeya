import { useNavigate, useParams } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
import { ErrorState, Skeleton } from '@/shared/ui/states';

import { tournamentMetaLine } from '../model/schemas';
import { tournamentRoutes } from '../tournamentPaths';
import { TournamentWorkspaceBody, TournamentWorkspaceFooter } from '../ui/TournamentWorkspaceBody';
import { useTournamentWorkspace } from '../ui/useTournamentWorkspace';

/** Replaces the separate `/teams` list as the place to manage clubs. */
export default function TournamentWorkspacePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const tournamentId = Number(id);
  const validId = Number.isFinite(tournamentId) && tournamentId > 0;

  const flow = useTournamentWorkspace(tournamentId, validId);
  const { tournamentQuery, teamsQuery, tournament, empty } = flow;

  const listBack = () => navigate(tournamentRoutes.list());
  const ready =
    validId && !tournamentQuery.isLoading && !teamsQuery.isLoading && !tournamentQuery.isError && tournament != null;

  return (
    <DockScreen
      title={ready ? tournament.name : 'Workspace'}
      subtitle={ready ? tournamentMetaLine(tournament) : 'Teams, Squads and Fixtures'}
      onBack={listBack}
      action={
        ready && empty ? (
          <span className="bg-positive/16 text-positive-2 font-mono shrink-0 rounded-full px-[9px] py-[5px] text-4xs leading-normal font-bold tracking-[.06em] uppercase">
            {tournament.statusLabel ?? 'Active'}
          </span>
        ) : undefined
      }
      footer={ready ? <TournamentWorkspaceFooter flow={flow} tournament={tournament} /> : undefined}
    >
      {!validId ? (
        <div className="px-4 py-8">
          <ErrorState title="Tournament Not Found" description="That link doesn’t look right." />
        </div>
      ) : tournamentQuery.isLoading || teamsQuery.isLoading ? (
        <div className="flex flex-col gap-3 px-4 py-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-16 w-full rounded-card" />
          <Skeleton className="h-20 w-full rounded-card" />
        </div>
      ) : tournamentQuery.isError || !tournament ? (
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
      ) : (
        <TournamentWorkspaceBody flow={flow} tournament={tournament} />
      )}
    </DockScreen>
  );
}
