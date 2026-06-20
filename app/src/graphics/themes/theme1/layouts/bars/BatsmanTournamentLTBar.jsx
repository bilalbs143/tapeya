/**
 * Batsman tournament lower-third — tournament-scoped career batting stats.
 * Layout: [name · runs · matches] / [4s · 6s · 50s · 100s · sr]
 */
import { cn } from '@/lib/utils';

import { AnimatedNumber, DISPLAY_FONT, MONO_FONT, UI_FONT } from '../../primitives';
import { PlayerStatLTBar } from './PlayerStatLTBar';

const STAT_FIELDS = [
  { key: 'fours', label: '4S' },
  { key: 'sixes', label: '6S' },
  { key: 'fifties', label: '50S' },
  { key: 'hundreds', label: '100S' },
  { key: 'sr', label: 'S/R' },
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

const matchesClass = cn('text-[17px] font-medium text-[var(--faint)]', MONO_FONT);

function resolveBatter(batter, teams) {
  if (!batter?.name) return null;

  const team = batter.teamCode ? teams[batter.teamCode] : null;
  return {
    batter,
    accent: team?.color ?? 'var(--accentA)',
  };
}

/**
 * @param {{ batter: object, teams: Record<string, object>, edgeToEdge?: boolean }} props
 */
export function BatsmanTournamentLTBar({ batter, teams, edgeToEdge = true }) {
  const resolved = resolveBatter(batter, teams);
  if (!resolved) return null;

  const { batter: player, accent } = resolved;
  const statValues = {
    fours: player.fours ?? 0,
    sixes: player.sixes ?? 0,
    fifties: player.fifties ?? 0,
    hundreds: player.hundreds ?? 0,
    sr: player.sr ?? '—',
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
            <AnimatedNumber value={player.runs ?? 0} className={runsClass} />
            <AnimatedNumber value={player.matches ?? 0} className={matchesClass} />
          </span>
        </>
      }
    />
  );
}
