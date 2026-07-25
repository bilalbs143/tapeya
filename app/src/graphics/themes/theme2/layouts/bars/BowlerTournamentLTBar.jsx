/**
 * Bowler tournament lower-third — tournament-scoped career bowling stats.
 * Layout: [name · tournament] / [matches · overs · wickets · runs · avg · econ]
 */
import { PlayerStatLTBar } from './PlayerStatLTBar';
import { ltPlayerStatBar, playerStatLtNameClass, playerStatLtTournamentClass } from './playerStatLtStyles';

const STAT_FIELDS = [
  { key: 'matches', label: 'MATCHES' },
  { key: 'overs', label: 'OVERS' },
  { key: 'wickets', label: 'WICKETS' },
  { key: 'runs', label: 'RUNS' },
  { key: 'avg', label: 'AVG' },
  { key: 'econ', label: 'ECON' },
];

const STAT_ROW_OVERRIDE_STYLE = { gap: `${ltPlayerStatBar.statRowGapDense * 4}px` };

function resolveBowler(bowler) {
  if (!bowler?.name) return null;
  return { bowler };
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
export function BowlerTournamentLTBar({ bowler, teams: _teams, edgeToEdge = true }) {
  const resolved = resolveBowler(bowler);
  if (!resolved) return null;

  const { bowler: player } = resolved;
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
