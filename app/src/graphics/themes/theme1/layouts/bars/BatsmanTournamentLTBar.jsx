/**
 * Batsman tournament lower-third — tournament-scoped career batting stats.
 * Layout: [name · runs · matches] / [4s · 6s · 50s · 100s · sr]
 */
import { AnimatedNumber } from '../../primitives';
import { PlayerStatLTBar } from './PlayerStatLTBar';
import { ltPlayerStatBar, playerStatLtHeroClass, playerStatLtNameClass, playerStatLtSecondaryClass } from './playerStatLtStyles';

const STAT_FIELDS = [
  { key: 'fours', label: '4S' },
  { key: 'sixes', label: '6S' },
  { key: 'fifties', label: '50S' },
  { key: 'hundreds', label: '100S' },
  { key: 'sr', label: 'S/R' },
];

const scoreClusterClass = 'ml-2 flex shrink-0 items-baseline gap-[5px]';

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
          <span className={playerStatLtNameClass} style={{ fontSize: ltPlayerStatBar.nameSize }}>
            {player.name}
          </span>
          <span className={scoreClusterClass}>
            <AnimatedNumber
              value={player.runs ?? 0}
              className={playerStatLtHeroClass}
              style={{ fontSize: ltPlayerStatBar.heroSize }}
            />
            <AnimatedNumber
              value={player.matches ?? 0}
              className={playerStatLtSecondaryClass}
              style={{ fontSize: ltPlayerStatBar.secondarySize }}
            />
          </span>
        </>
      }
    />
  );
}
