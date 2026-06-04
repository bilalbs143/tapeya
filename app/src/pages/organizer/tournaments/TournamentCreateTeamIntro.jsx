import { useEffect } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import {
  areTournamentTeamsComplete,
  canAddTournamentTeams,
  getTournamentTitle,
  parseTournamentId,
} from '@/lib/utils/tournamentUtils';
import { useGetTournamentQuery, useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';

export default function TournamentCreateTeamIntro() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId } = useParams();

  const tournamentFromState = location.state?.tournament ?? null;

  const tournamentIdNum = parseTournamentId(tournamentId, tournamentFromState?.id);
  const isValidId = tournamentIdNum != null;

  const { data: tournamentFromApi, isLoading: isLoadingTournament } = useGetTournamentQuery(
    { id: tournamentIdNum },
    { skip: !isValidId },
  );
  const tournament = tournamentFromApi ?? tournamentFromState ?? null;

  const { data: teams = [], isLoading: teamsLoading } = useGetTournamentTeamsQuery(tournamentIdNum, { skip: !isValidId });
  const teamsCount = teamsLoading ? (tournament?.teams_count ?? 0) : teams.length;
  const noTeams = teamsCount === 0;
  const teamsComplete = areTournamentTeamsComplete(tournament, teamsCount);
  const canAddTeam = canAddTournamentTeams(tournament, teamsCount);

  const matchesCount = tournament?.matches_count ?? 0;
  const showViewFixtures = !isLoadingTournament && matchesCount > 0;

  useEffect(() => {
    if (!isValidId) {
      navigate('/organizer/tournaments', { replace: true });
    }
  }, [isValidId, navigate]);

  useEffect(() => {
    if (!isValidId || noTeams || teamsComplete) return;
    navigate(`/organizer/tournaments/${tournamentIdNum}/saved-teams`, {
      replace: true,
      state: { tournament: tournament ?? { id: tournamentIdNum } },
    });
  }, [isValidId, noTeams, teamsComplete, tournamentIdNum, tournament, navigate]);

  if (!isValidId) return null;

  const title = getTournamentTitle(tournament, 'Tournaments');

  const handleCreateTeam = () => {
    navigate(`/organizer/tournaments/${tournamentIdNum}/add-team`, {
      state: {
        tournament: tournament
          ? {
              ...tournament,
              name: tournament.tournament_name ?? tournament.name,
            }
          : { id: tournamentIdNum },
      },
    });
  };

  const handleViewTeams = () => {
    navigate(`/organizer/tournaments/${tournamentIdNum}/add-squad`, {
      state: {
        tournament: tournament
          ? {
              ...tournament,
              name: tournament.tournament_name ?? tournament.name,
            }
          : { id: tournamentIdNum },
      },
    });
  };

  const handleAddFixtures = () => {
    navigate('/organizer/scoring/start-match', {
      state: {
        tournamentId: tournamentIdNum,
        tournament: tournament
          ? {
              ...tournament,
              name: tournament.tournament_name ?? tournament.name,
            }
          : { id: tournamentIdNum },
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
            <p className="text-center text-[14px] text-[#A2A6AB]">No teams yet. Create your first team to get started.</p>
            <Button
              type="button"
              variant="card"
              onClick={handleCreateTeam}
              className="flex h-[120px] w-[158px] flex-col items-center justify-center gap-3 rounded-[18px] !bg-[#141412] px-0 py-0"
            >
              <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#DA9811] text-[32px] font-bold text-[#080807]">
                +
              </span>
              <span className="text-[16px] font-bold text-[#A2A6AB]">Create Team</span>
            </Button>
          </>
        ) : teamsComplete ? (
          <>
            <p className="text-center text-[14px] text-[#A2A6AB]">Teams are complete. Manage squads or add fixtures.</p>
            <Button
              type="button"
              variant="card"
              onClick={handleViewTeams}
              className="flex h-[120px] w-[158px] flex-col items-center justify-center gap-3 rounded-[18px] !bg-[#141412] px-0 py-0"
            >
              <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#DA9811] text-[32px] font-bold text-[#080807]">
                +
              </span>
              <span className="text-[16px] font-bold text-[#A2A6AB]">View Teams</span>
            </Button>
            <Button
              type="button"
              variant="card"
              onClick={handleAddFixtures}
              className="flex h-[120px] w-[158px] flex-col items-center justify-center gap-3 rounded-[18px] !bg-[#141412] px-0 py-0"
            >
              <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#DA9811] text-[32px] font-bold text-[#080807]">
                +
              </span>
              <span className="text-[16px] font-bold text-[#A2A6AB]">Add Fixtures</span>
            </Button>
            {showViewFixtures && (
              <Button
                type="button"
                variant="card"
                onClick={handleViewFixtures}
                className="flex h-[120px] w-[158px] flex-col items-center justify-center gap-3 rounded-[18px] !bg-[#141412] px-0 py-0"
              >
                <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#DA9811] text-[32px] font-bold text-[#080807]">
                  +
                </span>
                <span className="text-[16px] font-bold text-[#A2A6AB]">View Fixtures</span>
              </Button>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
