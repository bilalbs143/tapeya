import { useEffect } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import {
  getTournamentTitle,
  parseTournamentId,
} from '@/lib/utils/tournamentUtils';
import {
  useGetTournamentMatchesQuery,
  useGetTournamentQuery,
} from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';

export default function TournamentCreateTeamIntro() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId } = useParams();

  const tournamentFromState = location.state?.tournament ?? null;

  const tournamentIdNum = parseTournamentId(
    tournamentId,
    tournamentFromState?.id,
  );
  const isValidId = tournamentIdNum != null;

  const { data: tournamentFromApi } = useGetTournamentQuery(
    { id: tournamentIdNum },
    { skip: !isValidId || !!tournamentFromState },
  );
  const tournament = tournamentFromState ?? tournamentFromApi ?? null;

  const { data: matches = [] } = useGetTournamentMatchesQuery(
    { tournamentId: tournamentIdNum, all: true },
    { skip: !isValidId },
  );
  const matchesCount = Array.isArray(matches) ? matches.length : 0;

  useEffect(() => {
    if (!isValidId) {
      navigate('/organizer/tournaments', { replace: true });
    }
  }, [isValidId, navigate]);

  if (!isValidId) return null;

  const title = getTournamentTitle(tournament, 'Tournaments');
  const teamsCount = tournament?.teams_count ?? 0;
  const noTeams = teamsCount === 0;

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
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <div className="flex min-h-[calc(100vh-144px)] flex-col">
          <AppSubpageHeader
            title={title}
            bottomSpacing="relaxed"
            titleClassName="truncate"
            className="-mx-4 -mt-6 lg:mt-0"
          />

          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
            {noTeams ? (
              <>
                <p className="text-center text-[14px] text-[#A2A6AB]">
                  No teams yet. Create your first team to get started.
                </p>
                <Button
                  type="button"
                  variant="card"
                  onClick={handleCreateTeam}
                  className="flex h-[120px] w-[158px] flex-col items-center justify-center gap-3 rounded-[18px] !bg-[#141412] px-0 py-0"
                >
                  <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#DA9811] text-[32px] font-bold text-[#080807]">
                    +
                  </span>
                  <span className="text-[16px] font-bold text-[#A2A6AB]">
                    Create Team
                  </span>
                </Button>
              </>
            ) : (
              <>
                <p className="text-center text-[14px] text-[#A2A6AB]">
                  Teams are complete. Manage squads or add fixtures.
                </p>
                <Button
                  type="button"
                  variant="card"
                  onClick={handleViewTeams}
                  className="flex h-[120px] w-[158px] flex-col items-center justify-center gap-3 rounded-[18px] !bg-[#141412] px-0 py-0"
                >
                  <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#DA9811] text-[32px] font-bold text-[#080807]">
                    +
                  </span>
                  <span className="text-[16px] font-bold text-[#A2A6AB]">
                    View Teams
                  </span>
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
                  <span className="text-[16px] font-bold text-[#A2A6AB]">
                    Add Fixtures
                  </span>
                </Button>
                {matchesCount > 0 && (
                  <Button
                    type="button"
                    variant="card"
                    onClick={handleViewFixtures}
                    className="flex h-[120px] w-[158px] flex-col items-center justify-center gap-3 rounded-[18px] !bg-[#141412] px-0 py-0"
                  >
                    <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#DA9811] text-[32px] font-bold text-[#080807]">
                      +
                    </span>
                    <span className="text-[16px] font-bold text-[#A2A6AB]">
                      View Fixtures
                    </span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
