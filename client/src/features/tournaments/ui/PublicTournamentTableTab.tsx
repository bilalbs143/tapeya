import { useState } from 'react';

import { Chip } from '@/shared/ui/Chip';
import { Spinner } from '@/shared/ui/Spinner';
import { EmptyState, ErrorState } from '@/shared/ui/states';

import { useGetTournamentStandingsQuery } from '../api/tournamentsApi';
import { TournamentStandingsTable } from './TournamentStandingsTable';

type PublicTournamentTableTabProps = {
  tournamentId: number;
};

/** Public `/tournaments/:id` Table tab — group chips when multi-group, DenseTable otherwise. */

export function PublicTournamentTableTab({ tournamentId }: PublicTournamentTableTabProps) {
  const { data, isLoading, isError, refetch } = useGetTournamentStandingsQuery(tournamentId);
  const [groupIndex, setGroupIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label="Loading Standings" />
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState title="Couldn't Load Standings" onRetry={() => void refetch()} />;
  }

  const groups = data.groups;
  const activeGroup = groups.length > 0 ? (groups.find((g) => g.groupIndex === groupIndex) ?? groups[0]) : null;
  const rows = activeGroup?.standings ?? data.standings;

  if (rows.length === 0) {
    return (
      <EmptyState title="No Matches Completed Yet" description="The points table fills in as results are recorded." />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.length > 1 ? (
        <div className="flex flex-wrap gap-1.5">
          {groups.map((g) => (
            <Chip
              key={g.groupIndex}
              size="sm"
              selected={(activeGroup?.groupIndex ?? groups[0]?.groupIndex) === g.groupIndex}
              onClick={() => setGroupIndex(g.groupIndex)}
            >
              {g.groupName}
            </Chip>
          ))}
        </div>
      ) : null}

      <TournamentStandingsTable rows={rows} />
    </div>
  );
}
