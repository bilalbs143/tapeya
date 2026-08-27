import { TeamLogo } from '@/components/TeamLogo';
import { formatListIndex } from '@/lib/format';
import { isValidTournamentId } from '@/lib/utils/tournamentUtils';
import { useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';
import { ListEmpty, ListError } from '@/ui/ListState';
import { LoaderBlock } from '@/ui/Loader';

export function TeamsTab({ tournamentId }) {
  const hasValidId = isValidTournamentId(tournamentId);

  const {
    data: teams = [],
    isLoading,
    isError,
    refetch,
  } = useGetTournamentTeamsQuery(tournamentId, {
    skip: !hasValidId,
  });

  if (!hasValidId) {
    return (
      <div className="mt-4 pb-6">
        <ListEmpty title="Teams Unavailable." description="Teams are not available for this sample tournament." />
      </div>
    );
  }

  if (isLoading) {
    return <LoaderBlock label="Loading teams" className="mt-4 py-6" />;
  }

  if (isError) {
    return (
      <div className="mt-4 pb-6">
        <ListError message="Could not load teams." onRetry={() => refetch()} />
      </div>
    );
  }

  if (!teams.length) {
    return (
      <div className="mt-4 pb-6">
        <ListEmpty title="No Teams Yet." />
      </div>
    );
  }

  return (
    <div className="mt-4 pb-6">
      <h2 className="border-surface-border border-b pb-4 text-left text-[13px] font-bold tracking-wide text-white uppercase">
        Teams
      </h2>

      <div className="border-surface-border border">
        <div className="bg-surface px-4 py-3 text-[13px] font-bold text-white">Teams in this tournament</div>
        <div className="divide-y divide-[#1A1A1A]">
          {teams.map((team, index) => (
            <div key={team.id ?? index} className="flex items-center gap-2.5 bg-transparent px-4 py-3.5 text-[13px] text-white">
              <span className="text-muted w-6 text-xs">{formatListIndex(index + 1)}</span>
              <TeamLogo team={team} variant="teamsTab" />
              <span className="truncate">{team.name ?? team.code ?? 'Team'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
