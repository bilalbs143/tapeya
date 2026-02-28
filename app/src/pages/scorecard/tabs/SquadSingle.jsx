import { Link } from 'react-router-dom';

import { getSquadByTeamId } from './squadsData';

const BORDER = 'border-[#1A1A1A]';

export function SquadSingle({ tournamentId, teamId }) {
  const squad = getSquadByTeamId(teamId);
  const players = squad?.players ?? [];

  const title = tournamentId
    ? `${tournamentId} 2026 - ${(squad?.teamName ?? '').toUpperCase()} SQUAD`
    : 'SQUAD';

  if (!squad) {
    return (
      <div className="mt-4 pb-6">
        <p className="text-[13px] text-[#A2A6AB]">Squad not found.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 pb-6 focus:outline-none">
      <h1 className="border-b border-[#1A1A1A] pb-4 text-left text-[13px] font-bold tracking-wide text-white uppercase">
        {title}
      </h1>

      <div className="overflow-hidden border border-[#1A1A1A]">
        <div className="bg-[#141412] px-4 py-3 text-[13px] font-bold text-white">
          {squad.teamName}
        </div>
        <div className="border-t border-[#1A1A1A]">
          {players.map((player, index) => (
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
                <Link
                  to={player.id ? `/user-profile/${player.id}` : '/user-profile'}
                  className="block text-[13px] font-bold text-white focus:outline-none"
                >
                  {player.name}
                </Link>
                <div className="mt-0.5 text-[12px] text-[#A2A6AB]">
                  {player.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
