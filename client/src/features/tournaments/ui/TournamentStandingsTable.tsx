import { cn } from '@/shared/lib/cn';
import { DenseTable, type DenseTableColumn, DenseTableHeader, DenseTableRow } from '@/shared/ui/DenseTable';

import { formatNrr, nrrToneClass, STANDINGS_COLUMNS, type StandingsRow } from '../model/standingsSchemas';

type TournamentStandingsTableProps = {
  rows: StandingsRow[];
  columns?: DenseTableColumn[] | undefined;
  density?: 'comfortable' | 'compact' | undefined;
  /** Team ids to highlight (match home/away). */
  highlightTeamIds?: ReadonlySet<number> | undefined;
  onRowClick?: ((row: StandingsRow) => void) | undefined;
  className?: string | undefined;
};

/** League table on DenseTable — public tournament Table tab + match StandingsPane. */

export function TournamentStandingsTable({
  rows,
  columns = STANDINGS_COLUMNS,
  density = 'comfortable',
  highlightTeamIds,
  onRowClick,
  className,
}: TournamentStandingsTableProps) {
  return (
    <DenseTable columns={columns} density={density} className={className}>
      <DenseTableHeader />
      {rows.map((row, i) => {
        const selected = highlightTeamIds?.has(row.teamId) ?? false;
        const showPts = columns.some((c) => c.key === 'points');
        const showLost = columns.some((c) => c.key === 'lost');
        return (
          <DenseTableRow
            key={row.teamId}
            selected={selected}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            cells={{
              pos: {
                node: (
                  <span
                    className={cn(
                      'font-mono text-2xs tabular-nums',
                      selected ? 'text-brand-text font-extrabold' : 'text-dim font-bold'
                    )}
                  >
                    {i + 1}
                  </span>
                ),
              },
              team: {
                node: (
                  <span
                    className={cn(
                      'block truncate text-2xs',
                      selected ? 'font-bold text-ink' : 'text-body font-semibold'
                    )}
                  >
                    {row.teamName}
                  </span>
                ),
              },
              played: row.played,
              won: row.won,
              ...(showLost ? { lost: row.lost } : {}),
              ...(showPts ? { points: row.points } : {}),
              nrr: {
                node: (
                  <span className={cn('font-mono text-2xs tabular-nums', nrrToneClass(row.nrr))}>
                    {formatNrr(row.nrr)}
                  </span>
                ),
              },
            }}
          />
        );
      })}
    </DenseTable>
  );
}
