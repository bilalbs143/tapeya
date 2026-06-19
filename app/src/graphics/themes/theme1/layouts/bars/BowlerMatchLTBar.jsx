/**
 * Bowler match lower-third — live in-match figures.
 * Layout: [name · w-r · overs] / [overs · dots · extras · wickets · econ]
 */
import { cn } from '@/lib/utils';

import { DISPLAY_FONT, fmt, MONO_FONT, UI_FONT } from '../../primitives';
import { PlayerStatLTBar } from './PlayerStatLTBar';

const STAT_FIELDS = [
  { key: 'overs', label: 'OVERS' },
  { key: 'dots', label: 'DOTS' },
  { key: 'extras', label: 'EXTRAS' },
  { key: 'wickets', label: 'WICKETS' },
  { key: 'econ', label: 'ECON' },
];

const nameClass = cn(
  'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap',
  'text-[25px] font-bold leading-none text-white uppercase',
  UI_FONT,
);

const scoreClusterClass = 'ml-2 flex shrink-0 items-baseline gap-[5px]';

const runsClass = cn(
  'text-[34px] font-extrabold leading-none text-white',
  DISPLAY_FONT,
  '[text-shadow:0_0_calc(18px*var(--glow))_var(--score-shadow)]',
);

const ballsClass = cn('text-[17px] font-medium text-[var(--faint)]', MONO_FONT);

function resolveBowler(bowler, teams) {
  if (!bowler?.name) return null;

  const team = bowler.teamCode ? teams[bowler.teamCode] : null;
  return {
    bowler,
    accent: team?.color ?? 'var(--accentA)',
  };
}

function formatFigures(bowler) {
  if (bowler.figText) {
    const [figures] = bowler.figText.trim().split(/\s+/);
    return figures ?? bowler.figText;
  }

  return `${bowler.w ?? 0}-${bowler.r ?? 0}`;
}

function formatOvers(bowler) {
  if (bowler.figText) {
    const parts = bowler.figText.trim().split(/\s+/);
    if (parts[1]) return parts[1];
  }

  return String(bowler.o ?? bowler.overs ?? '0.0');
}

/**
 * @param {{ bowler: object, teams: Record<string, object>, edgeToEdge?: boolean }} props
 */
export function BowlerMatchLTBar({ bowler, teams, edgeToEdge = true }) {
  const resolved = resolveBowler(bowler, teams);
  if (!resolved) return null;

  const { bowler: player, accent } = resolved;
  const oversDisplay = formatOvers(player);
  const oversNum = parseFloat(oversDisplay) || 0;
  const statValues = {
    overs: oversDisplay,
    dots: player.dots ?? 0,
    extras: player.extras ?? 0,
    wickets: player.w ?? player.wickets ?? 0,
    econ: player.econ ?? player.eco ?? fmt.econ(player.r ?? 0, oversNum),
  };

  return (
    <PlayerStatLTBar
      accent={accent}
      edgeToEdge={edgeToEdge}
      statFields={STAT_FIELDS}
      statValues={statValues}
      header={
        <>
          <span className={nameClass}>{player.name}</span>
          <span className={scoreClusterClass}>
            <span className={runsClass}>{formatFigures(player)}</span>
            <span className={ballsClass}>{oversDisplay}</span>
          </span>
        </>
      }
    />
  );
}
