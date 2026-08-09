import { describe, expect, it } from 'vitest';

import {
  isGlobalEntryDialogBlockedPath,
  isHeroNavbarPath,
  isInterestCampaignDialogBlockedPath,
  isNavbarOverlayPath,
  isProfileStrengthReminderBlockedPath,
  isReelsCreatorProfilePath,
  isReelsFeedPath,
  isReelsImmersivePath,
  isReelsUploadPath,
} from '../routeUtils';

describe('reels route helpers', () => {
  it('distinguishes feed vs upload', () => {
    expect(isReelsFeedPath('/reels')).toBe(true);
    expect(isReelsFeedPath('/reels/12')).toBe(true);
    expect(isReelsFeedPath('/reels/upload')).toBe(false);
    expect(isReelsUploadPath('/reels/upload')).toBe(true);
    expect(isReelsUploadPath('/reels')).toBe(false);
    expect(isReelsImmersivePath('/reels')).toBe(true);
    expect(isReelsImmersivePath('/reels/12')).toBe(true);
    expect(isReelsImmersivePath('/reels/upload')).toBe(false);
  });

  it('treats creator profile as a normal subpage, not the immersive feed', () => {
    expect(isReelsCreatorProfilePath('/reels/u/12')).toBe(true);
    expect(isReelsCreatorProfilePath('/reels/12')).toBe(false);
    expect(isReelsFeedPath('/reels/u/12')).toBe(false);
    expect(isReelsImmersivePath('/reels/u/12')).toBe(false);
    expect(isNavbarOverlayPath('/reels/u/12')).toBe(false);
    expect(isHeroNavbarPath('/reels/u/12', false)).toBe(false);
  });
});

describe('auto dialogs on immersive reels', () => {
  it('blocks profile / interest / global entry dialogs on the reels player', () => {
    expect(isGlobalEntryDialogBlockedPath('/reels')).toBe(true);
    expect(isGlobalEntryDialogBlockedPath('/reels/12')).toBe(true);
    expect(isProfileStrengthReminderBlockedPath('/reels/12')).toBe(true);
    expect(isInterestCampaignDialogBlockedPath('/reels/12')).toBe(true);
    expect(isGlobalEntryDialogBlockedPath('/reels/upload')).toBe(false);
    expect(isGlobalEntryDialogBlockedPath('/home')).toBe(false);
  });
});

describe('isNavbarOverlayPath', () => {
  it('includes reels feed like tournament hero pages', () => {
    expect(isNavbarOverlayPath('/reels')).toBe(true);
    expect(isNavbarOverlayPath('/reels/12')).toBe(true);
    expect(isNavbarOverlayPath('/upcoming-tournaments/3')).toBe(true);
    expect(isNavbarOverlayPath('/reels/upload')).toBe(false);
  });
});

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

  it('reels feed uses transparent hero navbar; upload does not', () => {
    expect(isHeroNavbarPath('/reels', false)).toBe(true);
    expect(isHeroNavbarPath('/reels/upload', false)).toBe(false);
  });

  it('non-hero pages stay solid', () => {
    expect(isHeroNavbarPath('/shop', false)).toBe(false);
    expect(isHeroNavbarPath('/scorecard', false)).toBe(false);
  });
});
