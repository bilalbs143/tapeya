import { useMemo } from 'react';

import { useGetTeamSquadQuery } from '@/features/matches';

import { cn } from '@/shared/lib/cn';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { useGetTournamentTeamsQuery } from '../api/tournamentsApi';
import { playerInitials } from '../model/squadSchemas';
import { teamCrest, type TournamentTeam } from '../model/teamSchemas';

type TournamentTeamsPanelProps = {
  tournamentId: number;
  onOpenSquad: (teamId: number) => void;
};

export function TournamentTeamsPanel({ tournamentId, onOpenSquad }: TournamentTeamsPanelProps) {
  const { data: teams = [], isLoading, isError, refetch } = useGetTournamentTeamsQuery(tournamentId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-panel" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState title="Could Not Load Teams" onRetry={() => void refetch()} />;
  }

  if (!teams.length) {
    return (
      <EmptyState title="No Teams Yet" description="Teams appear here when the organizer publishes the squad list." />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {teams.map((team) => (
        <button
          key={team.id}
          type="button"
          onClick={() => onOpenSquad(team.id)}
          className="border-border-subtle bg-surface flex w-full items-center gap-2.5 rounded-panel border px-3 py-2.5 text-left"
        >
          <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-panel bg-[linear-gradient(150deg,var(--color-positive),var(--color-brand-deep))] text-4xs font-extrabold text-white">
            {teamCrest(team)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-ink">{team.name}</span>
            <span className="text-dim font-mono block text-4xs font-medium">
              {team.groupIndex != null ? `Group ${team.groupIndex}` : 'Team'}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

type TournamentSquadsPanelProps = {
  tournamentId: number;
  teamParam: string | null;
  onSelect: (teamId: number) => void;
};

/** Squad drill-in — team chips + player rows. */

export function TournamentSquadsPanel({ tournamentId, teamParam, onSelect }: TournamentSquadsPanelProps) {
  const { data: teams = [], isLoading, isError, refetch } = useGetTournamentTeamsQuery(tournamentId);

  const selected: TournamentTeam | null = useMemo(() => {
    if (!teams.length) return null;
    const fromParam = teamParam != null ? teams.find((t) => String(t.id) === teamParam) : null;
    return fromParam ?? teams[0] ?? null;
  }, [teams, teamParam]);

  const {
    data: squad = [],
    isLoading: squadLoading,
    isError: squadError,
    refetch: refetchSquad,
  } = useGetTeamSquadQuery(selected?.id ?? 0, {
    skip: selected == null,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-12 w-full rounded-panel" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState title="Could Not Load Squads" onRetry={() => void refetch()} />;
  }

  if (!teams.length) {
    return <EmptyState title="No Squads Yet" description="Squads appear once teams are listed for this tournament." />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {teams.map((team) => (
          <button
            key={team.id}
            type="button"
            onClick={() => onSelect(team.id)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-2xs font-bold',
              selected?.id === team.id
                ? 'border-brand bg-brand/16 text-brand-text'
                : 'border-border-subtle bg-surface text-muted'
            )}
          >
            {team.code?.trim() || team.name}
          </button>
        ))}
      </div>

      {squadLoading ? (
        <div className="flex flex-col gap-1.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-panel" />
          ))}
        </div>
      ) : squadError ? (
        <ErrorState title="Could Not Load Squad" onRetry={() => void refetchSquad()} />
      ) : squad.length ? (
        <ul className="flex flex-col gap-1.5">
          {squad.map((p) => (
            <li
              key={p.id}
              className="border-border-subtle bg-surface flex items-center gap-2.5 rounded-panel border px-3 py-2.5"
            >
              <span className="bg-surface-raised text-body grid h-8 w-8 shrink-0 place-items-center rounded-full text-4xs font-extrabold">
                {playerInitials(p.name)}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-bold text-ink">{p.name}</span>
              {p.role ? (
                <span className="border-border-subtle bg-surface-raised text-dim font-mono shrink-0 rounded-md border px-1.5 py-0.5 text-4xs font-bold tracking-eyebrow">
                  {p.role}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Squad Not Listed" description="This side hasn't published a squad for the tournament yet." />
      )}
    </div>
  );
}
