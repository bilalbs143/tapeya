import { useEffect, useMemo } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useDialog } from '@/context/DialogContext';
import {
  areTournamentTeamsComplete,
  canAddTournamentTeams,
  getTournamentTitle,
  mergeTournamentMeta,
  parseTournamentId,
} from '@/lib/utils/tournamentUtils';
import { useGetTournamentQuery, useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty } from '@/ui/ListState';
import { PageLoader } from '@/ui/Loader';

export default function TournamentCreateTeamIntro() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId } = useParams();
  const { openDialog } = useDialog();

  const tournamentFromState = location.state?.tournament ?? null;

  const tournamentIdNum = parseTournamentId(tournamentId, tournamentFromState?.id);
  const isValidId = tournamentIdNum != null;

  const { data: tournamentFromApi, isLoading: isLoadingTournament } = useGetTournamentQuery(
    { id: tournamentIdNum },
    { skip: !isValidId },
  );
  const tournament = useMemo(
    () => mergeTournamentMeta(tournamentFromState, tournamentFromApi),
    [tournamentFromState, tournamentFromApi],
  );

  const { data: teams = [], isLoading: teamsLoading } = useGetTournamentTeamsQuery(tournamentIdNum, { skip: !isValidId });
  const teamsCount = teamsLoading ? (tournament?.teams_count ?? 0) : teams.length;
  const noTeams = teamsCount === 0;
  const teamsComplete = areTournamentTeamsComplete(tournament, teamsCount);
  const canAddTeam = canAddTournamentTeams(tournament, teamsCount);

  const showViewFixtures = (tournament?.matches_count ?? 0) > 0;

  const isPageLoading = (!tournament && isLoadingTournament) || (teamsLoading && tournament?.teams_count == null);

  useEffect(() => {
    if (!isValidId) {
      navigate('/organizer/tournaments', { replace: true });
    }
  }, [isValidId, navigate]);

  useEffect(() => {
    if (!isValidId || isPageLoading || noTeams || teamsComplete) return;
    navigate(`/organizer/tournaments/${tournamentIdNum}/saved-teams`, {
      replace: true,
      state: { tournament: tournament ?? { id: tournamentIdNum } },
    });
  }, [isValidId, isPageLoading, noTeams, teamsComplete, tournamentIdNum, tournament, navigate]);

  if (!isValidId) return null;

  const title = getTournamentTitle(tournament, 'Tournaments');

  const tournamentStatePayload = tournament
    ? {
        ...tournament,
        name: tournament.tournament_name ?? tournament.name,
      }
    : { id: tournamentIdNum };

  if (isPageLoading) {
    return (
      <div className="flex min-h-[calc(100vh-144px)] flex-col bg-black">
        <AppSubpageHeader title={title} titleClassName="truncate" />
        <Container>
          <PageLoader label="Loading tournament" className="py-6" />
        </Container>
      </div>
    );
  }

  const handleCreateTeam = () => {
    openDialog('manageTeam', {
      mode: 'create',
      tournamentId: tournamentIdNum,
      tournament: tournamentStatePayload,
      onSuccess: () => {
        navigate(`/organizer/tournaments/${tournamentIdNum}/saved-teams`, {
          state: { tournament: tournamentStatePayload },
        });
      },
    });
  };

  const handleViewTeams = () => {
    navigate(`/organizer/tournaments/${tournamentIdNum}/add-squad`, {
      state: { tournament: tournamentStatePayload },
    });
  };

  const handleAddFixtures = () => {
    navigate('/organizer/scoring/start-match', {
      state: {
        tournamentId: tournamentIdNum,
        tournament: tournamentStatePayload,
      },
    });
  };

  const handleViewFixtures = () => {
    navigate(`/upcoming-tournaments/${tournamentIdNum}?tab=fixtures`);
  };

  return (
    <div className="flex min-h-[calc(100vh-144px)] flex-col bg-black">
      <AppSubpageHeader title={title} titleClassName="truncate" />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        {noTeams && canAddTeam ? (
          <ListEmpty
            title="No Teams Yet."
            description="Create your first team to get started."
            action={
              <Button type="button" variant="card" size="card" onClick={handleCreateTeam}>
                <span className="bg-brand text-ink flex h-[44px] w-[44px] items-center justify-center rounded-full text-[32px] font-bold">
                  +
                </span>
                <span className="text-muted text-[16px] font-bold">Create Team</span>
              </Button>
            }
          />
        ) : teamsComplete ? (
          <>
            <p className="text-muted text-center text-[14px]">Teams are complete. Manage squads or add fixtures.</p>
            <Button type="button" variant="card" size="card" onClick={handleViewTeams}>
              <span className="bg-brand text-ink flex h-[44px] w-[44px] items-center justify-center rounded-full text-[32px] font-bold">
                +
              </span>
              <span className="text-muted text-[16px] font-bold">View Teams</span>
            </Button>
            <Button type="button" variant="card" size="card" onClick={handleAddFixtures}>
              <span className="bg-brand text-ink flex h-[44px] w-[44px] items-center justify-center rounded-full text-[32px] font-bold">
                +
              </span>
              <span className="text-muted text-[16px] font-bold">Add Fixtures</span>
            </Button>
            {showViewFixtures ? (
              <Button type="button" variant="card" size="card" onClick={handleViewFixtures}>
                <span className="bg-brand text-ink flex h-[44px] w-[44px] items-center justify-center rounded-full text-[32px] font-bold">
                  +
                </span>
                <span className="text-muted text-[16px] font-bold">View Fixtures</span>
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
