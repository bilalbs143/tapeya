import { useNavigate, useSearchParams } from 'react-router-dom';

import { MOCK_SQUADS } from './squadsData';

function TeamLogo({ team, className = '' }) {
  if (team.logo) {
    return (
      <img
        src={team.logo}
        alt=""
        className={`h-5 w-5 shrink-0 rounded-full object-cover ${className}`.trim()}
        aria-hidden
      />
    );
  }
  const initial = team.teamName.charAt(0);
  return (
    <div
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[11px] font-bold text-[#DA9811] ${className}`.trim()}
      aria-hidden
    >
      {initial}
    </div>
  );
}

export function SquadTeams({ tournamentId }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const title = tournamentId ? `${tournamentId} 2026 - SQUADS` : 'SQUADS';

  const handleTeamClick = (teamId) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'squads');
    next.set('team', teamId);
    navigate({ search: next.toString() }, { replace: false });
  };

  return (
    <div className="mt-4 pb-6 focus:outline-none">
      <h1 className="border-b border-[#1A1A1A] pb-4 text-left text-[13px] font-bold tracking-wide text-white uppercase">
        {title}
      </h1>

      <div className="border border-[#1A1A1A]">
        <div className="bg-[#141412] px-4 py-3 text-[13px] font-bold text-white">
          Teams
        </div>
        <div className="divide-y divide-[#1A1A1A]">
          {MOCK_SQUADS.map((team) => (
            <button
              type="button"
              key={team.id}
              onClick={() => handleTeamClick(team.id)}
              className="flex w-full items-center gap-2.5 bg-transparent px-4 py-3.5 text-left text-[13px] text-white focus:ring-2 focus:ring-[#DA9811] focus:outline-none focus:ring-inset active:bg-[#1A1A1A]"
            >
              <TeamLogo team={team} />
              <span className="min-w-0 flex-1">{team.teamName}</span>
              <span className="shrink-0 text-[12px] text-[#A2A6AB]">
                Last updated: {team.lastUpdated}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
