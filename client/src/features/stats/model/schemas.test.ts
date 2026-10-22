import { describe, expect, it } from 'vitest';

import {
  buildBattingCareer,
  buildBowlingCareer,
  buildFieldingCareer,
  buildSummaryStats,
  hasBattingActivity,
  type PlayerStatsWire,
  toPlayerStats,
} from './schemas';

const wire: PlayerStatsWire = {
  player_id: 11,
  tournament_type: 'all',
  cricket_format: 'all',
  batting: {
    matches: 10,
    innings: 9,
    runs: 300,
    fours: 20,
    sixes: 8,
    dots: 40,
    highest_score: '88',
    hundreds: 0,
    fifties: 2,
    average: 37.5,
    strike_rate: 120.5,
  },
  bowling: {
    matches: 10,
    innings: 4,
    overs: 12,
    wickets: 5,
    best_bowling_innings: '2/14',
    best_bowling_match: '2/14',
    five_wickets: 0,
    ten_wickets: 0,
    average: 18,
    economy: 7.5,
    strike_rate: 14.4,
  },
  fielding: {
    matches: 10,
    catches: 3,
    run_outs: 1,
    stumpings: 0,
  },
};

describe('toPlayerStats', () => {
  it('maps wire batting/bowling/fielding to camelCase', () => {
    const stats = toPlayerStats(wire);
    expect(stats.playerId).toBe(11);
    expect(stats.batting.strikeRate).toBe(120.5);
    expect(stats.bowling.bestBowlingInnings).toBe('2/14');
    expect(stats.fielding.runOuts).toBe(1);
  });
});

describe('career builders', () => {
  it('builds summary and batting rows when there is activity', () => {
    const stats = toPlayerStats(wire);
    expect(hasBattingActivity(stats.batting)).toBe(true);
    expect(buildSummaryStats(stats.batting)).toEqual([
      { label: 'Runs', value: 300 },
      { label: 'Centuries', value: 0 },
      { label: 'Sixes', value: 8 },
    ]);
    expect(buildBattingCareer(stats.batting).map((c) => c.label)).toContain('AVG');
    expect(buildBowlingCareer(stats.bowling).map((c) => c.label)).toContain('WKTS');
    expect(buildFieldingCareer(stats.fielding)).toHaveLength(4);
  });

  it('returns empty career rows with no activity', () => {
    expect(buildSummaryStats({ ...toPlayerStats(wire).batting, innings: 0, runs: 0 })).toEqual([]);
    expect(buildBowlingCareer({ ...toPlayerStats(wire).bowling, innings: 0, wickets: 0, overs: 0 })).toEqual([]);
    expect(buildFieldingCareer({ ...toPlayerStats(wire).fielding, catches: 0, runOuts: 0, stumpings: 0 })).toEqual([]);
  });
});
