import { describe, expect, it } from 'vitest';

import { canAddTournamentTeams, createTeamToWire, teamCrest, teamsComplete, teamToDomain } from './teamSchemas';

describe('teamSchemas', () => {
  it('maps wire team to domain', () => {
    expect(
      teamToDomain({
        id: 1,
        name: 'City Blues',
        code: 'cbc',
        country: 'Pakistan',
        city: 'Karachi',
        sponsor: 'Pepsi',
        icon_players: 'Babar',
        group_index: 2,
      })
    ).toEqual({
      id: 1,
      name: 'City Blues',
      logo: null,
      code: 'cbc',
      country: 'Pakistan',
      city: 'Karachi',
      sponsor: 'Pepsi',
      iconPlayers: 'Babar',
      groupIndex: 2,
    });
  });

  it('builds create wire body', () => {
    expect(
      createTeamToWire({
        name: ' Stallions ',
        code: 'sls',
        country: 'Pakistan',
        city: 'Sialkot',
        sponsor: '  Jazz  ',
      })
    ).toEqual({
      name: 'Stallions',
      code: 'SLS',
      country: 'Pakistan',
      city: 'Sialkot',
      sponsor: 'Jazz',
      icon_players: null,
    });
  });

  it('caps and crest helpers', () => {
    expect(canAddTournamentTeams(8, 7)).toBe(true);
    expect(canAddTournamentTeams(8, 8)).toBe(false);
    expect(canAddTournamentTeams(null, 99)).toBe(true);
    expect(teamsComplete(8, 8)).toBe(true);
    expect(teamCrest({ code: null, name: 'City Blues' })).toBe('CIT');
  });
});
