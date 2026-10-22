import { describe, expect, it } from 'vitest';

import {
  formatTournamentDateRange,
  isUpcomingTournament,
  toDomain,
  tournamentCrest,
  tournamentHubSection,
  type TournamentWire,
} from './schemas';

describe('tournamentHubSection', () => {
  it('maps active/setup to needsYou and inactive to previous', () => {
    expect(tournamentHubSection('active')).toBe('needsYou');
    expect(tournamentHubSection('setup')).toBe('needsYou');
    expect(tournamentHubSection(null)).toBe('needsYou');
    expect(tournamentHubSection('inactive')).toBe('previous');
  });

  it('treats past end_date as previous even when active', () => {
    expect(tournamentHubSection('active', '2020-01-01')).toBe('previous');
  });
});

describe('toDomain', () => {
  it('maps wire snake_case into camelCase domain fields', () => {
    const wire: TournamentWire = {
      id: 3,
      tournament_name: 'City Cup',
      short_name: 'CC',
      tournament_type: 'private_tournament',
      city: 'Lahore',
      start_date: null,
      end_date: null,
      cover_image: null,
      teams_count: 8,
      matches_count: 0,
      can_manage: true,
      status: 'active',
      status_label: 'Active',
      venue_name: 'Oval',
      prize: 'PKR 50,000',
      number_of_teams: 12,
      number_of_groups: 2,
      country: 'Pakistan',
    };

    expect(toDomain(wire)).toEqual({
      id: 3,
      name: 'City Cup',
      shortName: 'CC',
      type: 'private_tournament',
      city: 'Lahore',
      startDate: null,
      endDate: null,
      coverImage: null,
      teamsCount: 8,
      matchesCount: 0,
      teamCap: 12,
      groupCount: 2,
      country: 'Pakistan',
      canManage: true,
      likesCount: 0,
      dislikesCount: 0,
      sharesCount: 0,
      myReaction: null,
      interestCampaignSlug: null,
      status: 'active',
      statusLabel: 'Active',
      venueName: 'Oval',
      prize: 'PKR 50,000',
      champion: null,
      hubSection: 'needsYou',
    });
    expect(tournamentCrest(toDomain(wire))).toBe('CC');
  });
});

describe('isUpcomingTournament', () => {
  it('keeps tournaments with null or future end dates', () => {
    expect(isUpcomingTournament({ endDate: null })).toBe(true);
    expect(isUpcomingTournament({ endDate: '2099-12-31' })).toBe(true);
  });

  it('drops tournaments whose end date has passed', () => {
    expect(isUpcomingTournament({ endDate: '2020-01-01' })).toBe(false);
  });
});

describe('formatTournamentDateRange', () => {
  it('formats a start–end range and TBA when both missing', () => {
    expect(formatTournamentDateRange(null, null)).toBe('Dates TBA');
    expect(formatTournamentDateRange('2026-11-01', '2026-12-15')).toMatch(/2026/);
  });
});
