import { describe, expect, it } from 'vitest';

import type { Tournament } from '../model/schemas';
import { partitionTournamentHub, tournamentsHubSubtitle } from './tournamentsList';

function stub(partial: Pick<Tournament, 'id' | 'hubSection'>): Tournament {
  return partial as Tournament;
}

describe('partitionTournamentHub', () => {
  it('splits needsYou vs previous', () => {
    const items = [stub({ id: 1, hubSection: 'needsYou' }), stub({ id: 2, hubSection: 'previous' })];
    expect(partitionTournamentHub(items).needsYou.map((t) => t.id)).toEqual([1]);
    expect(partitionTournamentHub(items).previous.map((t) => t.id)).toEqual([2]);
  });
});

describe('tournamentsHubSubtitle', () => {
  it('covers empty, loading, and counts', () => {
    expect(tournamentsHubSubtitle({ isEmpty: true, isLoading: false, needsYouCount: 0, previousCount: 0 })).toBe(
      'Host, Seed Teams and Score Match Day'
    );
    expect(
      tournamentsHubSubtitle({ isEmpty: false, isLoading: true, needsYouCount: 1, previousCount: 0 })
    ).toBeUndefined();
    expect(tournamentsHubSubtitle({ isEmpty: false, isLoading: false, needsYouCount: 2, previousCount: 3 })).toBe(
      '2 active · 3 previous'
    );
  });
});
