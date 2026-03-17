import { useNavigate, useSearchParams } from 'react-router-dom';

import { BORDER_ALT as BORDER } from '@/lib/constants/tableStyles';
import { playerDisplayRole } from '@/lib/utils/playerUtils';
import {
  getTournamentTitle,
  isValidTournamentId,
} from '@/lib/utils/tournamentUtils';
import { useGetTeamSquadQuery } from '@/store/api/teamApi';
import {
  useGetTournamentQuery,
  useGetTournamentTeamsQuery,
} from '@/store/api/tournamentApi';

function SquadTeams({ tournamentId }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hasValidId = isValidTournamentId(tournamentId);

  const {
    data: teams = [],
    isLoading,
    isError,
  } = useGetTournamentTeamsQuery(tournamentId, {
    skip: !hasValidId,
  });

  // Preserves existing search params (e.g. ?tab=squads) and appends team id.
  const handleTeamClick = (teamId) => {
    const next = new URLSearchParams(searchParams);
    next.set('team', String(teamId));
    navigate({ search: next.toString() }, { replace: false });
  };

  // Shared wrapper for early-return states.
  const wrap = (children) => <div className="mt-4 pb-6">{children}</div>;

  // ------------------------------------------------------------------
  // Early-return states
  // ------------------------------------------------------------------

  if (!hasValidId) {
    return wrap(
      <p className="py-4 text-center text-[13px] text-[#A2A6AB]">
        Squads are not available for this sample tournament.
      </p>,
    );
  }

  if (isLoading) {
    return wrap(
      <p className="py-4 text-center text-[13px] text-[#A2A6AB]">
        Loading squads…
      </p>,
    );
  }

  if (isError) {
    return wrap(
      <p className="py-4 text-center text-[13px] text-red-400">
        Failed to load teams for squads.
      </p>,
    );
  }

  if (!teams.length) {
    return wrap(
      <p className="py-8 text-center text-[13px] text-[#A2A6AB]">
        No teams added yet.
      </p>,
    );
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="mt-4 pb-6">
      <h2 className="border-b border-[#1A1A1A] pb-4 text-left text-[13px] font-bold tracking-wide text-white uppercase">
        Squads
      </h2>

      <div className="border border-[#1A1A1A]">
        <div className="bg-[#141412] px-4 py-3 text-[13px] font-bold text-white">
          Teams
        </div>
        <div className="divide-y divide-[#1A1A1A]">
          {teams.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => handleTeamClick(team.id)}
              className="flex w-full items-center gap-2.5 bg-transparent px-4 py-3.5 text-left text-[13px] text-white focus:ring-2 focus:ring-[#DA9811] focus:outline-none focus:ring-inset active:bg-[#1A1A1A]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[11px] font-bold text-[#DA9811]">
                {(team.name ?? 'T').charAt(0)}
              </span>
              <span className="min-w-0 flex-1 truncate">
                {team.name ?? team.code ?? 'Team'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SquadSingle({ tournamentId, teamId }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: tournament } = useGetTournamentQuery(
    { id: Number(tournamentId) },
    { skip: !tournamentId || !isValidTournamentId(tournamentId) },
  );
  const {
    data: squad = [],
    isLoading,
    isError,
  } = useGetTeamSquadQuery(teamId, {
    skip: !teamId,
  });

  const wrap = (children) => <div className="mt-4 pb-6">{children}</div>;

  const clearTeam = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('team');
    setSearchParams(next, { replace: false });
  };

  // ------------------------------------------------------------------
  // Early-return states
  // ------------------------------------------------------------------

  if (!teamId) {
    return null;
  }

  if (isLoading) {
    return wrap(
      <p className="py-4 text-center text-[13px] text-[#A2A6AB]">
        Loading squad…
      </p>,
    );
  }

  if (isError) {
    return wrap(
      <p className="py-4 text-center text-[13px] text-red-400">
        Failed to load squad.
      </p>,
    );
  }

  if (!squad.length) {
    return wrap(
      <p className="py-8 text-center text-[13px] text-[#A2A6AB]">
        No players in this squad yet.
      </p>,
    );
  }

  const title = tournament
    ? `${getTournamentTitle(tournament)} - Squad`
    : 'Squad';

  return (
    <div className="mt-4 pb-6">
      <div className="flex items-center gap-2 border-b border-[#1A1A1A] pb-4">
        <button
          type="button"
          onClick={clearTeam}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-opacity active:opacity-80"
          aria-label="Back to teams"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="min-w-0 flex-1 text-left text-[13px] font-bold tracking-wide text-white uppercase">
          {title}
        </h2>
      </div>

      <div className="overflow-hidden border border-[#1A1A1A]">
        <div className="bg-[#141412] px-4 py-3 text-[13px] font-bold text-white">
          Players
        </div>
        <div className="border-t border-[#1A1A1A]">
          {squad.map((player, index) => (
            <div
              key={player.id ?? index}
              className={`flex border-b ${BORDER} last:border-b-0`}
            >
              <div
                className={`flex w-10 shrink-0 items-center justify-center border-r ${BORDER} py-3 text-[13px] text-white`}
              >
                {index + 1}
              </div>
              <div className="min-w-0 flex-1 px-4 py-3">
                <p className="text-[13px] font-bold text-white">
                  {player.name ?? player.nickname ?? 'Player'}
                </p>
                <p className="mt-0.5 text-[12px] text-[#A2A6AB]">
                  {playerDisplayRole(player)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab component
// ---------------------------------------------------------------------------

/**
 * SquadsTab — reads `?team=` from URL to decide which view to show.
 * No team param → SquadTeams (team picker).
 * Team param present → SquadSingle (player list for that team).
 */
export function SquadsTab({ tournamentId }) {
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('team');

  if (teamId) {
    return <SquadSingle tournamentId={tournamentId} teamId={teamId} />;
  }

  return <SquadTeams tournamentId={tournamentId} />;
}
