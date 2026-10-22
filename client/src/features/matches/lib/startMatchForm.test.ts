import { describe, expect, it } from 'vitest';

import { filterStartMatchTournaments, startMatchGroupIndex } from './startMatchForm';

describe('startMatchForm', () => {
  it('maps knockout / group keys to API group index', () => {
    expect(startMatchGroupIndex('knockout')).toBeNull();
    expect(startMatchGroupIndex('1')).toBe(1);
    expect(startMatchGroupIndex('3')).toBe(3);
  });

  it('keeps only organizer hubs with at least two teams', () => {
    const rows = [
      { id: 1, hubSection: 'needsYou' as const, teamsCount: 2 },
      { id: 2, hubSection: 'needsYou' as const, teamsCount: 1 },
      { id: 3, hubSection: 'previous' as const, teamsCount: 4 },
    ];
    expect(filterStartMatchTournaments(rows).map((t) => t.id)).toEqual([1]);
  });
});
