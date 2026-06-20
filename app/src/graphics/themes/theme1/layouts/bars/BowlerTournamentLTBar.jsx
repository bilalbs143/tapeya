/**
 * Bowler tournament lower-third — tournament-scoped career bowling stats.
 * Layout: [name · w-r · overs] / [matches · overs · wickets · runs · avg · econ]
 */
import { cn } from '@/lib/utils';

import { DISPLAY_FONT, MONO_FONT, UI_FONT } from '../../primitives';
import { PlayerStatLTBar } from './PlayerStatLTBar';

const STAT_FIELDS = [
  { key: 'matches', label: 'MATCHES' },
  { key: 'overs', label: 'OVERS' },
  { key: 'wickets', label: 'WICKETS' },
  { key: 'runs', label: 'RUNS' },
  { key: 'avg', label: 'AVG' },
  { key: 'econ', label: 'ECON' },
];

const STAT_ROW_CLASS = 'gap-x-10 px-4';

const nameClass = cn(
  'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap',
  'text-[25px] font-bold leading-none text-white uppercase',
  UI_FONT,
);

const scoreClusterClass = 'ml-2 flex shrink-0 items-baseline gap-[5px]';

const figuresClass = cn(
  'text-[34px] font-extrabold leading-none text-white',
  DISPLAY_FONT,
  '[text-shadow:0_0_calc(18px*var(--glow))_var(--score-shadow)]',
);

const oversClass = cn('text-[17px] font-medium text-[var(--faint)]', MONO_FONT);

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
export function BowlerTournamentLTBar({ bowler, teams, edgeToEdge = true }) {
  const resolved = resolveBowler(bowler, teams);
  if (!resolved) return null;

  const { bowler: player, accent } = resolved;
  const oversDisplay = formatOvers(player);
  const statValues = {
    matches: player.matches ?? 0,
    overs: oversDisplay,
    wickets: player.w ?? player.wickets ?? 0,
    runs: player.r ?? player.runs ?? 0,
    avg: player.avg ?? '—',
    econ: player.econ ?? player.economy ?? '—',
  };

  return (
    <PlayerStatLTBar
      accent={accent}
      edgeToEdge={edgeToEdge}
      statFields={STAT_FIELDS}
      statValues={statValues}
      statRowClass={STAT_ROW_CLASS}
      header={
        <>
          <span className={nameClass}>{player.name}</span>
          <span className={scoreClusterClass}>
            <span className={figuresClass}>{formatFigures(player)}</span>
            <span className={oversClass}>{oversDisplay}</span>
          </span>
        </>
      }
    />
  );
}
