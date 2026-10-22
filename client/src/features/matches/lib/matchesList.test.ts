import { describe, expect, it } from 'vitest';

import { filterSectionedMatches, matchesListScorerFirstName, matchesListSubtitle } from './matchesList';

describe('matchesListScorerFirstName', () => {
  it('prefers nickname, then name, then You', () => {
    expect(matchesListScorerFirstName('Ali Khan', 'Other')).toBe('Ali');
    expect(matchesListScorerFirstName(null, 'Sara Ahmed')).toBe('Sara');
    expect(matchesListScorerFirstName(null, null)).toBe('You');
  });
});

describe('matchesListSubtitle', () => {
  it('prefixes scoring as', () => {
    expect(matchesListSubtitle('Ali')).toBe('Scoring as Ali');
  });
});

describe('filterSectionedMatches', () => {
  it('keeps only rows with a section', () => {
    expect(filterSectionedMatches([{ section: 'live' }, { section: null }, { section: 'done' }])).toEqual([
      { section: 'live' },
      { section: 'done' },
    ]);
    expect(filterSectionedMatches(undefined)).toEqual([]);
  });
});
