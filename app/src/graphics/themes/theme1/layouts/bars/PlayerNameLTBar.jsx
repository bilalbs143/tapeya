/**
 * Player name lower-third bar — shared by batsman and bowler NAME_LT controllers.
 */
import { cn } from '@/lib/utils';

import { resolveBroadcastNameParts } from '../../../../core/domain/playerNameResolver';
import { geometry, ltBar, ltNameBar } from '../../config';
import { DISPLAY_FONT, GlowPanel, ScaledBarSurface, TeamLogoOrCrest, UI_FONT } from '../../primitives';
import { textGlowClass } from '../../visualEffects';
import { TEXT_PRIMARY, TEXT_SECONDARY } from '../shared/textStyles';

const DESIGN_WIDTH = ltBar.designWidth;
const BAR_RADIUS = geometry.barRadius;
const LOGO_SIZE = ltBar.crestSize;

const barClass = cn(
  'flex items-center justify-between gap-6 py-4 px-[22px]',
  'bg-[linear-gradient(100deg,color-mix(in_srgb,var(--panel-ring-a,var(--accentA))_33%,transparent),transparent_60%)]',
);

const contentClass = 'flex min-w-0 flex-1 flex-col gap-1';

const firstNameClass = cn('font-semibold leading-none tracking-[0.08em] uppercase', TEXT_SECONDARY, UI_FONT);

const lastNameClass = cn('font-extrabold leading-none uppercase', TEXT_PRIMARY, DISPLAY_FONT, textGlowClass('scoreLt'));

const roleClass = cn('font-semibold leading-none tracking-[0.1em] uppercase', TEXT_SECONDARY, UI_FONT);

const firstNameStyle = { fontSize: ltNameBar.firstNameSize };
const lastNameStyle = { fontSize: ltNameBar.lastNameSize };
const roleStyle = { fontSize: ltNameBar.roleSize };

const logoSideClass = 'flex shrink-0 items-center';

function resolvePlayer(player, teams) {
  if (!player?.name && !player?.firstName) return null;

  const team = player.teamCode ? teams[player.teamCode] : null;
  return {
    player,
    team,
    accent: team?.color ?? 'var(--accentA)',
  };
}

function resolvePlayerContent(player) {
  const { firstName, lastName } = resolveBroadcastNameParts(player);
  return {
    firstName,
    lastName,
    role: player.role ?? '',
  };
}

function TeamMark({ team, accent, logoUrl }) {
  if (!team && !logoUrl) return null;

  return <TeamLogoOrCrest logoUrl={logoUrl} team={team} accent={accent} size={LOGO_SIZE} borderPulseOrder={1} />;
}

/**
 * @param {{ player: object, teams: Record<string, object>, edgeToEdge?: boolean }} props
 */
export function PlayerNameLTBar({ player, teams, edgeToEdge = true }) {
  const resolved = resolvePlayer(player, teams);

  if (!resolved) return null;

  const { player: resolvedPlayer, team, accent } = resolved;
  const { firstName, lastName, role } = resolvePlayerContent(resolvedPlayer);
  const logoUrl = resolvedPlayer.logoUrl ?? team?.logoUrl;

  return (
    <ScaledBarSurface designWidth={DESIGN_WIDTH} edgeToEdge={edgeToEdge} barRadius={BAR_RADIUS}>
      {({ radius }) => (
        <GlowPanel hideRing radius={radius} accent={accent} className="w-full overflow-hidden">
          <div className={barClass}>
            <div className={contentClass}>
              <span className={firstNameClass} style={firstNameStyle}>
                {firstName}
              </span>
              {lastName && (
                <span className={lastNameClass} style={lastNameStyle}>
                  {lastName}
                </span>
              )}
              {role && (
                <span className={roleClass} style={roleStyle}>
                  {role}
                </span>
              )}
            </div>

            <div className={logoSideClass}>
              <TeamMark team={team} accent={accent} logoUrl={logoUrl} />
            </div>
          </div>
        </GlowPanel>
      )}
    </ScaledBarSurface>
  );
}
