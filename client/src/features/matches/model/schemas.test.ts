import { describe, expect, it } from 'vitest';

import { matchSection, type QuickMatchWire, teamShort, toDomain, toUiStatus } from './schemas';

const baseWire = (overrides: Partial<QuickMatchWire> = {}): QuickMatchWire => ({
  id: 1,
  status: 'scheduled',
  status_label: 'Scheduled',
  cricket_format: 'limited_overs',
  cricket_format_label: 'Limited overs',
  overs: 10,
  venue_name: 'Gaddafi Stadium',
  match_date: '2026-09-20',
  match_time: '16:00',
  created_at: '2026-09-16T10:00:00+00:00',
  tournament: null,
  home_team: { id: 10, name: 'City Blues', logo: null },
  away_team: { id: 11, name: 'Karachi Kings', logo: null },
  toss_winner_team_id: null,
  can_operate: true,
  is_owner: true,
  ...overrides,
});

describe('teamShort', () => {
  it('uses initials for multi-word names', () => {
    expect(teamShort('City Blues')).toBe('CB');
  });

  it('truncates single-word names', () => {
    expect(teamShort('Blues')).toBe('BLU');
  });
});

describe('matchSection / toUiStatus', () => {
  it('maps in_progress to live scoring', () => {
    expect(matchSection('in_progress', null)).toBe('live');
    expect(toUiStatus('in_progress', null)).toBe('live');
  });

  it('maps scheduled without toss to toss owed', () => {
    expect(matchSection('scheduled', null)).toBe('toss');
    expect(toUiStatus('scheduled', null)).toBe('no_toss');
  });

  it('maps toss_done and scheduled-with-toss to scheduled', () => {
    expect(matchSection('toss_done', 10)).toBe('scheduled');
    expect(matchSection('scheduled', 10)).toBe('scheduled');
    expect(toUiStatus('toss_done', 10)).toBe('scheduled');
  });

  it('maps completed to done and hides cancelled', () => {
    expect(matchSection('completed', null)).toBe('done');
    expect(matchSection('cancelled', null)).toBeNull();
    expect(toUiStatus('cancelled', null)).toBe('cancelled');
  });
});

describe('toDomain', () => {
  it('maps wire snake_case into camelCase domain fields', () => {
    const match = toDomain(baseWire({ status: 'in_progress', status_label: 'In progress' }));

    expect(match).toMatchObject({
      id: 1,
      status: 'in_progress',
      uiStatus: 'live',
      section: 'live',
      formatLabel: 'Limited overs',
      overs: 10,
      venueName: 'Gaddafi Stadium',
      home: { id: 10, name: 'City Blues', short: 'CB', logoUrl: null },
      away: { id: 11, name: 'Karachi Kings', short: 'KK', logoUrl: null },
      canOperate: true,
      isOwner: true,
    });
  });
});
