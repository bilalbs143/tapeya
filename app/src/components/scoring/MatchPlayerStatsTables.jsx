import {
  formatMatchBowlingOvers,
  formatMatchStatRate,
  matchPlayerName,
  sortMatchStatRows,
} from '@/lib/utils/matchPlayerStatsUtils';

const TABLE_HEAD = 'bg-surface px-3 py-2 text-[10px] font-bold tracking-wide text-brand uppercase lg:px-4 lg:py-3 lg:text-[12px]';
const TABLE_CELL = 'border-t border-border-subtle px-3 py-2.5 text-[12px] text-white lg:px-4 lg:py-3 lg:text-[14px]';

function StatsTable({ title, headers, rows, emptyMessage }) {
  return (
    <section className="border-border-subtle overflow-hidden rounded-lg border bg-black">
      <h3 className="border-border-subtle bg-surface text-brand border-b px-3 py-2 text-[11px] font-bold tracking-wide uppercase lg:px-4 lg:py-3 lg:text-[13px]">
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-muted px-3 py-4 text-center text-[12px] lg:px-4 lg:py-5 lg:text-[14px]">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header} className={`${TABLE_HEAD} text-left first:min-w-[120px]`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  {row.cells.map((cell, index) => (
                    <td
                      key={`${row.key}-${index}`}
                      className={`${TABLE_CELL} ${index === 0 ? 'font-medium text-white' : 'text-muted'}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/**
 * Per-match batting / bowling / fielding from `GET /matches/{match}/player-stats`.
 *
 * @param {object|null} data API response `{ batting, bowling, fielding }`
 * @param {Record<string, string>} playerNameMap
 * @param {boolean} [isLoading]
 * @param {boolean} [isError]
 */
export function MatchPlayerStatsTables({ data, playerNameMap = {}, isLoading = false, isError = false }) {
  if (isLoading) {
    return (
      <section className="bg-surface rounded-lg px-4 py-6 text-center" aria-label="Loading Match Player Stats">
        <p className="text-muted text-[13px]">Loading player stats…</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="bg-surface rounded-lg px-4 py-6 text-center" aria-label="Match Player Stats Unavailable">
        <p className="text-muted text-[13px]">Player stats could not be loaded.</p>
      </section>
    );
  }

  const battingRows = sortMatchStatRows(data?.batting ?? [], (row) => row.runs ?? 0)
    .filter((row) => (row.runs ?? 0) > 0 || (row.balls_faced ?? 0) > 0 || row.dismissal_type != null)
    .map((row) => ({
      key: `bat-${row.player_id}`,
      cells: [
        matchPlayerName(playerNameMap, row.player_id),
        row.runs ?? 0,
        row.balls_faced ?? 0,
        row.fours ?? 0,
        row.sixes ?? 0,
        formatMatchStatRate(row.strike_rate),
      ],
    }));

  const bowlingRows = sortMatchStatRows(data?.bowling ?? [], (row) => row.wickets ?? 0)
    .filter((row) => (row.overs ?? 0) > 0 || (row.wickets ?? 0) > 0)
    .map((row) => ({
      key: `bowl-${row.player_id}`,
      cells: [
        matchPlayerName(playerNameMap, row.player_id),
        formatMatchBowlingOvers(row.overs),
        row.maidens ?? 0,
        row.runs_conceded ?? 0,
        row.wickets ?? 0,
        formatMatchStatRate(row.economy),
      ],
    }));

  const fieldingRows = sortMatchStatRows(
    data?.fielding ?? [],
    (row) => (row.catches ?? 0) + (row.run_outs ?? 0) + (row.stumpings ?? 0),
  )
    .filter((row) => (row.catches ?? 0) + (row.run_outs ?? 0) + (row.stumpings ?? 0) > 0)
    .map((row) => ({
      key: `field-${row.player_id}`,
      cells: [matchPlayerName(playerNameMap, row.player_id), row.catches ?? 0, row.run_outs ?? 0, row.stumpings ?? 0],
    }));

  const hasAny = battingRows.length > 0 || bowlingRows.length > 0 || fieldingRows.length > 0;

  if (!hasAny) {
    return (
      <section className="bg-surface rounded-lg px-4 py-6 text-center" aria-label="No Match Player Stats">
        <p className="text-muted text-[13px]">No player stats yet. Start scoring to see match totals.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5" aria-label="Match Player Stats">
      <StatsTable
        title="Batting (Match)"
        headers={['Player', 'R', 'B', '4s', '6s', 'SR']}
        rows={battingRows}
        emptyMessage="No batting stats recorded."
      />
      <StatsTable
        title="Bowling (Match)"
        headers={['Player', 'O', 'M', 'R', 'W', 'Econ']}
        rows={bowlingRows}
        emptyMessage="No bowling stats recorded."
      />
      <StatsTable
        title="Fielding (Match)"
        headers={['Player', 'Catches', 'Run Outs', 'Stumpings']}
        rows={fieldingRows}
        emptyMessage="No fielding stats recorded."
      />
    </div>
  );
}

export default MatchPlayerStatsTables;
