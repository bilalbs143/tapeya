import { describe, expect, it } from 'vitest';

import {
  publicTournamentCountsLine,
  publicTournamentPlaceLine,
  publicTournamentTabFromSearch,
} from './publicTournament';

describe('publicTournamentTabFromSearch', () => {
  it('defaults to live', () => {
    expect(publicTournamentTabFromSearch(new URLSearchParams())).toBe('live');
  });

  it('maps fixtures alias to schedule', () => {
    expect(publicTournamentTabFromSearch(new URLSearchParams('tab=fixtures'))).toBe('schedule');
  });

  it('accepts known tabs', () => {
    expect(publicTournamentTabFromSearch(new URLSearchParams('tab=stats'))).toBe('stats');
  });

  it('falls back on unknown tabs', () => {
    expect(publicTournamentTabFromSearch(new URLSearchParams('tab=nope'))).toBe('live');
  });
});

describe('publicTournamentPlaceLine', () => {
  it('joins dates and city', () => {
    const line = publicTournamentPlaceLine({
      startDate: '2026-01-01',
      endDate: '2026-01-10',
      city: 'Lahore',
    });
    expect(line).toContain('Lahore');
  });
});

describe('publicTournamentCountsLine', () => {
  it('omits zero counts', () => {
    expect(publicTournamentCountsLine({ teamsCount: 0, matchesCount: 0 })).toBe('');
  });

  it('formats teams and fixtures', () => {
    expect(publicTournamentCountsLine({ teamsCount: 8, matchesCount: 12 })).toBe('8 teams · 12 fixtures');
  });
});
