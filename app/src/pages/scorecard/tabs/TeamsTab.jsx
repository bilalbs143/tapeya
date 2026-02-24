import { POINTS_TABLE_GROUPS } from './pointsTableData';

export function TeamsTab({ tournamentId }) {
  const title = tournamentId ? `${tournamentId} 2026 - TEAMS` : 'TEAMS';
  const teams = POINTS_TABLE_GROUPS[0]?.teams ?? [];

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
          {teams.map((team) => (
            <div
              key={team.rank}
              className="flex items-center gap-2.5 bg-transparent px-4 py-3.5 text-[13px] text-white"
            >
              <span>{team.rank}</span>
              <span>{team.name}</span>
              <img
                src={team.logo}
                alt=""
                className="h-5 w-5 shrink-0 rounded-full object-cover"
                aria-hidden
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
