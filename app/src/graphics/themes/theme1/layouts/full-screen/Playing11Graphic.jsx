/**
 * Ported from theme-controller — render-only graphic.
 */
import { cn } from '@/lib/utils';

import { colors, fsSquad, fsSummaryPanel } from '../../config';
import {
  accentGlowShadow,
  accentMix,
  Crest,
  DISPLAY_FONT,
  FSStage,
  normalizeAccentColor,
  ROW_ANIMATE_IN,
} from '../../primitives';
import { colorHaloShadow } from '../../visualEffects';
import { FS_HEADER_SUB, FS_PAGE_TITLE_MD, fsFont } from '../shared/fsTypographyStyles';

const PLAYING11_GOLD = colors.gold;

/** Stagger base delay (ms) before the first XI row animates in. */
const XI_ROW_BASE_DELAY_MS = 120;

/** Per-row stagger increment (ms). */
const XI_ROW_STAGGER_MS = 55;

const PANEL_LOGO_SIZE = 64;

const panelTeamNameClass = cn('font-extrabold text-white uppercase', DISPLAY_FONT);

const playerNameClass = cn(
  'font-bold tracking-[0.02em] text-white uppercase',
  'overflow-hidden text-ellipsis whitespace-nowrap min-w-0',
  DISPLAY_FONT,
);

const rrrBandTextClass = cn('font-extrabold tracking-[0.06em] text-[#0a0e17] uppercase', 'whitespace-nowrap', DISPLAY_FONT);

const roleBadgeClass = cn('grid shrink-0 place-items-center rounded-full font-extrabold leading-none', DISPLAY_FONT);

/** @param {number} index zero-based row index */
function getXiRowDelay(index) {
  return XI_ROW_BASE_DELAY_MS + index * XI_ROW_STAGGER_MS;
}

/** @param {{ label: string, fontSize: number }} props */
function XiRoleBadge({ label, fontSize }) {
  return (
    <span
      className={cn(roleBadgeClass, 'ml-2.5 size-[30px]')}
      style={{
        background: `linear-gradient(180deg, ${PLAYING11_GOLD}, ${colors.goldDark})`,
        color: colors.badgeText,
        fontSize,
      }}
    >
      {label}
    </span>
  );
}

function Playing11Header({ title, sub }) {
  return (
    <div className="absolute top-14 right-16 left-16 z-[3] flex items-start gap-7">
      <div className="min-w-0 flex-1">
        <h2 className={FS_PAGE_TITLE_MD} style={fsFont(fsSummaryPanel.pageTitleMd)}>
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

function XiPlayerRow({ name, captain, wicketKeeper, accent, last = false, index }) {
  const barAccent = normalizeAccentColor(accent);

  return (
    <div
      className={cn(ROW_ANIMATE_IN, 'flex min-h-0 flex-1 items-center', !last && 'border-b border-white/8')}
      style={{ animationDelay: `${getXiRowDelay(index)}ms` }}
    >
      <span
        className="mr-4 h-6 w-1 shrink-0 rounded-[3px]"
        style={{
          background: barAccent,
          boxShadow: accentGlowShadow(barAccent, 100, '8px'),
        }}
      />
      <span className={playerNameClass} style={fsFont(fsSquad.playerListName)}>
        {name}
      </span>
      {captain ? <XiRoleBadge label="C" fontSize={fsSquad.captainBadge} /> : null}
      {wicketKeeper ? <XiRoleBadge label="WK" fontSize={fsSquad.roleBadgeSm} /> : null}
    </div>
  );
}

function XIPanel({ team }) {
  const { name, accent, logoUrl, team: teamObj, players } = team;
  const panelAccent = normalizeAccentColor(accent);

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden rounded-[20px]"
      style={{
        background: 'linear-gradient(180deg, rgba(30,38,62,0.9), rgba(11,15,24,0.85))',
        border: '1px solid rgba(120,140,255,0.28)',
      }}
    >
      <div
        className="flex items-center gap-[18px] px-7 py-5"
        style={{
          background: `linear-gradient(100deg, ${accentMix(panelAccent, 80)}, ${accentMix(panelAccent, 27)})`,
        }}
      >
        <span className={cn('flex-1', panelTeamNameClass)} style={fsFont(fsSquad.panelTeamName)}>
          {name}
        </span>
        {logoUrl ? (
          <div className="relative shrink-0" style={{ width: PANEL_LOGO_SIZE, height: PANEL_LOGO_SIZE }}>
            <img src={logoUrl} alt={name} draggable={false} className="block size-full object-contain" />
          </div>
        ) : (
          <Crest team={teamObj} size={PANEL_LOGO_SIZE} accent={panelAccent} />
        )}
      </div>

      <div className="flex flex-1 flex-col px-7 py-1.5">
        {players.map((player, index) => (
          <XiPlayerRow
            key={`${player.name}-${index}`}
            name={player.name}
            captain={player.captain}
            wicketKeeper={player.wicketKeeper}
            accent={panelAccent}
            last={index === players.length - 1}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function RequiredRunRateBand({ value }) {
  if (!value) return null;

  return (
    <div
      className="absolute right-[70px] bottom-10 left-[70px] grid h-[68px] place-items-center rounded-xl"
      style={{
        background: `linear-gradient(100deg, ${PLAYING11_GOLD}, ${colors.goldDark})`,
        boxShadow: colorHaloShadow(PLAYING11_GOLD),
      }}
    >
      <span className={rrrBandTextClass} style={fsFont(fsSquad.goldBand)}>
        REQUIRED RUN RATE : {value}
      </span>
    </div>
  );
}

export function Playing11Graphic({ data, teams }) {
  const [teamA, teamB] = data.teams ?? [];
  if (!teamA || !teamB) return null;

  const resolvePanel = (entry) => ({
    ...entry,
    team: teams?.[entry.teamCode] ?? null,
  });

  return (
    <FSStage>
      <Playing11Header title={data.title ?? 'PLAYING XI'} sub={data.sub} />

      <div className="absolute top-[248px] right-[70px] bottom-[140px] left-[70px] flex gap-11">
        <XIPanel team={resolvePanel(teamA)} />
        <XIPanel team={resolvePanel(teamB)} />
      </div>

      <RequiredRunRateBand value={data.requiredRR} />
    </FSStage>
  );
}
