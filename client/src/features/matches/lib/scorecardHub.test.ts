import { describe, expect, it } from 'vitest';

import { filterScorecardHubMatches, scorecardHubShowsTournamentChips } from './scorecardHub';

describe('filterScorecardHubMatches', () => {
  const matches = [
    { id: 1, tournamentId: 10 },
    { id: 2, tournamentId: 20 },
    { id: 3, tournamentId: 10 },
  ];

  it('returns all or filters by tournament', () => {
    expect(filterScorecardHubMatches(matches, 'all')).toHaveLength(3);
    expect(filterScorecardHubMatches(matches, 10).map((m) => m.id)).toEqual([1, 3]);
    expect(filterScorecardHubMatches(undefined, 'all')).toEqual([]);
  });
});

describe('scorecardHubShowsTournamentChips', () => {
  it('shows chips only when there is more than one tournament', () => {
    expect(scorecardHubShowsTournamentChips(0)).toBe(false);
    expect(scorecardHubShowsTournamentChips(1)).toBe(false);
    expect(scorecardHubShowsTournamentChips(2)).toBe(true);
  });
});
