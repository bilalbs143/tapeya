import { describe, expect, it } from 'vitest';

import { isRankingHubTab, RANKING_HUB_EMPTY, RANKING_HUB_TOP_LIMIT, topRankingSlice } from './rankingPage';

describe('isRankingHubTab', () => {
  it('accepts hub tabs only', () => {
    expect(isRankingHubTab('batters')).toBe(true);
    expect(isRankingHubTab('others')).toBe(true);
    expect(isRankingHubTab('sixes')).toBe(false);
  });
});

describe('topRankingSlice', () => {
  it('takes the first N rows and tolerates undefined', () => {
    expect(topRankingSlice([1, 2, 3, 4, 5, 6], 5)).toEqual([1, 2, 3, 4, 5]);
    expect(topRankingSlice(undefined)).toEqual([]);
    expect(topRankingSlice([1, 2], RANKING_HUB_TOP_LIMIT)).toEqual([1, 2]);
  });
});

describe('RANKING_HUB_EMPTY', () => {
  it('covers all hub sections', () => {
    expect(RANKING_HUB_EMPTY.batting).toContain('batting');
    expect(RANKING_HUB_EMPTY.bowling).toContain('bowling');
    expect(RANKING_HUB_EMPTY.sixes).toContain('sixes');
    expect(RANKING_HUB_EMPTY.fours).toContain('fours');
  });
});
