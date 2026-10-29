import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { useGetTournamentQuery, useGetTournamentTeamsQuery } from '../api/tournamentsApi';
import { tournamentRoutes } from '../tournamentPaths';
import { SquadTeamEditor } from '../ui/SquadTeamEditor';

/** Team chips + search + autosave via POST /teams/:id/squad; occupancy from GET /tournaments/:id/squad-occupancy. */
export default function SquadEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tournamentId = Number(id);
  const validId = Number.isFinite(tournamentId) && tournamentId > 0;

  const tournamentQuery = useGetTournamentQuery(tournamentId, { skip: !validId });
  const teamsQuery = useGetTournamentTeamsQuery(tournamentId, { skip: !validId });
  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);

  const teamIdFromUrl = searchParams.get('team');
  const selectedTeam = useMemo(() => {
    if (!teams.length) return null;
    if (teamIdFromUrl) {
      const fromUrl = teams.find((t) => String(t.id) === teamIdFromUrl);
      if (fromUrl) return fromUrl;
    }
    return teams[0] ?? null;
  }, [teams, teamIdFromUrl]);

  useEffect(() => {
    if (!validId || teamsQuery.isLoading || !selectedTeam) return;
    const nextId = String(selectedTeam.id);
    if (teamIdFromUrl === nextId) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('team', nextId);
        return next;
      },
      { replace: true }
    );
  }, [validId, teamsQuery.isLoading, selectedTeam, teamIdFromUrl, setSearchParams]);

  function selectTeam(nextId: number) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('team', String(nextId));
        return next;
      },
      { replace: true }
    );
  }

  const detailBack = () => navigate(tournamentRoutes.detail(tournamentId));
  const listBack = () => navigate(tournamentRoutes.list());

  if (
    validId &&
    !tournamentQuery.isLoading &&
    !teamsQuery.isLoading &&
    !tournamentQuery.isError &&
    tournamentQuery.data &&
    teams.length > 0 &&
    selectedTeam
  ) {
    return (
      <SquadTeamEditor
        key={selectedTeam.id}
        tournamentId={tournamentId}
        tournament={tournamentQuery.data}
        teams={teams}
        selectedTeam={selectedTeam}
        onSelectTeam={selectTeam}
        onBack={detailBack}
      />
    );
  }

  return (
    <DockScreen title="Squads" subtitle="Build Each Team’s XI" onBack={validId ? detailBack : listBack}>
      {!validId ? (
        <div className="px-4 py-8">
          <ErrorState title="Tournament Not Found" description="That link doesn’t look right." />
        </div>
      ) : tournamentQuery.isLoading || teamsQuery.isLoading ? (
        <div className="flex flex-col gap-3 px-4 py-6">
          <Skeleton className="h-10 w-full rounded-field" />
          <Skeleton className="h-24 w-full rounded-card" />
          <Skeleton className="h-40 w-full rounded-card" />
        </div>
      ) : tournamentQuery.isError || !tournamentQuery.data ? (
        <div className="px-4 py-8">
          <ErrorState title="Couldn't Load Tournament" onRetry={() => void tournamentQuery.refetch()} />
        </div>
      ) : !teams.length || !selectedTeam ? (
        <div className="px-4 py-8">
          <EmptyState
            title="No Team to Edit"
            description="Attach a team to this tournament first — the squad belongs to the team, not the tournament."
            action={
              <Button asChild>
                <Link to={tournamentRoutes.detail(tournamentId)}>Add Teams</Link>
              </Button>
            }
          />
        </div>
      ) : null}
    </DockScreen>
  );
}
