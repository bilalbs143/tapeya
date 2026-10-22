import { describe, expect, it } from 'vitest';

import { formatNrr, selectStandingsForMatch, type TournamentStandings } from './standingsSchemas';

const sample: TournamentStandings = {
  tournamentId: 1,
  standings: [],
  groups: [
    {
      groupIndex: 1,
      groupName: 'Group 1',
      standings: [
        {
          teamId: 10,
          teamName: 'City Blues',
          played: 2,
          won: 2,
          lost: 0,
          tied: 0,
          noResult: 0,
          points: 4,
          nrr: 1.2,
        },
        {
          teamId: 11,
          teamName: 'Karachi Kings',
          played: 2,
          won: 0,
          lost: 2,
          tied: 0,
          noResult: 0,
          points: 0,
          nrr: -1.2,
        },
      ],
    },
    {
      groupIndex: 2,
      groupName: 'Group 2',
      standings: [
        {
          teamId: 12,
          teamName: 'Lahore Lions',
          played: 1,
          won: 1,
          lost: 0,
          tied: 0,
          noResult: 0,
          points: 2,
          nrr: 0.5,
        },
      ],
    },
  ],
};

describe('standingsSchemas', () => {
  it('formats NRR with sign', () => {
    expect(formatNrr(1.24)).toBe('+1.240');
    expect(formatNrr(-0.1)).toBe('-0.100');
    expect(formatNrr(null)).toBe('—');
  });

  it('selects the group containing both sides', () => {
    const hit = selectStandingsForMatch(sample, 10, 11);
    expect(hit.groupName).toBe('Group 1');
    expect(hit.rows).toHaveLength(2);
  });

  it('falls back to a group containing either side', () => {
    const hit = selectStandingsForMatch(sample, 12, 99);
    expect(hit.groupName).toBe('Group 2');
  });
});
