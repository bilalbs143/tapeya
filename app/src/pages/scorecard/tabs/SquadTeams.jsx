/**
 * SquadTeams
 *
 * Tab content: list of tournament teams; click navigates to squad single.
 * Used in scorecard and upcoming-tournaments. Coding guidelines: docs/Coding guidelines.md
 */

import { useNavigate, useSearchParams } from 'react-router-dom';

import { TeamLogo } from '@/components/TeamLogo';
import { useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';

export function SquadTeams({ tournamentId }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const title = tournamentId ? `${tournamentId} 2026 - SQUADS` : 'SQUADS';

  const {
    data: teams = [],
    isLoading,
    isError,
  } = useGetTournamentTeamsQuery(tournamentId, {
    skip: !tournamentId,
  });

  const handleTeamClick = (teamId) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'squads');
    next.set('team', teamId);
    navigate({ search: next.toString() }, { replace: false });
  };

  if (!tournamentId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-[#A2A6AB]">Loading squads…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-red-400">Failed to load teams for squads.</p>
      </div>
    );
  }

  if (!teams.length) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-8 text-center text-[13px] text-[#A2A6AB]">No teams added yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 pb-6 focus:outline-none">
      <h1 className="border-b border-[#1A1A1A] pb-4 text-left text-[13px] font-bold tracking-wide text-white uppercase">
        {title}
      </h1>

      <div className="border border-[#1A1A1A]">
        <div className="bg-[#141412] px-4 py-3 text-[13px] font-bold text-white">Teams</div>
        <div className="divide-y divide-[#1A1A1A]">
          {teams.map((team) => (
            <button
              type="button"
              key={team.id}
              onClick={() => handleTeamClick(team.id)}
              className="flex w-full items-center gap-2.5 bg-transparent px-4 py-3.5 text-left text-[13px] text-white focus:ring-2 focus:ring-[#DA9811] focus:outline-none focus:ring-inset active:bg-[#1A1A1A]"
            >
              <TeamLogo team={team} variant="list" />
              <span className="min-w-0 flex-1 truncate">{team.name ?? team.code ?? 'Team'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
