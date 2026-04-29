import { Fragment } from 'react';

export const STAT_DIVIDER_CLASS =
  'w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]';

const CELL_CLASS = 'flex flex-1 flex-col items-center justify-center text-[11px] px-1 py-2.5';
const LABEL_CLASS =
  'text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase';
const VALUE_CLASS = 'mt-0.5 text-[14px] font-bold text-white';

/**
 * Four-stat row with vertical dividers — shared shell for match / chase stats.
 *
 * @param {object} props
 * @param {{ label: string, value: import('react').ReactNode, key?: string }[]} props.columns
 * @param {string} [props.className] — root classes (default includes `flex`)
 */
export function StatGridRow({ columns, className = 'flex' }) {
  if (!columns?.length) return null;
  return (
    <div className={className}>
      {columns.map((col, i) => (
        <Fragment key={col.key ?? col.label}>
          {i > 0 ? <div className={STAT_DIVIDER_CLASS} aria-hidden /> : null}
          <div className={CELL_CLASS}>
            <p className={LABEL_CLASS}>{col.label}</p>
            <p className={VALUE_CLASS}>{col.value}</p>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/**
 * Match stats row – EXTRAS | OVERS | CRR | PARTNERSHIP.
 * Shared by Scoring tab and Partnership tab.
 */
export function MatchStatsRow({
  extras = 0,
  oversDisplay = '0',
  maxOvers,
  crr = '0.0',
  partnershipRuns = 0,
  partnershipBalls = 0,
}) {
  return (
    <StatGridRow
      className="mt-4 flex"
      columns={[
        { label: 'Extras', value: extras },
        {
          label: 'Overs',
          value: (
            <span className="text-[#DA9811]">
              {oversDisplay} / {maxOvers ?? ''}
            </span>
          ),
        },
        { label: 'CRR', value: crr },
        {
          label: 'Partnership',
          value: `${partnershipRuns}(${partnershipBalls})`,
        },
      ]}
    />
  );
}

/**
 * Second innings chase row – TARGET | RRR | BALLS LEFT | TO WIN.
 * Same shell as {@link MatchStatsRow}; shown below it on the Scoring tab only.
 */
export function SecondInningsChaseRow({
  target,
  requiredRunRate = '0.0',
  ballsLeft = 0,
  runsToWin = 0,
}) {
  return (
    <StatGridRow
      className="mt-2 flex"
      columns={[
        { label: 'Target', value: target },
        { label: 'RRR', value: requiredRunRate },
        { label: 'Balls left', value: ballsLeft },
        { label: 'To win', value: runsToWin },
      ]}
    />
  );
}
