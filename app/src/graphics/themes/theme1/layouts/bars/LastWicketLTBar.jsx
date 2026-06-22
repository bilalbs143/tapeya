/**
 * Last wicket lower-third — dismissed batter match scorecard.
 * Layout mirrors BatsmanMatchLTBar; data matches LastWicketFSGraphic.
 */
import { cn } from '@/lib/utils';

import { AnimatedNumber, fmt, UI_FONT } from '../../primitives';
import { PlayerStatLTBar } from './PlayerStatLTBar';
import { BATTER_SCORE_CLUSTER_CLASS, batterScoreBallsClass, ltPlayerStatBar, playerStatLtHeroClass } from './playerStatLtStyles';

const scoreClusterClass = cn(BATTER_SCORE_CLUSTER_CLASS, 'ml-2');

const STAT_FIELDS = [
  { key: 'sixes', label: 'SIX' },
  { key: 'fours', label: 'FOUR' },
  { key: 'ones', label: "1'S" },
  { key: 'twos', label: "2'S" },
  { key: 'threes', label: "3'S" },
  { key: 'balls', label: 'BALLS' },
  { key: 'sr', label: 'S/R' },
];

const nameClass = cn(
  'shrink-0 overflow-hidden text-ellipsis whitespace-nowrap',
  'font-bold leading-none text-white uppercase',
  UI_FONT,
);

const dismissalClass = cn(
  'min-w-0 truncate',
  'text-[15px] font-semibold leading-none tracking-[0.06em] text-[var(--text-secondary)] uppercase',
  UI_FONT,
);

function resolveBatter(batter, teams) {
  if (!batter?.name && !batter?.firstName) return null;

  const team = batter.teamCode ? teams[batter.teamCode] : null;
  return {
    batter: {
      ...batter,
      name: batter.name ?? [batter.firstName, batter.lastName].filter(Boolean).join(' '),
    },
    accent: team?.color ?? 'var(--accentA)',
  };
}

/**
 * @param {{ batter: object, teams: Record<string, object>, edgeToEdge?: boolean }} props
 */
export function LastWicketLTBar({ batter, teams, edgeToEdge = true }) {
  const resolved = resolveBatter(batter, teams);
  if (!resolved) return null;

  const { batter: player, accent } = resolved;
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
      accent={accent}
      edgeToEdge={edgeToEdge}
      statFields={STAT_FIELDS}
      statValues={statValues}
      header={
        <>
          <div className="flex min-w-0 flex-1 items-baseline gap-2 overflow-hidden">
            <span className={nameClass} style={{ fontSize: ltPlayerStatBar.nameSize }}>
              {player.name}
            </span>
            {player.dismissal ? <span className={dismissalClass}>{player.dismissal}</span> : null}
          </div>
          <span className={scoreClusterClass} style={{ gap: ltPlayerStatBar.scoreGap }}>
            <AnimatedNumber
              value={player.runs ?? 0}
              className={playerStatLtHeroClass}
              style={{ fontSize: ltPlayerStatBar.heroSize }}
            />
            <AnimatedNumber
              value={player.balls ?? 0}
              className={batterScoreBallsClass}
              style={{ fontSize: ltPlayerStatBar.secondarySize }}
            />
          </span>
        </>
      }
    />
  );
}
