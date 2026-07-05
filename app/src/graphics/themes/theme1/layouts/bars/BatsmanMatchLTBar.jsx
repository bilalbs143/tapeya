/**
 * Batsman match lower-third — live in-match stats.
 * Layout: [name · runs* balls] / [six · four · 1's · 2's · 3's · balls · s/r]
 */
import { cn } from '@/lib/utils';

import { DISPLAY_FONT, fmt, InsetLTAnimatedNumber } from '../../primitives';
import { PlayerStatLTBar } from './PlayerStatLTBar';
import {
  BATTER_SCORE_CLUSTER_CLASS,
  batterScoreBallsClass,
  batterScoreBallsStyle,
  ltPlayerStatBar,
  playerStatLtHeroClass,
  playerStatLtNameClass,
} from './playerStatLtStyles';

const STAT_FIELDS = [
  { key: 'sixes', label: 'SIX' },
  { key: 'fours', label: 'FOUR' },
  { key: 'ones', label: "1'S" },
  { key: 'twos', label: "2'S" },
  { key: 'threes', label: "3'S" },
  { key: 'balls', label: 'BALLS' },
  { key: 'sr', label: 'S/R' },
];

const scoreClusterClass = cn(BATTER_SCORE_CLUSTER_CLASS, 'ml-2');
const runsWrapClass = 'flex items-start';
const asteriskClass = cn('text-[22px] font-extrabold leading-none text-[#f5c85a]', DISPLAY_FONT);

function resolveBatter(batter) {
  if (!batter?.name) return null;
  return { batter };
}

/**
 * @param {{ batter: object, teams: Record<string, object>, edgeToEdge?: boolean }} props
 */
export function BatsmanMatchLTBar({ batter, teams: _teams, edgeToEdge = true }) {
  const resolved = resolveBatter(batter);

  if (!resolved) return null;

  const { batter: player } = resolved;
  const statValues = {
    ones: player.ones ?? 0,
    twos: player.twos ?? 0,
    threes: player.threes ?? 0,
    fours: player.fours ?? 0,
    sixes: player.sixes ?? 0,
    balls: player.balls ?? 0,
    sr: player.sr ?? fmt.strikeRate(player.runs ?? 0, player.balls ?? 0),
  };

  return (
    <PlayerStatLTBar
      edgeToEdge={edgeToEdge}
      statFields={STAT_FIELDS}
      statValues={statValues}
      header={({ measuring }) => (
        <>
          <span className={playerStatLtNameClass} style={{ fontSize: ltPlayerStatBar.nameSize }}>
            {player.name}
          </span>
          <span className={scoreClusterClass} style={{ gap: ltPlayerStatBar.scoreGap }}>
            <span className={runsWrapClass}>
              <InsetLTAnimatedNumber
                measuring={measuring}
                value={player.runs ?? 0}
                className={playerStatLtHeroClass}
                style={{ fontSize: ltPlayerStatBar.heroSize }}
              />
              {player.notOut ? <span className={asteriskClass}>*</span> : null}
            </span>
            <InsetLTAnimatedNumber
              measuring={measuring}
              value={player.balls ?? 0}
              className={batterScoreBallsClass}
              style={batterScoreBallsStyle(ltPlayerStatBar.secondarySize, ltPlayerStatBar.secondaryWeight)}
            />
          </span>
        </>
      )}
    />
  );
}
