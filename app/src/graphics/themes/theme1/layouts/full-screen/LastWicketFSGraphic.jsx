/**
 * Last wicket full-screen — dismissed batter match scorecard.
 */
import { cn } from '@/lib/utils';

import { DISPLAY_FONT, fmt, GlowPanel, PlayerAvatarImage, TeamLogoOrCrest, UI_FONT } from '../../primitives';
import { StatTile } from '../shared/StatTile';

const AVATAR_W = 560;
const AVATAR_H = 760;
const PANEL_W = 560;
const CREST_SIZE = 210;
const STAT_TILE_H = 126;
const STAT_TILE_GAP = 16;

const STAT_FIELDS = [
  { key: 'runs', label: 'RUNS' },
  { key: 'balls', label: 'BALLS' },
  { key: 'fours', label: 'FOURS' },
  { key: 'sixes', label: 'SIXES' },
  { key: 'sr', label: 'S - RATE' },
];

const firstNameClass = cn('text-[46px] font-semibold leading-none tracking-[0.02em] text-[var(--text)] uppercase', DISPLAY_FONT);

const lastNameClass = cn(
  'text-[92px] font-extrabold leading-[0.95] tracking-[0.01em] text-white uppercase',
  DISPLAY_FONT,
  '[text-shadow:0_0_calc(20px*var(--glow))_rgba(120,140,255,0.5)]',
);

const dismissalClass = cn('mt-3 text-[28px] font-semibold tracking-[0.08em] text-[var(--muted)] uppercase', UI_FONT);

const headerSubClass = cn('m-0 text-[26px] font-semibold tracking-[0.06em] text-[var(--muted)] uppercase', UI_FONT);

function resolveBatter(batter, teams) {
  if (!batter?.name && !batter?.firstName) return null;
  const team = batter.teamCode ? teams[batter.teamCode] : null;
  return {
    batter,
    team,
    accent: team?.color ?? 'var(--accentA)',
  };
}

function resolveContent(batter) {
  if (batter.firstName) {
    return {
      firstName: batter.firstName,
      lastName: batter.lastName ?? '',
    };
  }

  const parts = (batter.name ?? '').trim().split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

/**
 * @param {{ batter: object, teams: Record<string, object>, sub?: string }} props
 */
export function LastWicketFSGraphic({ batter, teams, sub }) {
  const resolved = resolveBatter(batter, teams);
  if (!resolved) return null;

  const { batter: b, team, accent } = resolved;
  const { firstName, lastName } = resolveContent(b);
  const logoUrl = b.logoUrl ?? team?.logoUrl;
  const avatarUrl = b.avatarUrl;
  const statsColumnHeight = STAT_FIELDS.length * STAT_TILE_H + (STAT_FIELDS.length - 1) * STAT_TILE_GAP;

  const statValues = {
    runs: b.runs ?? 0,
    balls: b.balls ?? 0,
    fours: b.fours ?? 0,
    sixes: b.sixes ?? 0,
    sr: b.sr ?? fmt.strikeRate(b.runs ?? 0, b.balls ?? 0),
  };

  return (
    <>
      {sub ? <p className={cn('absolute top-14 right-16 left-16 z-[3] text-center', headerSubClass)}>{sub}</p> : null}
      <div className="absolute inset-0 flex items-center justify-center gap-10 px-16">
        <div className="relative shrink-0 overflow-hidden" style={{ width: AVATAR_W, height: AVATAR_H }}>
          <PlayerAvatarImage src={avatarUrl} alt={b.name ?? `${firstName} ${lastName}`} fit="cover-top" />
        </div>

        <div className="flex flex-col gap-4" style={{ height: AVATAR_H }}>
          {STAT_FIELDS.map((field) => (
            <StatTile key={field.key} label={field.label} value={statValues[field.key]} accent={accent} />
          ))}
        </div>

        <GlowPanel className="flex shrink-0 flex-col px-10 py-12" style={{ width: PANEL_W, height: statsColumnHeight }}>
          <div className="flex items-start justify-between gap-6">
            <TeamLogoOrCrest logoUrl={logoUrl} team={team} accent={accent} size={CREST_SIZE} borderPulseOrder={1} />
          </div>
          <div className="mt-8">
            <p className={firstNameClass}>{firstName}</p>
            <p className={lastNameClass}>{lastName}</p>
            {b.dismissal ? <p className={dismissalClass}>{b.dismissal}</p> : null}
            {b.role ? <p className={cn('mt-2 text-[32px] font-bold text-white capitalize', DISPLAY_FONT)}>{b.role}</p> : null}
          </div>
        </GlowPanel>
      </div>
    </>
  );
}
