import { describe, expect, it } from 'vitest';

import { resolveRankingStatsParam } from './rankingStats';

describe('resolveRankingStatsParam', () => {
  it('accepts known types and falls back for unknown', () => {
    expect(resolveRankingStatsParam('wicket-takers')).toEqual({
      valid: true,
      statType: 'wicket-takers',
    });
    expect(resolveRankingStatsParam('nope')).toEqual({
      valid: false,
      statType: 'run-scorers',
    });
  });
});
