/**
 * VS break bumper primitives — shared team marks and break-interval full-screen layout.
 */
import { cn } from '@/lib/utils';

import { fsBreak } from '../../config';
import { DISPLAY_FONT, FitText, FSStage, Pill, TeamLogoOrCrest, VSBadge } from '../../primitives';
import { fsFont } from '../shared/fsTypographyStyles';
import { resolveVSTeams } from './vsBreak.helpers';

export const BREAK_LOGO_SIZE = 300;
export const BREAK_VS_SIZE = 150;
export const BREAK_TEAM_NAME_MAX_PX = 46;
export const BREAK_TEAM_NAME_MIN_PX = 22;

const TEAM_NAME_CLASS = cn('font-extrabold tracking-[0.03em] text-white uppercase', DISPLAY_FONT);

/** Full broadcast width for tournament + venue header (single line). */
const BREAK_HEADER_CLASS = cn(
  'w-full max-w-[min(1720px,97vw)] px-10 text-center whitespace-nowrap',
  DISPLAY_FONT,
  'font-extrabold tracking-[0.08em] text-white uppercase',
);

/** Tournament line above break hero — matches break caption pill text styling. */
export function BreakTournamentTitle({ children }) {
  if (!children) return null;

  return (
    <div className={BREAK_HEADER_CLASS} style={fsFont(fsBreak.titleLg)}>
      {children}
    </div>
  );
}

/** Venue line under tournament title — same display style, smaller size. */
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

export function HeroTeamMark({ side, borderPulseOrder, size = BREAK_LOGO_SIZE }) {
  return (
    <TeamLogoOrCrest
      logoUrl={side.logoUrl}
      team={side.team}
      accent={side.accent}
      size={size}
      borderPulseOrder={borderPulseOrder}
    />
  );
}

export function TeamSide({ side, borderPulseOrder, showName = false }) {
  return (
    <div className={cn('flex flex-col items-center gap-6', showName && 'text-center')}>
      <HeroTeamMark side={side} borderPulseOrder={borderPulseOrder} />
      {showName && side.name ? (
        <FitText
          maxWidth={BREAK_LOGO_SIZE}
          maxFontSize={BREAK_TEAM_NAME_MAX_PX}
          minFontSize={BREAK_TEAM_NAME_MIN_PX}
          className={TEAM_NAME_CLASS}
        >
          {side.name}
        </FitText>
      ) : null}
    </div>
  );
}

/**
 * Shared full-screen break layout: tournament name above, hero slot, break label below.
 *
 * @param {{ tournamentName?: string|null, venueLine?: string|null, caption?: string|null, children: import('react').ReactNode }} props
 */
export function BreakFSLayout({ tournamentName, venueLine, caption, children }) {
  return (
    <FSStage>
      <div className="absolute top-0 right-0 bottom-0 left-0 flex flex-col items-center justify-center gap-[70px] text-center">
        <BreakHeaderStack tournamentName={tournamentName} venueLine={venueLine} />
        {children}
        {caption ? (
          <Pill variant="caption" wrap>
            {caption}
          </Pill>
        ) : null}
      </div>
    </FSStage>
  );
}

/**
 * Standard break-interval VS bumper (innings / lunch / rain / tea).
 *
 * @param {{ data: object, teams: Record<string, object>, showTeamNames?: boolean }} props
 */
export function VSBreakGraphic({ data, teams, showTeamNames = true }) {
  const resolved = resolveVSTeams(data, teams);
  if (!resolved) return null;

  return (
    <BreakFSLayout tournamentName={data.tournamentName} venueLine={data.venueLine} caption={data.caption}>
      <div className="flex items-center gap-[90px]">
        <TeamSide side={resolved.left} borderPulseOrder={1} showName={showTeamNames} />
        <VSBadge size={BREAK_VS_SIZE} />
        <TeamSide side={resolved.right} borderPulseOrder={2} showName={showTeamNames} />
      </div>
    </BreakFSLayout>
  );
}
