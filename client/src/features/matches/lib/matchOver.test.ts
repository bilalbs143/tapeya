import { describe, expect, it } from 'vitest';

import { buildMotmCandidates, matchOverShareTitle } from './matchOver';

describe('buildMotmCandidates', () => {
  it('dedupes players who appear on both sides and fills team detail', () => {
    const list = buildMotmCandidates(
      [
        { id: 1, name: 'Ali' },
        { id: 2, name: 'Bilal' },
      ],
      [
        { id: 2, name: 'Bilal' },
        { id: 3, name: 'Chand' },
      ],
      'HOME',
      'AWAY'
    );
    expect(list.map((p) => p.id)).toEqual([1, 2, 3]);
    expect(list[0]?.detail).toBe('HOME');
    expect(list[2]?.detail).toBe('AWAY');
  });
});

describe('matchOverShareTitle', () => {
  it('prefers the result summary', () => {
    expect(matchOverShareTitle('Home won by 6 wickets', 'H', 'A')).toBe('Home won by 6 wickets');
    expect(matchOverShareTitle(null, 'H', 'A')).toBe('H vs A');
  });
});
