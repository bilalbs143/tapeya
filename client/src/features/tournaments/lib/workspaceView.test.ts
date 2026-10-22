import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceStages,
  findNeediestGroup,
  groupName,
  iconPlayerCount,
  squadCountsByTeam,
  squadsReadyCount,
  squadState,
  stageTone,
} from './workspaceView';

describe('workspaceView', () => {
  it('names groups from 1-based index', () => {
    expect(groupName(1)).toBe('Group A');
    expect(groupName(2)).toBe('Group B');
  });

  it('counts icon players from a free-text list', () => {
    expect(iconPlayerCount(null)).toBe(0);
    expect(iconPlayerCount('Babar, Rizwan')).toBe(2);
  });

  it('aggregates occupancy into per-team squad sizes', () => {
    const map = squadCountsByTeam([
      { playerId: 1, playerName: 'A', teamId: 10, teamName: 'X' },
      { playerId: 2, playerName: 'B', teamId: 10, teamName: 'X' },
      { playerId: 3, playerName: 'C', teamId: 11, teamName: 'Y' },
    ]);
    expect(map.get(10)).toBe(2);
    expect(map.get(11)).toBe(1);
  });

  it('labels squad progress for XI threshold', () => {
    expect(squadState(0).label).toBe('No squad');
    expect(squadState(7).label).toBe('Needs 4');
    expect(squadState(11).tone).toBe('ready');
  });

  it('tones stage cards like mockup 7d', () => {
    expect(stageTone('teams', { teamsCount: 0, atCap: false, ready: 0, fixtures: 0 })).toBe('active');
    expect(stageTone('fixtures', { teamsCount: 8, atCap: true, ready: 5, fixtures: 0 })).toBe('active');
    expect(stageTone('fixtures', { teamsCount: 4, atCap: false, ready: 0, fixtures: 0 })).toBe('locked');
  });

  it('counts squads ready at XI', () => {
    const teams = [
      {
        id: 1,
        name: 'A',
        logo: null,
        code: null,
        country: null,
        city: null,
        sponsor: null,
        iconPlayers: null,
        groupIndex: 1,
      },
      {
        id: 2,
        name: 'B',
        logo: null,
        code: null,
        country: null,
        city: null,
        sponsor: null,
        iconPlayers: null,
        groupIndex: 1,
      },
    ];
    const counts = new Map([
      [1, 11],
      [2, 4],
    ]);
    expect(squadsReadyCount(teams, counts)).toBe(1);
  });

  it('builds stage card values', () => {
    const stages = buildWorkspaceStages({
      teamsCount: 4,
      teamCap: 8,
      atCap: false,
      ready: 1,
      fixtures: 0,
    });
    expect(stages.map((s) => s.value)).toEqual(['4 / 8', '1 / 4', '0']);
    expect(
      buildWorkspaceStages({ teamsCount: 0, teamCap: 8, atCap: false, ready: 0, fixtures: 0 }).map((s) => s.value)
    ).toEqual(['0 / 8', '—', '—']);
  });

  it('picks the group with the most open slots', () => {
    const teams = [
      {
        id: 1,
        name: 'A',
        logo: null,
        code: null,
        country: null,
        city: null,
        sponsor: null,
        iconPlayers: null,
        groupIndex: 1,
      },
      {
        id: 2,
        name: 'B',
        logo: null,
        code: null,
        country: null,
        city: null,
        sponsor: null,
        iconPlayers: null,
        groupIndex: 1,
      },
    ];
    expect(findNeediestGroup(teams, 2, 4, true, 8)?.g).toBe(2);
    expect(findNeediestGroup(teams, 2, 4, false, 8)).toBeNull();
  });
});
