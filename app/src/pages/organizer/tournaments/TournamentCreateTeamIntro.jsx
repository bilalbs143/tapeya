import { useEffect, useMemo } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useDialog } from '@/context/DialogContext';
import {
  areTournamentTeamsComplete,
  canAddTournamentTeams,
  getTournamentTitle,
  parseTournamentId,
} from '@/lib/utils/tournamentUtils';
import { useGetTournamentQuery, useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';

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
  const tournament = useMemo(() => {
    if (!tournamentFromState && !tournamentFromApi) return null;
    return { ...tournamentFromState, ...tournamentFromApi };
  }, [tournamentFromState, tournamentFromApi]);

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
          <p className="py-6 text-center text-[13px] text-muted">Loading…</p>
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
          <>
            <p className="text-center text-[14px] text-muted">No teams yet. Create your first team to get started.</p>
            <Button
              type="button"
              variant="card"
              onClick={handleCreateTeam}
              className="flex h-[120px] w-[158px] flex-col items-center justify-center gap-3 rounded-[18px] !bg-surface px-0 py-0"
            >
              <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-brand text-[32px] font-bold text-ink">
                +
              </span>
              <span className="text-[16px] font-bold text-muted">Create Team</span>
            </Button>
          </>
        ) : teamsComplete ? (
          <>
            <p className="text-center text-[14px] text-muted">Teams are complete. Manage squads or add fixtures.</p>
            <Button
              type="button"
              variant="card"
              onClick={handleViewTeams}
              className="flex h-[120px] w-[158px] flex-col items-center justify-center gap-3 rounded-[18px] !bg-surface px-0 py-0"
            >
              <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-brand text-[32px] font-bold text-ink">
                +
              </span>
              <span className="text-[16px] font-bold text-muted">View Teams</span>
            </Button>
            <Button
              type="button"
              variant="card"
              onClick={handleAddFixtures}
              className="flex h-[120px] w-[158px] flex-col items-center justify-center gap-3 rounded-[18px] !bg-surface px-0 py-0"
            >
              <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-brand text-[32px] font-bold text-ink">
                +
              </span>
              <span className="text-[16px] font-bold text-muted">Add Fixtures</span>
            </Button>
            {showViewFixtures ? (
              <Button
                type="button"
                variant="card"
                onClick={handleViewFixtures}
                className="flex h-[120px] w-[158px] flex-col items-center justify-center gap-3 rounded-[18px] !bg-surface px-0 py-0"
              >
                <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-brand text-[32px] font-bold text-ink">
                  +
                </span>
                <span className="text-[16px] font-bold text-muted">View Fixtures</span>
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
