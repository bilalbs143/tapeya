import { useNavigate, useSearchParams } from 'react-router-dom';

import { useGetTeamSquadQuery } from '@/store/api/teamApi';
import { useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';

const BORDER = 'border-[#1A1A1A]';

function SquadTeams({ tournamentId }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    data: teams = [],
    isLoading,
    isError,
  } = useGetTournamentTeamsQuery(tournamentId, {
    skip: !tournamentId,
  });

  const handleTeamClick = (teamId) => {
    const next = new URLSearchParams(searchParams);
    next.set('team', String(teamId));
    navigate({ search: next.toString() }, { replace: false });
  };

  if (!tournamentId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-[#A2A6AB]">
          Loading squads…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-red-400">
          Failed to load teams for squads.
        </p>
      </div>
    );
  }

  if (!teams.length) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-8 text-center text-[13px] text-[#A2A6AB]">
          No teams added yet.
        </p>
      </div>
    );
  }

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

function playerDisplayRole(player) {
  return (
    player?.playing_role ??
    player?.playing_role_enum ??
    (player?.role != null ? String(player.role) : '—')
  );
}

function SquadSingle({ tournamentId, teamId }) {
  const {
    data: squad = [],
    isLoading,
    isError,
  } = useGetTeamSquadQuery(teamId, {
    skip: !teamId,
  });

  if (!teamId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-[#A2A6AB]">
          Loading squad…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-red-400">
          Failed to load squad.
        </p>
      </div>
    );
  }

  if (!squad.length) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-8 text-center text-[13px] text-[#A2A6AB]">
          No players in this squad yet.
        </p>
      </div>
    );
  }

  const title = tournamentId ? `${tournamentId} - Squad` : 'Squad';

  return (
    <div className="mt-4 pb-6">
      <h2 className="border-b border-[#1A1A1A] pb-4 text-left text-[13px] font-bold tracking-wide text-white uppercase">
        {title}
      </h2>

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

export function SquadsTab({ tournamentId }) {
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('team');

  if (teamId) {
    return <SquadSingle tournamentId={tournamentId} teamId={teamId} />;
  }

  return <SquadTeams tournamentId={tournamentId} />;
}
