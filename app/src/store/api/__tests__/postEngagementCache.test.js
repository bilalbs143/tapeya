import { describe, expect, it, vi } from 'vitest';

import { FEED_LIST_ARG, mapPostEngagementToReel, optimisticLikePatches, REELS_LIST_ARG } from '../postEngagementCache';

describe('postEngagementCache', () => {
  it('keeps list args aligned at perPage 10', () => {
    expect(FEED_LIST_ARG).toEqual({ perPage: 10 });
    expect(REELS_LIST_ARG).toEqual({ perPage: 10 });
  });

  it('maps post-shaped engagement fields onto reel caches', () => {
    expect(
      mapPostEngagementToReel({
        liked: true,
        likesCount: 4,
        saved: true,
        sharesCount: 2,
        commentsCount: 9,
        saves: 1,
      }),
    ).toEqual({
      liked: true,
      likes: 4,
      saved: true,
      shares: 2,
      comments: 9,
      saves: 1,
    });
  });

  it('does not throw when feed endpoints are not injected yet', () => {
    const dispatch = vi.fn(() => {
      throw new Error('should not dispatch updateQueryData for missing endpoints');
    });

    expect(() => optimisticLikePatches(dispatch, 42, true)).not.toThrow();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
