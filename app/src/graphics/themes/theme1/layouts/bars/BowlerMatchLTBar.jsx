/**
 * Bowler match lower-third — live in-match figures.
 * Layout: [name · w-r · overs] / [overs · dots · extras · wickets · econ]
 */
import { formatBroadcastBowlingFigures } from '@tapeya/graphics-core/domain/player';

import { fmt } from '../../primitives';
import { PlayerStatLTBar } from './PlayerStatLTBar';
import {
  batterScoreBallsStyle,
  ltPlayerStatBar,
  playerStatLtHeroClass,
  playerStatLtNameClass,
  playerStatLtSecondaryClass,
} from './playerStatLtStyles';

const STAT_FIELDS = [
  { key: 'overs', label: 'OVERS' },
  { key: 'dots', label: 'DOTS' },
  { key: 'extras', label: 'EXTRAS' },
  { key: 'wickets', label: 'WICKETS' },
  { key: 'econ', label: 'ECON' },
];

const scoreClusterClass = 'ml-2 flex shrink-0 items-baseline gap-[5px]';

function resolveBowler(bowler) {
  if (!bowler?.name) return null;
  return { bowler };
}

function formatFigures(bowler) {
  if (bowler.figText) {
    const [rawFigures] = bowler.figText.trim().split(/\s+/);
    return formatBroadcastBowlingFigures(rawFigures, { w: bowler.w, r: bowler.r });
  }

  return formatBroadcastBowlingFigures(null, { w: bowler.w, r: bowler.r });
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
export function BowlerMatchLTBar({ bowler, teams: _teams, edgeToEdge = true }) {
  const resolved = resolveBowler(bowler);
  if (!resolved) return null;

  const { bowler: player } = resolved;
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
      edgeToEdge={edgeToEdge}
      statFields={STAT_FIELDS}
      statValues={statValues}
      header={
        <>
          <span className={playerStatLtNameClass} style={{ fontSize: ltPlayerStatBar.nameSize }}>
            {player.name}
          </span>
          <span className={scoreClusterClass}>
            <span className={playerStatLtHeroClass} style={{ fontSize: ltPlayerStatBar.heroSize }}>
              {formatFigures(player)}
            </span>
            <span
              className={playerStatLtSecondaryClass}
              style={batterScoreBallsStyle(ltPlayerStatBar.secondarySize, ltPlayerStatBar.secondaryWeight)}
            >
              {oversDisplay}
            </span>
          </span>
        </>
      }
    />
  );
}
