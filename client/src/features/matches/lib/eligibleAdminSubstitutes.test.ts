import { describe, expect, it } from 'vitest';

import { eligibleAdminSubstitutes } from './eligibleAdminSubstitutes';

const xi = [
  { id: 1, name: 'Striker' },
  { id: 2, name: 'Non-striker' },
  { id: 3, name: 'Bench' },
  { id: 4, name: 'Out' },
  { id: 5, name: 'Hurt' },
];

describe('eligibleAdminSubstitutes', () => {
  it('excludes crease batters and dismissed players; allows retired_hurt', () => {
    const eligible = eligibleAdminSubstitutes(xi, 1, 2, [
      { player_id: 4, dismissal_type: 'bowled' },
      { player_id: 5, dismissal_type: 'retired_hurt' },
    ]);
    expect(eligible.map((p) => p.id)).toEqual([3, 5]);
  });

  it('treats missing stats as eligible when not on crease', () => {
    expect(eligibleAdminSubstitutes(xi, 1, null, undefined).map((p) => p.id)).toEqual([2, 3, 4, 5]);
  });
});
