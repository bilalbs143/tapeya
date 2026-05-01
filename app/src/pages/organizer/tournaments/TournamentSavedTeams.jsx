import { useEffect, useMemo, useRef } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import {
  getTournamentTitle,
  parseTournamentId,
} from '@/lib/utils/tournamentUtils';
import {
  useGetTournamentQuery,
  useGetTournamentTeamsQuery,
} from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';

function TeamLogoIcon({ logo, teamName }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#0d0d0b]">
      {logo ? (
        <img src={logo} alt="" className="h-full w-full object-contain" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[18px] font-bold text-white">
          {(teamName ?? 'T').charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function teamDisplay(team) {
  const owner =
    team.sponsor?.name ?? (team.owner != null ? String(team.owner) : '—');
  const iconPlayers =
    Array.isArray(team.icon_players) && team.icon_players.length > 0
      ? team.icon_players
        .map((p) => p.name)
        .filter(Boolean)
        .join(', ')
      : '—';
  return { owner, iconPlayers };
}

function TeamCard({ team, index, highlight }) {
  const { owner, iconPlayers } = teamDisplay(team);

  return (
    <div
      className={`flex items-start gap-3 rounded-[17px] bg-[#141412] p-4 ${
        highlight ? 'ring-2 ring-[#DA9811] ring-offset-2 ring-offset-black' : ''
      }`}
    >
      <TeamLogoIcon logo={team.logo} teamName={team.name} />
      <div className="min-w-0 flex-1">
        <h3 className="text-[16px] font-bold text-white">{team.name ?? '—'}</h3>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          {team.group_index != null && (
            <span className="text-[12px] text-[#A2A6AB]">
              Group {team.group_index}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[14px] text-white">
          Owner: <span className="font-medium text-[#DA9811]">{owner}</span>
        </p>
        <p className="mt-0.5 text-[12px] text-white">
          Icon Players: <span className="text-[#A2A6AB]">{iconPlayers}</span>
        </p>
      </div>
      <span className="shrink-0 text-[28px] font-bold text-[#DA98113B]">
        {index + 1}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function TournamentSavedTeams() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId } = useParams();

  const tournamentFromState = location.state?.tournament ?? null;
  const newTeam = location.state?.newTeam ?? null;
  const newTeamListRef = useRef(null);

  const tournamentIdNum = parseTournamentId(
    tournamentId,
    tournamentFromState?.id,
  );
  const isValidId = tournamentIdNum != null;

  const { data: tournamentFromApi } = useGetTournamentQuery(
    { id: tournamentIdNum },
    { skip: !isValidId },
  );
  const tournament = tournamentFromApi ?? tournamentFromState ?? null;

  const numberOfGroups = tournament?.number_of_groups ?? 1;
  const hasGroups = numberOfGroups > 1;

  const {
    data: teams = [],
    isLoading,
    isError,
    isSuccess,
  } = useGetTournamentTeamsQuery(tournamentIdNum, { skip: !isValidId });

  const teamsByGroup = useMemo(() => {
    if (!hasGroups || numberOfGroups < 2) return null;
    const byGroup = /** @type {Record<number, typeof teams>} */ ({});
    for (let i = 1; i <= numberOfGroups; i++) {
      byGroup[i] = teams.filter((t) => Number(t.group_index) === i);
    }
    return byGroup;
  }, [hasGroups, numberOfGroups, teams]);

  useEffect(() => {
    if (!isValidId) {
      navigate('/organizer/tournaments', { replace: true });
    }
  }, [isValidId, navigate]);

  useEffect(() => {
    if (newTeam && !isLoading && newTeamListRef.current) {
      newTeamListRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [newTeam, isLoading]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleSubmitTeams = () => {
    navigate(`/organizer/tournaments/${tournamentIdNum}/add-squad`, {
      state: { tournament: tournament ?? { id: tournamentIdNum } },
    });
  };

  const handleNavigateToAddTeam = () => {
    navigate(`/organizer/tournaments/${tournamentIdNum}/add-team`, {
      state: {
        tournament: tournament ?? { id: tournamentIdNum },
      },
    });
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <AppSubpageHeader
          title={
            tournament
              ? `${getTournamentTitle(tournament)} - Teams`
              : 'Tournaments - Teams'
          }
          bottomSpacing="relaxed"
          className="-mx-4 -mt-6 lg:mt-0"
        />

        {isLoading && (
          <p className="mb-3 text-[13px] text-[#A2A6AB]">Loading teams…</p>
        )}
        {isError && (
          <p className="mb-3 text-[13px] text-red-400">Failed to load teams.</p>
        )}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-bold tracking-wide text-white uppercase">
            Teams
          </h2>
          <button
            type="button"
            onClick={handleNavigateToAddTeam}
            className="flex shrink-0 items-center gap-2 transition-opacity active:opacity-80"
          >
            <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-[#DA9811] text-[18px] font-bold text-[#080807]">
              +
            </span>
            <span className="text-[13px] font-bold text-[#A2A6AB]">
              Create Team
            </span>
          </button>
        </div>

        {!isLoading && isSuccess && teams.length === 0 && (
          <p className="mb-6 rounded-[17px] bg-[#141412] px-4 py-6 text-center text-[13px] text-[#A2A6AB]">
            No teams added yet. Create a team to get started.
          </p>
        )}

        {!isLoading && teamsByGroup != null && (
          <div className="space-y-6 pb-6">
            {Array.from({ length: numberOfGroups }, (_, i) => i + 1).map(
              (groupIndex) => (
                <section key={groupIndex}>
                  <h3 className="mb-2 text-[13px] font-bold tracking-wide text-[#DA9811] uppercase">
                    Group {groupIndex}
                  </h3>
                  <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                    {teamsByGroup[groupIndex].map((team, index) => (
                      <li
                        key={team.id ?? index}
                        ref={
                          newTeam?.id != null && team.id === newTeam.id
                            ? newTeamListRef
                            : undefined
                        }
                      >
                        <TeamCard
                          team={team}
                          index={index}
                          highlight={
                            newTeam?.id != null && team.id === newTeam.id
                          }
                        />
                      </li>
                    ))}
                  </ul>
                  {teamsByGroup[groupIndex].length === 0 && (
                    <p className="rounded-[17px] bg-[#141412] px-4 py-4 text-center text-[13px] text-[#A2A6AB]">
                      No teams in this group
                    </p>
                  )}
                </section>
              ),
            )}
          </div>
        )}

        {!isLoading && teamsByGroup == null && teams.length > 0 && (
          <ul className="space-y-3 pb-6 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {teams.map((team, index) => (
              <li
                key={team.id ?? index}
                ref={
                  newTeam?.id != null && team.id === newTeam.id
                    ? newTeamListRef
                    : undefined
                }
              >
                <TeamCard
                  team={team}
                  index={index}
                  highlight={newTeam?.id != null && team.id === newTeam.id}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-start pt-2">
          <Button
            type="button"
            variant="auth"
            className="h-12 w-full rounded-[8px] bg-[#E4E7F4] text-[15px] font-semibold tracking-wide text-[#1a1a1a] uppercase lg:w-auto"
            onClick={handleSubmitTeams}
            disabled={
              isLoading ||
              teams.length === 0 ||
              (tournament?.number_of_teams != null &&
                teams.length < tournament.number_of_teams)
            }
          >
            Submit Teams
          </Button>
        </div>
      </Container>
    </div>
  );
}
