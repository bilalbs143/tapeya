/**
 * Batsman tournament lower-third — tournament-scoped career batting stats.
 * Layout: [name · tournament] / [matches · runs · 4s · 6s · 50s · 100s · s/r · avg]
 */
import { PlayerStatLTBar } from './PlayerStatLTBar';
import { ltPlayerStatBar, playerStatLtNameClass, playerStatLtTournamentClass } from './playerStatLtStyles';

const STAT_FIELDS = [
  { key: 'matches', label: 'MATCHES' },
  { key: 'runs', label: 'RUNS' },
  { key: 'fours', label: '4S' },
  { key: 'sixes', label: '6S' },
  { key: 'fifties', label: '50S' },
  { key: 'hundreds', label: '100S' },
  { key: 'sr', label: 'S/R' },
  { key: 'avg', label: 'AVG' },
];

const STAT_ROW_OVERRIDE_STYLE = { gap: `${ltPlayerStatBar.statRowGapDense * 4}px` };

function resolveBatter(batter) {
  if (!batter?.name) return null;
  return { batter };
}

/**
 * @param {{ batter: object, teams: Record<string, object>, edgeToEdge?: boolean }} props
 */
export function BatsmanTournamentLTBar({ batter, teams: _teams, edgeToEdge = true }) {
  const resolved = resolveBatter(batter);
  if (!resolved) return null;

  const { batter: player } = resolved;
  const statValues = {
    matches: player.matches ?? 0,
    runs: player.runs ?? 0,
    fours: player.fours ?? 0,
    sixes: player.sixes ?? 0,
    fifties: player.fifties ?? 0,
    hundreds: player.hundreds ?? 0,
    sr: player.sr ?? '—',
    avg: player.avg ?? '—',
  };

  return (
    <PlayerStatLTBar
      edgeToEdge={edgeToEdge}
      statFields={STAT_FIELDS}
      statValues={statValues}
      statRowStyle={STAT_ROW_OVERRIDE_STYLE}
      header={
        <>
          <span className={playerStatLtNameClass} style={{ fontSize: ltPlayerStatBar.nameSize }}>
            {player.name}
          </span>
          {player.tournamentLabel ? (
            <span className={playerStatLtTournamentClass} style={{ fontSize: ltPlayerStatBar.secondarySize }}>
              {player.tournamentLabel}
            </span>
          ) : null}
        </>
      }
    />
  );
}
