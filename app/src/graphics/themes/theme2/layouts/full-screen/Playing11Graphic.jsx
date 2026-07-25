/**
 * Playing XI FS — theme3 dual-tone panels + theme1 page header size/placement.
 * Theme2 extras: C/WK badges, optional RRR band.
 */
import { cn } from '@/lib/utils';

import { colors, fsSquad } from '../../config';
import {
  accentGlowShadow,
  accentMix,
  DISPLAY_FONT,
  FSStage,
  normalizeAccentColor,
  ROW_ANIMATE_IN,
  TeamLogoOrCrest,
} from '../../primitives';
import { colorHaloShadow } from '../../visualEffects';
import { FsPageHeader } from '../shared/FsPageHeader';
import { fsFont } from '../shared/fsTypographyStyles';

const PANEL_LOGO_SIZE = 48;
const BADGE_SIZE = 26;

const XI_ROW_BASE_DELAY_MS = 120;
const XI_ROW_STAGGER_MS = 55;

/** Theme3 accent bars — cool blue (batsman) / gold (bowler). */
const ACCENT_BATSMAN = 'rgba(180, 210, 255, 0.85)';
const ACCENT_BOWLER = '#e0c05a';

const PANEL_BODY = {
  batsman: 'rgba(46, 10, 26, 0.92)',
  bowler: 'rgba(120, 0, 32, 0.55)',
};

const GOLD_BADGE = `linear-gradient(180deg, ${colors.gold}, ${colors.goldDark})`;

/** @param {number} index */
function getXiRowDelay(index) {
  return XI_ROW_BASE_DELAY_MS + index * XI_ROW_STAGGER_MS;
}

/** @param {'batsman'|'bowler'} tone */
function resolveTone(entry, index) {
  if (entry?.tone === 'bowler' || entry?.theme === 'bowler') return 'bowler';
  if (entry?.tone === 'batsman' || entry?.theme === 'batsman') return 'batsman';
  return index === 1 ? 'bowler' : 'batsman';
}

function RoleBadge({ label, fontSize }) {
  return (
    <span
      className={cn('ml-2 grid shrink-0 place-items-center rounded-full leading-none font-extrabold', DISPLAY_FONT)}
      style={{
        width: BADGE_SIZE,
        height: BADGE_SIZE,
        background: GOLD_BADGE,
        color: colors.badgeText,
        fontSize,
      }}
    >
      {label}
    </span>
  );
}

function XiPlayerRow({ player, accent, last = false, index }) {
  const barAccent = normalizeAccentColor(accent, ACCENT_BATSMAN);
  const name = typeof player === 'string' ? player : (player?.name ?? '');
  const captain = typeof player === 'object' && Boolean(player?.captain);
  const wicketKeeper = typeof player === 'object' && Boolean(player?.wicketKeeper);

  return (
    <li
      className={cn(ROW_ANIMATE_IN, 'flex min-h-0 flex-1 items-center gap-3.5', !last && 'border-b border-white/15')}
      style={{ animationDelay: `${getXiRowDelay(index)}ms` }}
    >
      <span
        className="h-[18px] w-[3px] shrink-0 rounded-sm"
        style={{
          background: barAccent,
          boxShadow: accentGlowShadow(barAccent, 100, '8px'),
        }}
        aria-hidden
      />
      <span
        className={cn(
          'min-w-0 overflow-hidden font-semibold tracking-[0.02em] text-ellipsis whitespace-nowrap text-white uppercase',
          DISPLAY_FONT,
        )}
        style={fsFont(fsSquad.playerListName)}
      >
        {name}
      </span>
      {captain ? <RoleBadge label="C" fontSize={fsSquad.captainBadge} /> : null}
      {wicketKeeper ? <RoleBadge label="WK" fontSize={fsSquad.roleBadgeSm} /> : null}
    </li>
  );
}

function XIPanel({ team, tone }) {
  const { name, logoUrl, players = [], teamCode, accent, code } = team;
  const label = name || code || teamCode || '';
  const shortCode = String(code || teamCode || '?').toUpperCase();
  const panelAccent = normalizeAccentColor(accent, tone === 'bowler' ? ACCENT_BOWLER : colors.panelPlayer);
  const markTeam = {
    code: shortCode,
    name: label,
    color: panelAccent,
    logoUrl: logoUrl ?? null,
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md" style={{ background: PANEL_BODY[tone] }}>
      <header
        className="flex items-center gap-4 border-b border-white/25 px-6 py-4"
        style={{
          background: `linear-gradient(100deg, ${accentMix(panelAccent, 80)}, ${accentMix(panelAccent, 27)})`,
        }}
      >
        <span
          className={cn('min-w-0 flex-1 truncate font-black tracking-[0.03em] text-white uppercase', DISPLAY_FONT)}
          style={fsFont(fsSquad.panelTeamName)}
        >
          {label}
        </span>
        <TeamLogoOrCrest
          logoUrl={logoUrl}
          team={markTeam}
          name={label}
          shortName={shortCode}
          accent={panelAccent}
          size={PANEL_LOGO_SIZE}
          plain={Boolean(logoUrl)}
        />
      </header>

      <ul className="flex flex-1 flex-col px-6 py-1">
        {players.map((player, index) => (
          <XiPlayerRow
            key={`${typeof player === 'string' ? player : player.name}-${index}`}
            player={player}
            accent={panelAccent}
            last={index === players.length - 1}
            index={index}
          />
        ))}
      </ul>
    </section>
  );
}

/** Theme2-only footer — not in theme3 Playing XI. */
function RequiredRunRateBand({ value }) {
  if (value == null || value === '') return null;

  return (
    <div
      className="absolute right-[70px] bottom-10 left-[70px] z-[3] grid h-[68px] place-items-center rounded-xl"
      style={{
        background: `linear-gradient(100deg, ${colors.gold}, ${colors.goldDark})`,
        boxShadow: colorHaloShadow(colors.gold),
      }}
    >
      <span
        className={cn('font-extrabold tracking-[0.06em] whitespace-nowrap uppercase', DISPLAY_FONT)}
        style={{ color: colors.badgeText, ...fsFont(fsSquad.goldBand) }}
      >
        REQUIRED RUN RATE : {value}
      </span>
    </div>
  );
}

/**
 * @param {{
 *   data: {
 *     title?: string,
 *     sub?: string,
 *     teams: Array<{ teamCode?: string, name?: string, logoUrl?: string, tone?: string, theme?: string, players?: Array }>,
 *     requiredRR?: string|number|null,
 *   },
 *   teams?: Record<string, object>,
 * }} props
 */
export function Playing11Graphic({ data, teams: _teams }) {
  const [teamA, teamB] = data.teams ?? [];
  if (!teamA || !teamB) return null;

  const hasRrr = data.requiredRR != null && data.requiredRR !== '';

  return (
    <FSStage>
      <FsPageHeader title={data.title ?? 'PLAYING XI'} sub={data.sub} size="md" logoUrl={data.logoUrl} logoVariant="tournament" />

      <div
        className="absolute right-[70px] left-[70px] z-[1] flex gap-11"
        style={{
          top: 248,
          bottom: hasRrr ? 140 : 70,
        }}
      >
        <XIPanel team={teamA} tone={resolveTone(teamA, 0)} />
        <XIPanel team={teamB} tone={resolveTone(teamB, 1)} />
      </div>

      <RequiredRunRateBand value={data.requiredRR} />
    </FSStage>
  );
}
