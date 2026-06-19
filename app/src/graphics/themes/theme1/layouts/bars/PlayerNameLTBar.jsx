/**
 * Player name lower-third bar — shared by batsman and bowler NAME_LT controllers.
 */
import { cn } from '@/lib/utils';

import { geometry, ltBar } from '../../config';
import { DISPLAY_FONT, GlowPanel, ScaledBarSurface, TeamLogoOrCrest, UI_FONT } from '../../primitives';

const DESIGN_WIDTH = ltBar.designWidth;
const BAR_RADIUS = geometry.barRadius;
const LOGO_SIZE = ltBar.crestSize;

const barClass = cn(
  'flex items-center justify-between gap-6 py-4 px-[22px]',
  'bg-[linear-gradient(100deg,color-mix(in_srgb,var(--panel-ring-a,var(--accentA))_33%,transparent),transparent_60%)]',
);

const contentClass = 'flex min-w-0 flex-1 flex-col gap-1';

const firstNameClass = cn('text-[20px] font-semibold leading-none tracking-[0.08em] text-white uppercase', UI_FONT);

const lastNameClass = cn(
  'text-[42px] font-extrabold leading-none text-white uppercase',
  DISPLAY_FONT,
  '[text-shadow:0_0_calc(14px*var(--glow))_var(--score-shadow)]',
);

const roleClass = cn('text-[18px] font-semibold leading-none tracking-[0.1em] text-[var(--muted)] uppercase', UI_FONT);

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
  if (player.firstName) {
    return {
      firstName: player.firstName,
      lastName: player.lastName ?? '',
      role: player.role ?? '',
    };
  }

  const parts = (player.name ?? '').trim().split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
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
        <GlowPanel ambientPulse hideRing radius={radius} accent={accent} className="w-full overflow-hidden">
          <div className={barClass}>
            <div className={contentClass}>
              <span className={firstNameClass}>{firstName}</span>
              {lastName && <span className={lastNameClass}>{lastName}</span>}
              {role && <span className={roleClass}>{role}</span>}
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
