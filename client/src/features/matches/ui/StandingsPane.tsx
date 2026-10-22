import { Link } from 'react-router-dom';

import {
  selectStandingsForMatch,
  tournamentRoutes,
  TournamentStandingsTable,
  useGetTournamentStandingsQuery,
} from '@/features/tournaments';

import { SectionLabel } from '@/shared/layout';
import { Spinner } from '@/shared/ui/Spinner';
import { EmptyState, ErrorState } from '@/shared/ui/states';

type StandingsPaneProps = {
  tournamentId: number;
  homeTeamId: number | null;
  awayTeamId: number | null;
};

/** Fan match Table pane — group slice for this fixture + link to full public table. */

export function StandingsPane({ tournamentId, homeTeamId, awayTeamId }: StandingsPaneProps) {
  const { data, isLoading, isError, refetch } = useGetTournamentStandingsQuery(tournamentId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label="Loading Table" />
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState title="Couldn't Load Table" onRetry={() => void refetch()} />;
  }

  const { groupName, rows } = selectStandingsForMatch(data, homeTeamId, awayTeamId);

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No Table for This Fixture"
        description="Group standings appear for matches that belong to a league stage."
      />
    );
  }

  const highlight = new Set([homeTeamId, awayTeamId].filter((id): id is number => id != null && id > 0));
  const label = groupName ?? 'Table';

  return (
    <section className="flex flex-col">
      <SectionLabel
        as="h2"
        action={
          <Link
            to={tournamentRoutes.public(tournamentId)}
            className="text-brand-text hover:text-brand-hover focus-visible:outline-brand rounded text-2xs font-bold focus-visible:outline-2"
          >
            Full Table
          </Link>
        }
      >
        {label}
      </SectionLabel>
      <TournamentStandingsTable rows={rows} highlightTeamIds={highlight} />
    </section>
  );
}
