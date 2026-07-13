import { describe, expect, it } from 'vitest';

import { isHeroNavbarPath } from '../routeUtils';

describe('isHeroNavbarPath', () => {
  it('stays solid for match-linked / not-live watch-live, regardless of isLiveHero', () => {
    expect(isHeroNavbarPath('/live/broadcast/31', false, false)).toBe(false);
  });

  it('goes transparent only when isLiveHero is true', () => {
    expect(isHeroNavbarPath('/live/broadcast/31', false, true)).toBe(true);
  });

  it('trusts the caller for desktop instead of re-gating it independently', () => {
    // The caller (LiveBroadcast.jsx) only ever computes heroMode true when !isDesktop, so this
    // input combination shouldn't occur in practice — this just documents that the function
    // itself doesn't second-guess isLiveHero based on isDesktop for the live-broadcast branch.
    expect(isHeroNavbarPath('/live/broadcast/31', true, true)).toBe(true);
  });

  it('go-live camera never goes transparent', () => {
    expect(isHeroNavbarPath('/live/go-live/31', false, true)).toBe(false);
  });

  it('unrelated hero pages are unaffected by the new param', () => {
    expect(isHeroNavbarPath('/home', false)).toBe(true);
    expect(isHeroNavbarPath('/profile', false)).toBe(true);
    expect(isHeroNavbarPath('/upcoming-tournaments/6', false)).toBe(true);
    expect(isHeroNavbarPath('/highlights/6', false)).toBe(true);
    expect(isHeroNavbarPath('/highlights/6', true)).toBe(false);
  });

  it('non-hero pages stay solid', () => {
    expect(isHeroNavbarPath('/shop', false)).toBe(false);
    expect(isHeroNavbarPath('/scorecard', false)).toBe(false);
  });
});
