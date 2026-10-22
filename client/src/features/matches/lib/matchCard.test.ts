import { describe, expect, it } from 'vitest';

import { matchCardNameById, matchCardShareTitle, matchCardShowsLiveDock, matchCardXiSides } from './matchCard';

describe('matchCard', () => {
  it('maps XI players to name-by-id', () => {
    expect(
      matchCardNameById({
        homeXi: [{ id: 1, name: 'Ali' }],
        awayXi: [{ id: 2, name: 'Omar' }],
      } as never)
    ).toEqual({ '1': 'Ali', '2': 'Omar' });
    expect(matchCardNameById(null)).toEqual({});
  });

  it('builds home/away XI sides', () => {
    const sides = matchCardXiSides(
      {
        home: { id: 10, name: 'Aces', short: 'ACE' },
        away: { id: 11, name: 'Blues', short: 'BLU' },
      } as never,
      {
        homeXi: [{ id: 1, name: 'Ali', role: 'bat' }],
        awayXi: [{ id: 2, name: 'Omar' }],
      } as never
    );
    expect(sides[0]?.short).toBe('ACE');
    expect(sides[0]?.players[0]).toEqual({ id: 1, name: 'Ali', role: 'bat' });
    expect(sides[1]?.players[0]).toEqual({ id: 2, name: 'Omar' });
  });

  it('builds share title and live-dock gate', () => {
    expect(matchCardShareTitle({ home: { short: 'ACE' }, away: { short: 'BLU' } } as never)).toBe(
      'ACE vs BLU — Tapeya'
    );
    expect(matchCardShowsLiveDock(9, false, 'live')).toBe(true);
    expect(matchCardShowsLiveDock(9, true, 'live')).toBe(false);
    expect(matchCardShowsLiveDock(9, false, 'ended')).toBe(false);
  });
});
