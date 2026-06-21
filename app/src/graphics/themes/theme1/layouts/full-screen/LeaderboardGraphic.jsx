/**
 * Tournament leaderboard full-screen graphic (HIGHEST_* family).
 */
import { cn } from '@/lib/utils';

import { colors, fsSummaryPanel, fsTable } from '../../config';
import { accentGlowShadow, DISPLAY_FONT, FSStage, PlayerAvatarImage, ROW_ANIMATE_IN, UI_FONT } from '../../primitives';
import { colorHaloShadow, isTextGlowEnabled, rgbaHaloShadow } from '../../visualEffects';
import { FS_HEADER_SUB, FS_PAGE_TITLE_LG, fsFont } from '../shared/fsTypographyStyles';

const LEADER_GOLD = colors.gold;
const LEADER_ACCENT_A = colors.accentA;
const LEADER_GOLD_DARK = colors.goldDark;
const BADGE_TEXT = colors.badgeText;

const AVATAR_SLOT_W = 420;
const AVATAR_SLOT_H = 540;

const LEADER_ROW_BASE_DELAY_MS = 400;
const LEADER_ROW_STAGGER_MS = 200;

const rowNameClass = cn(
  'overflow-hidden font-bold tracking-[0.02em] text-white uppercase',
  'text-ellipsis whitespace-nowrap',
  DISPLAY_FONT,
);

const rowClubClass = cn(
  'overflow-hidden font-semibold tracking-[0.08em] text-[var(--text-secondary)] uppercase',
  'text-ellipsis whitespace-nowrap',
  UI_FONT,
);

const featuredNameTextClass = cn('font-extrabold tracking-[0.04em] text-white uppercase', DISPLAY_FONT);

const featuredValueTextClass = cn('font-extrabold leading-none', DISPLAY_FONT);

const rankBadgeClass = cn('leading-none font-extrabold', DISPLAY_FONT);

const rankHeroClass = cn('leading-none font-extrabold', DISPLAY_FONT);

/** @param {number} index */
function getLeaderRowDelay(index) {
  return LEADER_ROW_BASE_DELAY_MS + index * LEADER_ROW_STAGGER_MS;
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
      boxShadow: rgbaHaloShadow('rgba(245, 200, 90, 0.25)') ?? 'none',
    };
  }

  return {
    background: 'linear-gradient(100deg, rgba(120, 140, 255, 0.16), rgba(18, 24, 40, 0.7) 60%)',
    border: '1px solid rgba(120, 140, 255, 0.32)',
    boxShadow: rgbaHaloShadow('rgba(91, 124, 255, 0.18)') ?? 'none',
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
  if (!filled || !isTextGlowEnabled()) return undefined;
  const accent = top ? LEADER_GOLD : LEADER_ACCENT_A;
  return { textShadow: accentGlowShadow(accent, 53) };
}

function getFeaturedNameStyle() {
  return {
    borderRadius: 14,
    padding: '16px 26px',
    textAlign: 'center',
    background: 'linear-gradient(180deg, rgba(30, 38, 62, 0.92), rgba(14, 19, 32, 0.95))',
    border: '1px solid rgba(120, 140, 255, 0.4)',
    boxShadow: rgbaHaloShadow('rgba(91, 124, 255, 0.3)'),
  };
}

function getFeaturedValueStyle() {
  return {
    borderRadius: 14,
    padding: '14px 26px',
    textAlign: 'center',
    background: `linear-gradient(180deg, ${LEADER_GOLD}, ${LEADER_GOLD_DARK})`,
    boxShadow: colorHaloShadow(LEADER_GOLD, '26px', '55'),
  };
}

function LeaderboardAvatarSlot({ src, alt = 'Player avatar', width = AVATAR_SLOT_W, height = AVATAR_SLOT_H }) {
  return (
    <div className="relative flex items-end justify-center overflow-hidden" style={{ width, height }}>
      <PlayerAvatarImage src={src} alt={alt} fit="contain-bottom" rounded />
    </div>
  );
}

function LeaderboardRow({ row, delay = 0 }) {
  const filled = Boolean(row.name);
  const top = row.rank === 1;

  return (
    <div
      className={cn('flex h-[118px] w-full items-stretch overflow-hidden rounded-[16px]', ROW_ANIMATE_IN)}
      style={{
        ...getRowShellStyle(filled, top),
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="grid w-[96px] shrink-0 place-items-center" style={getRankChipStyle(filled, top)}>
        <span
          className={cn(rankBadgeClass, filled ? undefined : 'text-[var(--text-secondary)]')}
          style={filled ? { color: BADGE_TEXT, ...fsFont(fsTable.rankBadge) } : fsFont(fsTable.rankBadge)}
        >
          {row.rank}
        </span>
      </div>

      <div className="grid w-[168px] shrink-0 place-items-center border-r border-white/[0.08]">
        <span
          className={cn(rankHeroClass, filled ? 'text-white' : 'text-transparent')}
          style={{ ...getValueTextShadow(filled, top), ...fsFont(fsTable.rankHero) }}
        >
          {row.value || '—'}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-[30px]">
        <span className={rowNameClass} style={fsFont(fsTable.name)}>
          {row.name || ''}
        </span>
        {row.club ? (
          <span className={rowClubClass} style={fsFont(fsTable.nameSecondary)}>
            {row.club}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function LeaderboardRows({ rows }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-4" style={{ flex: 1.32 }}>
      {rows.map((row, index) => (
        <LeaderboardRow key={row.rank} row={row} delay={getLeaderRowDelay(index)} />
      ))}
    </div>
  );
}

function LeaderboardFeatured({ featured, avatarUrl }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-end gap-[22px]">
      <div className="flex min-h-0 flex-1 items-end justify-center">
        <LeaderboardAvatarSlot src={avatarUrl} alt={featured.name} />
      </div>

      <div className="flex w-full max-w-[440px] flex-col gap-3">
        <div style={getFeaturedNameStyle()}>
          <span className={featuredNameTextClass} style={fsFont(fsTable.featuredName)}>
            {featured.name}
          </span>
        </div>
        <div style={getFeaturedValueStyle()}>
          <span className={featuredValueTextClass} style={{ color: BADGE_TEXT, ...fsFont(fsTable.featuredValue) }}>
            {featured.value}
          </span>
        </div>
      </div>
    </div>
  );
}

function LeaderboardHeader({ title, sub }) {
  return (
    <div className="absolute top-14 right-16 left-16 z-[3] flex items-start gap-7">
      <div className="min-w-0 flex-1">
        <h2 className={FS_PAGE_TITLE_LG} style={fsFont(fsSummaryPanel.pageTitleLg)}>
          {title}
        </h2>
        {sub ? (
          <p className={FS_HEADER_SUB} style={fsFont(fsSummaryPanel.headerSub)}>
            {sub}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * @param {{ title: string, data: object, sub?: string }} props
 */
export function LeaderboardGraphic({ title, data, sub }) {
  const resolvedSub = sub ?? data.sub;

  return (
    <FSStage>
      <LeaderboardHeader title={title} sub={resolvedSub} />

      <div className="absolute top-[248px] right-16 bottom-[72px] left-16 flex gap-12">
        <LeaderboardRows rows={data.rows} />
        <LeaderboardFeatured featured={data.featured} avatarUrl={data.avatarUrl} />
      </div>
    </FSStage>
  );
}
