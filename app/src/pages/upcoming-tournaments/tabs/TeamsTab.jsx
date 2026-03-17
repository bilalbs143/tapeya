import { isValidTournamentId } from '@/lib/utils/tournamentUtils';
import { useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';

export function TeamsTab({ tournamentId }) {
  const hasValidId = isValidTournamentId(tournamentId);

  const {
    data: teams = [],
    isLoading,
    isError,
  } = useGetTournamentTeamsQuery(tournamentId, {
    skip: !hasValidId,
  });

  if (!hasValidId) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-[#A2A6AB]">
          Teams are not available for this sample tournament.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-[#A2A6AB]">
          Loading teams…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-red-400">
          Failed to load teams.
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
        Teams
      </h2>

      <div className="border border-[#1A1A1A]">
        <div className="bg-[#141412] px-4 py-3 text-[13px] font-bold text-white">
          Teams in this tournament
        </div>
        <div className="divide-y divide-[#1A1A1A]">
          {teams.map((team, index) => (
            <div
              key={team.id ?? index}
              className="flex items-center gap-2.5 bg-transparent px-4 py-3.5 text-[13px] text-white"
            >
              <span className="w-6 text-xs text-[#A2A6AB]">{index + 1}</span>
              {team.logo && (
                <img
                  src={team.logo}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                  aria-hidden
                />
              )}
              <span className="truncate">
                {team.name ?? team.code ?? 'Team'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
