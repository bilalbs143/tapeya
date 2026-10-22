import { describe, expect, it } from 'vitest';

import {
  buildStatsTotalRows,
  type RankingsPayloadWire,
  toBatterCard,
  toBowlerCard,
  toRankingsPayload,
} from './schemas';

const wire: RankingsPayloadWire = {
  tournament_type: 'open_tournament',
  cricket_format: 'all',
  category: 'batting',
  sort: 'runs',
  rankings: [
    {
      rank: 1,
      player_id: 11,
      player: { id: 11, name: 'Sara Ali' },
      stats: { runs: 420, innings: 9, average: 46.67, sixes: 14, fours: 38 },
    },
  ],
};

describe('toRankingsPayload', () => {
  it('maps wire rankings to camelCase rows', () => {
    const payload = toRankingsPayload(wire);
    expect(payload.rankings[0]).toMatchObject({
      playerId: 11,
      playerName: 'Sara Ali',
      runs: 420,
      sixes: 14,
    });
  });
});

describe('cards + stats table', () => {
  it('builds batter/bowler cards and table rows', () => {
    const row = toRankingsPayload(wire).rankings[0];
    expect(row).toBeDefined();
    if (!row) return;
    expect(toBatterCard(row).primary).toBe(420);
    expect(toBowlerCard({ ...row, wickets: 5, economy: 6.5 }).primary).toBe(5);
    expect(buildStatsTotalRows('run-scorers', [row])[0]).toMatchObject({
      playerName: 'Sara Ali',
      runs: 420,
    });
    expect(buildStatsTotalRows('sixes', [row])[0]).toMatchObject({ six: 14 });
  });
});
