import { useState } from 'react';

import { SectionLabel } from '@/shared/layout';
import { Chip } from '@/shared/ui/Chip';
import { DenseTable, DenseTableHeader, DenseTableRow } from '@/shared/ui/DenseTable';
import { Spinner } from '@/shared/ui/Spinner';
import { EmptyState, ErrorState } from '@/shared/ui/states';

import { useGetTournamentSeasonStatsQuery } from '../api/tournamentsApi';
import { formatAvg, SEASON_BATTING_COLUMNS, SEASON_BOWLING_COLUMNS } from '../model/seasonStatsSchemas';

type PublicTournamentStatsTabProps = {
  tournamentId: number;
};

type StatPane = 'batting' | 'bowling';

/** Public `/tournaments/:id` Stats tab — tournament leaderboards from season-stats. */

export function PublicTournamentStatsTab({ tournamentId }: PublicTournamentStatsTabProps) {
  const { data, isLoading, isError, refetch } = useGetTournamentSeasonStatsQuery(tournamentId);
  const [pane, setPane] = useState<StatPane>('batting');

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label="Loading Season Stats" />
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState title="Couldn't Load Season Stats" onRetry={() => void refetch()} />;
  }

  const hasRows =
    data.topRunScorers.length > 0 || data.topWicketTakers.length > 0 || data.totalFours > 0 || data.totalSixes > 0;

  if (!hasRows) {
    return <EmptyState title="No Stats Yet" description="Leaderboards appear after enough matches are played." />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <MetricTile label="Total Fours" value={String(data.totalFours)} />
        <MetricTile label="Total Sixes" value={String(data.totalSixes)} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip size="sm" selected={pane === 'batting'} onClick={() => setPane('batting')}>
          Batting
        </Chip>
        <Chip size="sm" selected={pane === 'bowling'} onClick={() => setPane('bowling')}>
          Bowling
        </Chip>
      </div>

      {pane === 'batting' ? (
        data.topRunScorers.length ? (
          <div className="flex flex-col gap-2">
            <SectionLabel as="h2">Top Run Scorers</SectionLabel>
            <DenseTable columns={SEASON_BATTING_COLUMNS}>
              <DenseTableHeader />
              {data.topRunScorers.map((row, i) => (
                <DenseTableRow
                  key={row.playerId}
                  cells={{
                    pos: i + 1,
                    player: row.name,
                    inns: row.innings,
                    runs: row.runs,
                    avg: formatAvg(row.average),
                    fours: row.fours,
                    sixes: row.sixes,
                  }}
                />
              ))}
            </DenseTable>
          </div>
        ) : (
          <EmptyState title="No Batting Numbers Yet" />
        )
      ) : data.topWicketTakers.length ? (
        <div className="flex flex-col gap-2">
          <SectionLabel as="h2">Top Wicket Takers</SectionLabel>
          <DenseTable columns={SEASON_BOWLING_COLUMNS}>
            <DenseTableHeader />
            {data.topWicketTakers.map((row, i) => (
              <DenseTableRow
                key={row.playerId}
                cells={{
                  pos: i + 1,
                  player: row.name,
                  wickets: row.wickets,
                  overs: row.overs,
                  runs: row.runsConceded,
                  econ: row.economy != null ? row.economy.toFixed(2) : '—',
                }}
              />
            ))}
          </DenseTable>
        </div>
      ) : (
        <EmptyState title="No Bowling Numbers Yet" />
      )}

      <p className="text-muted border-border-subtle bg-surface rounded-panel border px-3 py-2.5 text-3xs leading-relaxed">
        Tournament totals, not per-match charts. Wagon wheel and over comparison live on a match.
      </p>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border-subtle bg-surface rounded-card border px-3.5 py-3">
      <p className="font-mono text-dim text-4xs font-bold tracking-eyebrow uppercase">{label}</p>
      <p className="font-mono mt-1 text-title-sm font-extrabold text-ink">{value}</p>
    </div>
  );
}
