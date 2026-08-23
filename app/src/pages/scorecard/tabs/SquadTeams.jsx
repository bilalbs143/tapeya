/**
 * SquadTeams
 *
 * Tab content: list of tournament teams; click navigates to squad single.
 * Used in scorecard and upcoming-tournaments. Coding guidelines: docs/Coding guidelines.md
 */

import { useNavigate, useSearchParams } from 'react-router-dom';

import { TeamLogo } from '@/components/TeamLogo';
import { useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';
import { ListEmpty, ListError } from '@/ui/ListState';
import { LoaderBlock } from '@/ui/Loader';

export function SquadTeams({ tournamentId }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const title = tournamentId ? `${tournamentId} 2026 - SQUADS` : 'SQUADS';

  const {
    data: teams = [],
    isLoading,
    isError,
    refetch,
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
        <LoaderBlock label="Loading squads" className="py-4" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4 pb-6">
        <ListError message="Could not load teams for squads." onRetry={() => refetch()} />
      </div>
    );
  }

  if (!teams.length) {
    return (
      <div className="mt-4 pb-6">
        <ListEmpty title="No Teams Yet." description="Teams will appear here once they are added." />
      </div>
    );
  }

  return (
    <div className="mt-4 pb-6 focus:outline-none">
      <h1 className="border-surface-border border-b pb-4 text-left text-[13px] font-bold tracking-wide text-white uppercase">
        {title}
      </h1>

      <div className="border-surface-border border">
        <div className="bg-surface px-4 py-3 text-[13px] font-bold text-white">Teams</div>
        <div className="divide-y divide-[#1A1A1A]">
          {teams.map((team) => (
            <button
              type="button"
              key={team.id}
              onClick={() => handleTeamClick(team.id)}
              className="focus:ring-brand active:bg-surface-border flex w-full items-center gap-2.5 bg-transparent px-4 py-3.5 text-left text-[13px] text-white focus:ring-2 focus:outline-none focus:ring-inset"
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
