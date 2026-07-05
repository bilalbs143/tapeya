/**
 * Player name lower-third bar — shared by batsman and bowler NAME_LT controllers.
 */
import { resolveBroadcastNameParts } from '@tapeya/graphics-core/domain/playerNameResolver';

import { cn } from '@/lib/utils';

import { geometry, infoBarPanelClass, infoBarPanelStyle, ltBar, ltNameBar } from '../../config';
import {
  accentPanelHeadGradient,
  DISPLAY_FONT,
  InsetLTBarPanel,
  InsetLTBarSurface,
  InsetLTTeamMark,
  UI_FONT,
} from '../../primitives';
import { textGlowClass } from '../../visualEffects';
import { TEXT_PRIMARY, TEXT_SECONDARY } from '../shared/textStyles';

const BAR_RADIUS = geometry.barRadius;
const LOGO_SIZE = ltBar.crestSize;

const nameClass = cn(
  'shrink-0 whitespace-nowrap font-extrabold leading-none uppercase',
  TEXT_PRIMARY,
  DISPLAY_FONT,
  textGlowClass('scoreLt'),
);

const nameClampClass = cn(nameClass, 'min-w-0 overflow-hidden text-ellipsis');

const roleClass = cn('shrink-0 whitespace-nowrap font-semibold leading-none tracking-[0.1em] uppercase', TEXT_SECONDARY, UI_FONT);

const roleClampClass = cn(roleClass, 'min-w-0 overflow-hidden text-ellipsis');

const nameStyle = { fontSize: ltNameBar.lastNameSize };
const roleStyle = { fontSize: ltNameBar.roleSize };

function resolvePlayer(player, teams) {
  if (!player?.name && !player?.firstName) return null;

  const team = player.teamCode ? teams[player.teamCode] : null;
  return {
    player,
    team,
    teamAccent: team?.color ?? 'var(--accentA)',
  };
}

function resolvePlayerContent(player) {
  const { displayName } = resolveBroadcastNameParts(player);
  return {
    displayName,
    role: player.role ?? '',
  };
}

function TeamMark({ team, accent, logoUrl, measuring }) {
  if (!team && !logoUrl) return null;

  return (
    <InsetLTTeamMark measuring={measuring} logoUrl={logoUrl} team={team} accent={accent} size={LOGO_SIZE} borderPulseOrder={1} />
  );
}

/**
 * @param {{ player: object, teams: Record<string, object>, edgeToEdge?: boolean }} props
 */
export function PlayerNameLTBar({ player, teams, edgeToEdge = true }) {
  const resolved = resolvePlayer(player, teams);

  if (!resolved) return null;

  const { player: resolvedPlayer, team, teamAccent } = resolved;
  const { displayName, role } = resolvePlayerContent(resolvedPlayer);
  const logoUrl = resolvedPlayer.logoUrl ?? team?.logoUrl;

  return (
    <InsetLTBarSurface edgeToEdge={edgeToEdge} barRadius={BAR_RADIUS}>
      {({ radius, atMaxWidth, measuring }) => (
        <InsetLTBarPanel
          measuring={measuring}
          hideRing
          radius={radius}
          className={infoBarPanelClass(measuring)}
          style={infoBarPanelStyle(measuring)}
        >
          <div
            className="flex h-full w-full items-center justify-between gap-6 px-[22px]"
            style={{ background: accentPanelHeadGradient() }}
          >
            <div className="flex min-h-0 flex-col justify-center gap-1">
              <span className={atMaxWidth ? nameClampClass : nameClass} style={nameStyle}>
                {displayName}
              </span>
              {role ? (
                <span className={atMaxWidth ? roleClampClass : roleClass} style={roleStyle}>
                  {role}
                </span>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center">
              <TeamMark team={team} accent={teamAccent} logoUrl={logoUrl} measuring={measuring} />
            </div>
          </div>
        </InsetLTBarPanel>
      )}
    </InsetLTBarSurface>
  );
}
