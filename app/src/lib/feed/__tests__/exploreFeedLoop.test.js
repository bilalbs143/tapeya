import { describe, expect, it } from 'vitest';

import {
  EXPLORE_LOOP_MAX_CYCLES,
  EXPLORE_LOOP_MAX_POST_ROWS,
  maxExploreCyclesForPostCount,
  pickNewPosts,
  postsForExploreCycle,
  pruneFreshPosts,
} from '@/lib/feed/exploreFeedLoop';

describe('pickNewPosts', () => {
  it('returns only ids not already known', () => {
    expect(pickNewPosts([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }, { id: 4 }])).toEqual([{ id: 3 }, { id: 4 }]);
  });

  it('handles empty incoming', () => {
    expect(pickNewPosts([{ id: 1 }], [])).toEqual([]);
    expect(pickNewPosts([{ id: 1 }], null)).toEqual([]);
  });
});

describe('pruneFreshPosts', () => {
  it('removes ids already in the base catalog and keeps the same reference when unchanged', () => {
    const fresh = [{ id: 9 }, { id: 2 }];
    const base = [{ id: 1 }, { id: 2 }];
    expect(pruneFreshPosts(fresh, base)).toEqual([{ id: 9 }]);

    const stable = [{ id: 9 }];
    expect(pruneFreshPosts(stable, base)).toBe(stable);
  });
});

describe('postsForExploreCycle', () => {
  const base = [{ id: 1 }, { id: 2 }];
  const fresh = [{ id: 9 }, { id: 1 }];

  it('keeps the base list before freshFromCycle', () => {
    expect(postsForExploreCycle(base, fresh, 2, 0)).toEqual(base);
    expect(postsForExploreCycle(base, fresh, 2, 1)).toEqual(base);
  });

  it('prepends unique fresh posts from freshFromCycle onward', () => {
    expect(postsForExploreCycle(base, fresh, 2, 2)).toEqual([{ id: 9 }, { id: 1 }, { id: 2 }]);
  });

  it('ignores fresh when unset', () => {
    expect(postsForExploreCycle(base, fresh, null, 4)).toEqual(base);
    expect(postsForExploreCycle(base, [], 0, 0)).toEqual(base);
  });
});

describe('Explore loop caps', () => {
  it('allows only one cycle for an empty catalog', () => {
    expect(maxExploreCyclesForPostCount(0)).toBe(1);
  });

  it('caps cycles by max post rows and hard ceiling', () => {
    expect(maxExploreCyclesForPostCount(1)).toBe(Math.min(EXPLORE_LOOP_MAX_CYCLES, EXPLORE_LOOP_MAX_POST_ROWS));
    expect(maxExploreCyclesForPostCount(50)).toBe(Math.min(EXPLORE_LOOP_MAX_CYCLES, Math.floor(EXPLORE_LOOP_MAX_POST_ROWS / 50)));
    expect(maxExploreCyclesForPostCount(EXPLORE_LOOP_MAX_POST_ROWS)).toBe(1);
  });
});
