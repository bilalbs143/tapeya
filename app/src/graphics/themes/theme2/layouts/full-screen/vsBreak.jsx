/**
 * Full-screen break bumper — theme3 chrome (square tiles, circular VS/timer, status pill)
 * with theme1 type scale + FitText name under each team.
 */
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { colors, fsBreak } from '../../config';
import { DISPLAY_FONT, FitText, FSStage, TeamLogoOrCrest } from '../../primitives';
import { fsFont } from '../shared/fsTypographyStyles';
import { resolveVSTeams } from './vsBreak.helpers';

/** Theme3 break tile / badge geometry (design canvas px). */
export const BREAK_TILE_SIZE = 220;
export const BREAK_CARD_WIDTH = 280;
export const BREAK_VS_SIZE = 88;
export const BREAK_TIMER_SIZE = 148;
export const BREAK_DEFAULT_TIMER_SECONDS = fsBreak.defaultTimerSeconds;

/** Theme1 FitText bounds for the name under the tile. */
export const BREAK_TEAM_NAME_MAX_PX = 46;
export const BREAK_TEAM_NAME_MIN_PX = 22;

const TEAM_NAME_CLASS = cn('text-center font-extrabold tracking-[0.03em] text-white uppercase', DISPLAY_FONT);

/** Theme1 header width / tracking; sizes from fsBreak (theme1 scale). */
const BREAK_HEADER_CLASS = cn(
  'w-full max-w-[min(1720px,97vw)] px-10 text-center whitespace-nowrap',
  DISPLAY_FONT,
  'font-extrabold tracking-[0.08em] text-white uppercase',
);

/** Tournament line above break hero. */
export function BreakTournamentTitle({ children }) {
  if (!children) return null;

  return (
    <div className={BREAK_HEADER_CLASS} style={fsFont(fsBreak.titleLg)}>
      {children}
    </div>
  );
}

/** Venue line under tournament title. */
export function BreakVenueLine({ children }) {
  if (!children) return null;

  return (
    <div className={BREAK_HEADER_CLASS} style={fsFont(fsBreak.titleSm)}>
      {children}
    </div>
  );
}

function BreakHeaderStack({ tournamentName, venueLine }) {
  if (!tournamentName && !venueLine) return null;

  return (
    <div className="flex w-[min(1720px,97vw)] max-w-full flex-col items-center gap-4">
      <BreakTournamentTitle>{tournamentName}</BreakTournamentTitle>
      <BreakVenueLine>{venueLine}</BreakVenueLine>
    </div>
  );
}

/**
 * Theme3 square wine tile + theme1 FitText name underneath.
 *
 * @param {{
 *   side: { team?: object, name?: string, logoUrl?: string },
 *   showName?: boolean,
 *   borderPulseOrder?: 1|2,
 * }} props
 */
export function TeamSide({ side, showName = false, borderPulseOrder }) {
  const label = side.name || side.team?.displayName || side.team?.name || side.team?.code || '';
  const logoUrl = side.logoUrl ?? side.team?.logoUrl ?? side.team?.logo ?? null;
  const code = side.team?.code ?? side.team?.shortCode ?? side.team?.shortName ?? '?';

  return (
    <div className="flex min-w-0 flex-col items-center gap-5" style={{ width: BREAK_CARD_WIDTH }}>
      <TeamLogoOrCrest
        logoUrl={logoUrl}
        team={side.team}
        name={label}
        shortName={code}
        accent={side.accent ?? side.team?.color}
        size={BREAK_TILE_SIZE}
        borderPulseOrder={borderPulseOrder}
      />

      {showName && label ? (
        <FitText
          maxWidth={BREAK_CARD_WIDTH}
          maxFontSize={BREAK_TEAM_NAME_MAX_PX}
          minFontSize={BREAK_TEAM_NAME_MIN_PX}
          className={TEAM_NAME_CLASS}
        >
          {label}
        </FitText>
      ) : null}
    </div>
  );
}

