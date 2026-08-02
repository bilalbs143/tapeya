/**
 * Tournament leaderboard full-screen — theme3 Highest_* / Top Batter|Bowler shell.
 * Layout follows theme1: flex 1.32 rows | flex 1 featured (bottom-aligned).
 * Chrome stays theme2 wine / gold panels.
 */
import { cn } from '@/lib/utils';

import { colors, fsTable } from '../../config';
import { DISPLAY_FONT, FSStage, PlayerAvatarImage, ROW_ANIMATE_IN, UI_FONT } from '../../primitives';
import { FsPageHeader } from '../shared/FsPageHeader';
import { fsFont } from '../shared/fsTypographyStyles';

/** Match theme1 featured portrait stage proportions. */
const AVATAR_SLOT_W = 420;
const AVATAR_SLOT_H = 540;

const LEADER_ROW_BASE_DELAY_MS = 120;
const LEADER_ROW_STAGGER_MS = 140;

const rowNameClass = cn(
  'overflow-hidden font-bold tracking-[0.02em] text-white uppercase',
  'text-ellipsis whitespace-nowrap',
  DISPLAY_FONT,
);

const rowClubClass = cn(
  'overflow-hidden font-semibold tracking-[0.08em] text-white/70 uppercase',
  'text-ellipsis whitespace-nowrap',
  UI_FONT,
);

const featuredNameTextClass = cn('text-center font-bold tracking-[0.04em] text-white uppercase', DISPLAY_FONT);

const featuredValueTextClass = cn('font-bold leading-none tabular-nums text-white', DISPLAY_FONT);

const rankBadgeClass = cn('leading-none font-bold tabular-nums text-white', DISPLAY_FONT);

const rankHeroClass = cn('leading-none font-bold tabular-nums text-white', DISPLAY_FONT);

/** @param {number} index */
function getLeaderRowDelay(index) {
  return LEADER_ROW_BASE_DELAY_MS + index * LEADER_ROW_STAGGER_MS;
}

/** @param {number|string} rank */
function formatRank(rank) {
  return String(rank).padStart(2, '0');
}

function LeaderboardAvatarSlot({ src, alt = 'Player avatar', width = AVATAR_SLOT_W, height = AVATAR_SLOT_H }) {
  return (
    <div className="relative flex items-end justify-center overflow-hidden rounded-t" style={{ width, height }}>
      <PlayerAvatarImage src={src} alt={alt} fit="contain-bottom" rounded={false} />
    </div>
  );
}

function LeaderboardRow({ row, delay = 0, active = false }) {
  const filled = Boolean(row.name);

  return (
    <div
      className={cn(
        'flex h-[118px] w-full items-stretch overflow-hidden rounded',
        ROW_ANIMATE_IN,
        active && 'outline outline-1 outline-white/18',
      )}
      style={{
        background: colors.panelPlayer,
        animationDelay: `${delay}ms`,
        opacity: filled ? 1 : 0.45,
      }}
    >
      <div className="grid w-[96px] shrink-0 place-items-center" style={{ background: colors.panelBowler }}>
        <span className={rankBadgeClass} style={fsFont(fsTable.rankBadge)}>
          {formatRank(row.rank)}
        </span>
      </div>

      <div className="grid w-[168px] shrink-0 place-items-center border-r border-white/12">
        <span className={cn(rankHeroClass, !filled && 'text-transparent')} style={fsFont(fsTable.rankHero)}>
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

function LeaderboardRows({ rows, featuredRank }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-4" style={{ flex: 1.32 }}>
      {rows.map((row, index) => (
        <LeaderboardRow
          key={row.rank}
          row={row}
          delay={getLeaderRowDelay(index)}
          active={featuredRank != null && Number(row.rank) === Number(featuredRank)}
        />
      ))}
    </div>
  );
}

function LeaderboardFeatured({ featured, avatarUrl }) {
  if (!featured) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-end gap-[22px]">
      <div className="flex min-h-0 flex-1 items-end justify-center">
        <LeaderboardAvatarSlot src={avatarUrl} alt={featured.name} />
      </div>

      <div className="flex w-full max-w-[440px] flex-col">
        <div className="flex min-h-14 w-full items-center justify-center px-4" style={{ background: colors.panelPlayer }}>
          <span className={featuredNameTextClass} style={fsFont(fsTable.featuredName)}>
            {featured.name}
          </span>
        </div>
        <div
          className="flex min-h-[72px] w-full items-center justify-center rounded-b px-4"
          style={{ background: colors.panelBowler }}
        >
          <span className={featuredValueTextClass} style={fsFont(fsTable.featuredValue)}>
            {featured.value ?? '—'}
          </span>
        </div>
      </div>
    </div>
  );
}

function LeaderboardHeader({ title, sub, logoUrl }) {
  return <FsPageHeader title={title} sub={sub} size="lg" logoUrl={logoUrl} logoVariant="tournament" />;
}

/**
 * @param {{ title: string, data: object, sub?: string }} props
 */
export function LeaderboardGraphic({ title, data, sub }) {
  const resolvedSub = sub ?? data.sub;
  const featuredRank = data.featured?.rank ?? data.rows?.[0]?.rank ?? null;

  return (
    <FSStage>
      <LeaderboardHeader title={title} sub={resolvedSub} logoUrl={data.logoUrl} />

      <div className="absolute top-[248px] right-16 bottom-[72px] left-16 z-[1] flex gap-12">
        <LeaderboardRows rows={data.rows} featuredRank={featuredRank} />
        <LeaderboardFeatured featured={data.featured} avatarUrl={data.avatarUrl} />
      </div>
    </FSStage>
  );
}
