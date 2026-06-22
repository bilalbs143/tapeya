import { TeamLogo } from '@/components/TeamLogo';
import { formatListIndex } from '@/lib/format';
import { useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';

export function TeamsTab({ tournamentId, tournament }) {
  const id = tournamentId != null ? String(tournamentId) : '';
  const { data: teams = [], isLoading, isError } = useGetTournamentTeamsQuery(id, { skip: !id });

  const title = tournament?.tournament_name ? `${tournament.tournament_name} - TEAMS` : id ? `${id} - TEAMS` : 'TEAMS';

  return (
    <div className="mt-4 pb-6 focus:outline-none">
      <h1 className="border-surface-border border-b pb-4 text-left text-[13px] font-bold tracking-wide text-white uppercase">
        {title}
      </h1>

      <div className="border-surface-border border">
        <div className="bg-surface px-4 py-3 text-[13px] font-bold text-white">Teams</div>
        {isLoading && <p className="text-muted px-4 py-4 text-[13px]">Loading teams…</p>}
        {isError && !isLoading && <p className="px-4 py-4 text-[13px] text-red-400">Failed to load teams.</p>}
        {!isLoading && !isError && teams.length === 0 && <p className="text-muted px-4 py-4 text-[13px]">No teams available.</p>}
        {!isLoading && !isError && teams.length > 0 && (
          <div className="divide-y divide-[#1A1A1A]">
            {teams.map((team, index) => (
              <div
                key={team.id ?? `${team.name}-${index}`}
                className="flex items-center gap-2.5 bg-transparent px-4 py-3.5 text-[13px] text-white"
              >
                <span>{formatListIndex(index + 1)}</span>
                <TeamLogo team={team} variant="teamsTab" />
                <span>{team.name ?? team.code ?? 'Team'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
