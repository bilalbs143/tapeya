import { describe, expect, it } from 'vitest';

import { buildInitialRoster } from './declareSquadRoster';

describe('buildInitialRoster', () => {
  it('orders by match squad ids and marks XI as playing', () => {
    const rows = buildInitialRoster({
      pool: [
        { id: 1, name: 'Ali', role: 'bat', hand: 'RHB' },
        { id: 2, name: 'Bilal', role: 'bowl', hand: 'RHB' },
        { id: 3, name: 'Chris', role: null, hand: null },
      ],
      matchIds: [2, 1],
      xi: [
        { id: 1, name: 'Ali' },
        { id: 2, name: 'Bilal' },
      ],
      captainId: 1,
      keeperId: 2,
    });

    expect(rows.map((r) => r.id)).toEqual([2, 1]);
    expect(rows[0]).toMatchObject({ id: 2, playing: true, captain: false, keeper: true });
    expect(rows[1]).toMatchObject({ id: 1, playing: true, captain: true, keeper: false });
  });

  it('falls back to XI order when match squad is empty', () => {
    const rows = buildInitialRoster({
      pool: [{ id: 9, name: 'Only', role: null, hand: null }],
      matchIds: [],
      xi: [{ id: 9, name: 'Only' }],
      captainId: null,
      keeperId: null,
    });
    expect(rows).toEqual([
      { id: 9, name: 'Only', role: null, hand: null, captain: false, keeper: false, playing: true },
    ]);
  });
});
