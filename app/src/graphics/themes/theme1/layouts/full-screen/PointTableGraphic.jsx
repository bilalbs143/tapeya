/**
 * Point Table — tournament standings full-screen graphic.
 */
import { cn } from '@/lib/utils';

import { colors } from '../../config';
import { accentGlowShadow, DISPLAY_FONT, FSStage, ROW_ANIMATE_IN, UI_FONT } from '../../primitives';
import { POINT_TABLE_ROW_GAP, resolvePointTableRowHeight } from './pointTableLayout';

const LEADER_GOLD = colors.gold;
const LEADER_ACCENT_A = colors.accentA;
const LEADER_GOLD_DARK = colors.goldDark;
const BADGE_TEXT = colors.badgeText;

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

const RANK_COL_W = 70;
const STAT_COL_GAP = 36;

const headerTitleClass = cn(
  'm-0 text-[78px] font-extrabold leading-[0.96] tracking-[0.01em] text-white uppercase',
  DISPLAY_FONT,
  '[text-shadow:0_2px_18px_rgba(0,0,0,0.5)]',
);

const headerSubClass = cn('mt-2 mb-0 text-[26px] font-semibold tracking-[0.06em] text-[var(--muted)] uppercase', UI_FONT);

const rowNameClass = cn(
  'overflow-hidden text-[38px] font-bold tracking-[0.02em] text-white uppercase',
  'text-ellipsis whitespace-nowrap',
  DISPLAY_FONT,
);

const featuredValueTextClass = cn('text-[60px] font-extrabold leading-none text-[#0a0e17]', DISPLAY_FONT);

const statValueClass = cn('text-[34px] font-extrabold leading-none text-white tabular-nums', DISPLAY_FONT);

const columnLabelClass = cn('text-[21px] font-semibold tracking-[0.08em] text-[var(--muted)] uppercase', UI_FONT);

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

/** @param {boolean} filled @param {boolean} top */
function getRowShellStyle(filled, top) {
  if (!filled) {
    return {
      background: 'rgba(255, 255, 255, 0.035)',
      border: '1px solid rgba(255, 255, 255, 0.07)',
      boxShadow: 'none',
    };
  }

  if (top) {
    return {
      background: 'linear-gradient(100deg, rgba(245, 200, 90, 0.22), rgba(20, 26, 42, 0.7) 60%)',
      border: '1px solid rgba(245, 200, 90, 0.45)',
      boxShadow: '0 0 calc(20px * var(--glow)) rgba(245, 200, 90, 0.25)',
    };
  }

  return {
    background: 'linear-gradient(100deg, rgba(120, 140, 255, 0.16), rgba(18, 24, 40, 0.7) 60%)',
    border: '1px solid rgba(120, 140, 255, 0.32)',
    boxShadow: '0 0 calc(20px * var(--glow)) rgba(91, 124, 255, 0.18)',
  };
}

/** @param {boolean} filled @param {boolean} top */
function getRankChipStyle(filled, top) {
  if (!filled) {
    return { background: 'rgba(255, 255, 255, 0.05)' };
  }

  const accent = top ? LEADER_GOLD : LEADER_ACCENT_A;
  const accentEnd = top ? LEADER_GOLD_DARK : 'var(--accentB)';

  return { background: `linear-gradient(180deg, ${accent}, ${accentEnd})` };
}

/** @param {boolean} filled @param {boolean} top */
function getValueTextShadow(filled, top) {
  if (!filled) return undefined;

  const accent = top ? LEADER_GOLD : LEADER_ACCENT_A;
  return { textShadow: accentGlowShadow(accent, 53) };
}

function getFeaturedValueStyle() {
  return {
    borderRadius: 14,
    padding: '14px 26px',
    textAlign: 'center',
    background: `linear-gradient(180deg, ${LEADER_GOLD}, ${LEADER_GOLD_DARK})`,
    boxShadow: `0 0 calc(26px * var(--glow)) ${LEADER_GOLD}55`,
  };
}

function LeaderboardHeader({ title, sub, compact = false }) {
  return (
    <div className={`absolute right-16 left-16 z-[3] flex items-start gap-7 ${compact ? 'top-10' : 'top-14'}`}>
      <div className="min-w-0 flex-1">
        <h2 className={headerTitleClass}>{title}</h2>
        {sub ? <p className={headerSubClass}>{sub}</p> : null}
      </div>
    </div>
  );
}

function PointTableColumnHeader() {
  return (
    <div className="flex w-full shrink-0 items-end pr-1">
      <div style={{ width: RANK_COL_W }} />
      <div className="min-w-0 flex-1" />

      <div className="flex shrink-0 items-center" style={{ gap: STAT_COL_GAP }}>
        {STAT_COLUMNS.map((col) => (
          <span key={col.key} className={cn(columnLabelClass, 'text-center')} style={{ width: col.width }}>
            {col.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** @param {{ row: object, delay?: number, rowHeight: number }} props */
function PointTableRow({ row, delay = 0, rowHeight }) {
  const filled = true;
  const top = row.rank === 1;

  return (
    <div
      className={cn('flex w-full shrink-0 items-stretch overflow-hidden rounded-[16px]', ROW_ANIMATE_IN)}
      style={{
        height: rowHeight,
        ...getRowShellStyle(filled, top),
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="grid shrink-0 place-items-center"
        style={{
          width: RANK_COL_W,
          ...getRankChipStyle(filled, top),
        }}
      >
        <span className={cn('text-[36px] leading-none font-extrabold', DISPLAY_FONT)} style={{ color: BADGE_TEXT }}>
          {row.rank}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center border-r border-white/[0.08] px-6">
        <span className={rowNameClass}>{row.name}</span>
      </div>

      <div className="flex shrink-0 items-center pr-1" style={{ gap: STAT_COL_GAP }}>
        {STAT_COLUMNS.map((col) => {
          const value = col.key === 'nrr' ? formatNrr(row.nrr) : row[col.key];
          const emphasize = col.key === 'pts';

          return (
            <span
              key={col.key}
              className={cn('text-center', statValueClass)}
              style={{
                width: col.width,
                ...(emphasize ? getValueTextShadow(filled, top) : undefined),
              }}
            >
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
    <div className="flex h-[58px] w-full shrink-0 items-center justify-center rounded-[14px]" style={getFeaturedValueStyle()}>
      <span className={cn(featuredValueTextClass, 'text-[32px] tracking-[0.04em]')}>{text}</span>
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
      <LeaderboardHeader title={title} sub={sub} compact />

      <div className="absolute top-[168px] right-16 bottom-14 left-16 flex flex-col justify-center">
        <div className="flex w-full flex-col gap-2">
          <PointTableColumnHeader />
          <PointTableRows rows={rows} rowHeight={rowHeight} />
          <PointTableFooter text={footerText} />
        </div>
      </div>
    </FSStage>
  );
}
