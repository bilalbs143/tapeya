import { describe, expect, it } from 'vitest';

import {
  sortUpcomingTournaments,
  upcomingTournamentFixturesLine,
  upcomingTournamentPlace,
} from './upcomingTournaments';

describe('sortUpcomingTournaments', () => {
  it('keeps upcoming and sorts by start date', () => {
    const later = { id: 2, startDate: '2099-06-01', endDate: '2099-06-10' };
    const sooner = { id: 1, startDate: '2099-05-01', endDate: '2099-05-10' };
    const past = { id: 3, startDate: '2020-01-01', endDate: '2020-01-02' };
    const sorted = sortUpcomingTournaments([later, past, sooner]);
    expect(sorted.map((t) => t.id)).toEqual([1, 2]);
  });
});

describe('upcomingTournamentPlace', () => {
  it('joins city and country', () => {
    expect(upcomingTournamentPlace('Lahore', 'Pakistan')).toBe('Lahore, Pakistan');
    expect(upcomingTournamentPlace('Lahore', null)).toBe('Lahore');
    expect(upcomingTournamentPlace(null, null)).toBe('');
  });
});

describe('upcomingTournamentFixturesLine', () => {
  it('returns null when there are no fixtures', () => {
    expect(upcomingTournamentFixturesLine(0)).toBeNull();
    expect(upcomingTournamentFixturesLine(3)).toBe('3 fixtures — tap for schedule');
  });
});
