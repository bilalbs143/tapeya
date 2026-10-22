import { describe, expect, it } from 'vitest';

import { FEED_COMPOSER_TABS, FEED_TABS, feedCommentHref } from './feedPage';

describe('FEED_TABS', () => {
  it('lists four home tabs', () => {
    expect(FEED_TABS.map((t) => t.value)).toEqual(['explore', 'following', 'mine', 'saved']);
  });
});

describe('FEED_COMPOSER_TABS', () => {
  it('hides composer on saved', () => {
    expect(FEED_COMPOSER_TABS.has('saved')).toBe(false);
    expect(FEED_COMPOSER_TABS.has('explore')).toBe(true);
  });
});

describe('feedCommentHref', () => {
  it('routes video posts to the reel deep link', () => {
    expect(feedCommentHref({ id: 9, kind: 'video' })).toContain('/reel');
  });

  it('anchors non-video posts to #comments', () => {
    expect(feedCommentHref({ id: 9, kind: 'photos' })).toMatch(/#comments$/);
  });
});
