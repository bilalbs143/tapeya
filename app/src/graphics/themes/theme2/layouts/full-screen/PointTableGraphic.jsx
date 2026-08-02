/**
 * Point Table — theme3 tournament standings full-screen graphic.
 */
import { cn } from '@/lib/utils';

import { colors, fsSummaryPanel, fsTable } from '../../config';
import { DISPLAY_FONT, FSStage, ROW_ANIMATE_IN, UI_FONT } from '../../primitives';
import { FsPageHeader } from '../shared/FsPageHeader';
import { fsFont } from '../shared/fsTypographyStyles';
import { POINT_TABLE_ROW_GAP, resolvePointTableRowHeight } from './pointTableLayout';

const LEADER_ROW_BASE_DELAY_MS = 400;
const LEADER_ROW_STAGGER_MS = 200;

const STAT_COLUMNS = [
  { key: 'played', label: 'PLD', width: 52 },
  { key: 'won', label: 'WON', width: 52 },
  { key: 'lost', label: 'LOST', width: 52 },
  { key: 'nr', label: 'NR', width: 48 },
  { key: 'pts', label: 'PTS', width: 56 },
  { key: 'nrr', label: 'NRR', width: 108 },
];

const RANK_COL_W = 48;
const STAT_COL_GAP = 28;

const rowNameClass = cn(
  'overflow-hidden font-bold tracking-[0.02em] text-white uppercase',
  'text-ellipsis whitespace-nowrap',
  DISPLAY_FONT,
);

const statValueClass = cn('text-center font-bold leading-none tabular-nums text-white', DISPLAY_FONT);

const columnLabelClass = cn('text-center font-bold tracking-[0.06em] text-white/70 uppercase', UI_FONT);

const rankBadgeClass = cn('leading-none font-bold tabular-nums text-white', DISPLAY_FONT);

/** @param {number} index */
function getLeaderRowDelay(index) {
  return LEADER_ROW_BASE_DELAY_MS + index * LEADER_ROW_STAGGER_MS;
}

/** @param {number|null|undefined} nrr */
function formatNrr(nrr) {
  if (nrr == null || !Number.isFinite(Number(nrr))) return '—';
  const value = Number(nrr);
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(3)}`;
}

/** @param {boolean} top */
function getRankChipStyle(top) {
  if (top) {
    return { background: `linear-gradient(180deg, ${colors.gold}, ${colors.goldDark})` };
  }
  return { background: colors.panelBowler };
}

function PointTableHeader({ title, sub, logoUrl }) {
  return <FsPageHeader title={title} sub={sub} size="lg" logoUrl={logoUrl} logoVariant="tournament" />;
}

function PointTableColumnHeader() {
  return (
    <div className="flex w-full shrink-0 items-end pr-1">
      <div style={{ width: RANK_COL_W }} />
      <div className="min-w-0 flex-1" />

      <div className="flex shrink-0 items-center" style={{ gap: STAT_COL_GAP }}>
        {STAT_COLUMNS.map((col) => (
          <span key={col.key} className={columnLabelClass} style={{ width: col.width, ...fsFont(fsSummaryPanel.columnLabel) }}>
            {col.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** @param {{ row: object, delay?: number, rowHeight: number }} props */
function PointTableRow({ row, delay = 0, rowHeight }) {
  const top = row.rank === 1;

  return (
    <div
      className={cn('flex w-full shrink-0 items-stretch overflow-hidden rounded', ROW_ANIMATE_IN)}
      style={{
        height: Math.max(rowHeight, 68),
        background: colors.panelPlayer,
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="grid shrink-0 place-items-center rounded"
        style={{
          width: RANK_COL_W,
          margin: 10,
          ...getRankChipStyle(top),
        }}
      >
        <span className={rankBadgeClass} style={{ color: top ? colors.badgeText : '#fff', ...fsFont(fsTable.rankBadge) }}>
          {row.rank}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center px-4">
        <span className={rowNameClass} style={fsFont(fsTable.name)}>
          {row.name}
        </span>
      </div>

      <div className="flex shrink-0 items-center pr-3" style={{ gap: STAT_COL_GAP }}>
        {STAT_COLUMNS.map((col) => {
          const value = col.key === 'nrr' ? formatNrr(row.nrr) : row[col.key];

          return (
            <span key={col.key} className={statValueClass} style={{ width: col.width, ...fsFont(fsTable.statValue) }}>
              {value}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** @param {{ text: string }} props */
function PointTableFooter({ text }) {
  return (
    <div className="flex h-16 w-full shrink-0 items-center justify-center rounded" style={{ background: colors.panelBowler }}>
      <span
        className={cn('font-bold tracking-[0.08em] text-white uppercase', DISPLAY_FONT)}
        style={fsFont(fsTable.featuredValueSm)}
      >
        {text}
      </span>
    </div>
  );
}

/** @param {{ rows: object[], rowHeight: number }} props */
function PointTableRows({ rows, rowHeight }) {
  return (
    <div className="flex w-full shrink-0 flex-col" style={{ gap: POINT_TABLE_ROW_GAP }}>
      {rows.map((row, index) => (
        <PointTableRow key={row.code ?? row.rank} row={row} delay={getLeaderRowDelay(index)} rowHeight={rowHeight} />
      ))}
    </div>
  );
}

/**
 * @param {{
 *   title: string,
 *   sub?: string,
 *   data: {
 *     rows: object[],
 *     qualifyCount?: number,
 *     footerText?: string,
 *   },
 * }} props
 */
export function PointTableGraphic({ title, sub, data }) {
  const { rows, qualifyCount = 4, footerText = `TOP ${qualifyCount} TEAMS QUALIFY FOR PLAYOFFS` } = data;
  const rowHeight = resolvePointTableRowHeight(rows.length);

  return (
    <FSStage>
      <PointTableHeader title={title} sub={sub} logoUrl={data.logoUrl} />
      <div className="absolute top-[248px] right-14 bottom-12 left-14 z-[1] flex flex-col justify-start gap-8">
        <div className="flex w-full flex-col gap-3">
          <PointTableColumnHeader />
          <PointTableRows rows={rows} rowHeight={rowHeight} />
          <PointTableFooter text={footerText} />
        </div>
      </div>
    </FSStage>
  );
}