/** @param {number} totalSeconds */
function formatBreakTimer(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Theme3 circular center badge — solid VS, or live countdown for strategic timeout.
 *
 * @param {{ showTimer?: boolean, timerSeconds?: number }} props
 */
export function BreakCenterBadge({ showTimer = false, timerSeconds = BREAK_DEFAULT_TIMER_SECONDS }) {
  const initial = Math.max(0, Number(timerSeconds) || 0);
  const [remaining, setRemaining] = useState(initial);

  useEffect(() => {
    setRemaining(Math.max(0, Number(timerSeconds) || 0));
  }, [timerSeconds]);

  useEffect(() => {
    if (!showTimer) return undefined;

    const id = window.setInterval(() => {
      setRemaining((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [showTimer, timerSeconds]);

  const size = showTimer ? BREAK_TIMER_SIZE : BREAK_VS_SIZE;

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: colors.panelBowler,
      }}
      aria-hidden={showTimer ? undefined : true}
      aria-live={showTimer ? 'polite' : undefined}
    >
      {showTimer ? (
        <span
          className={cn(
            'font-bold tracking-[0.02em] text-white tabular-nums',
            DISPLAY_FONT,
            '[font-variant-numeric:tabular-nums]',
          )}
          style={fsFont(fsBreak.timeoutHero)}
        >
          {formatBreakTimer(remaining)}
        </span>
      ) : (
        <span className={cn('font-bold tracking-[0.02em] text-white uppercase', DISPLAY_FONT)} style={fsFont(fsBreak.vsLabel)}>
          VS
        </span>
      )}
    </div>
  );
}

/** Theme3 solid red status pill. */
export function BreakStatusPill({ children }) {
  if (!children) return null;

  return (
    <div
      className="flex min-w-[280px] shrink-0 items-center justify-center rounded-full px-10 py-[18px]"
      style={{ background: colors.panelBowler }}
    >
      <span
        className={cn('text-center font-extrabold tracking-[0.06em] text-white uppercase', DISPLAY_FONT)}
        style={fsFont(fsBreak.status)}
      >
        {children}
      </span>
    </div>
  );
}

/**
 * Shared full-screen break layout: tournament → venue → hero → status.
 *
 * @param {{ tournamentName?: string|null, venueLine?: string|null, caption?: string|null, children: import('react').ReactNode }} props
 */
export function BreakFSLayout({ tournamentName, venueLine, caption, children }) {
  return (
    <FSStage>
      <div className="absolute top-0 right-0 bottom-0 left-0 flex flex-col items-center justify-center gap-[70px] px-12 text-center">
        <BreakHeaderStack tournamentName={tournamentName} venueLine={venueLine} />
        {children}
        <BreakStatusPill>{caption}</BreakStatusPill>
      </div>
    </FSStage>
  );
}

/**
 * Standard break-interval bumper (innings / lunch / rain / tea / this / next / timeout).
 *
 * @param {{
 *   data: {
 *     caption?: string|null,
 *     tournamentName?: string|null,
 *     venueLine?: string|null,
 *     showTimer?: boolean,
 *     timerSeconds?: number,
 *     teams?: Array<{ teamCode: string, name?: string, accent?: string, logoUrl?: string }>,
 *   },
 *   teams: Record<string, object>,
 *   showTeamNames?: boolean,
 * }} props
 */
export function VSBreakGraphic({ data, teams, showTeamNames = true }) {
  const resolved = resolveVSTeams(data, teams);
  if (!resolved) return null;

  const showTimer = Boolean(data.showTimer);
  const timerSeconds = data.timerSeconds ?? BREAK_DEFAULT_TIMER_SECONDS;

  return (
    <BreakFSLayout tournamentName={data.tournamentName} venueLine={data.venueLine} caption={data.caption}>
      <div className="flex items-center justify-center gap-[90px]">
        <TeamSide side={resolved.left} showName={showTeamNames} borderPulseOrder={1} />
        <BreakCenterBadge showTimer={showTimer} timerSeconds={timerSeconds} />
        <TeamSide side={resolved.right} showName={showTeamNames} borderPulseOrder={2} />
      </div>
    </BreakFSLayout>
  );
}
