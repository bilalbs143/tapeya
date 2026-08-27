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
    expect(isHeroNavbarPath('/reels/u/12')).toBe(false);
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

describe('auto dialogs on highlight details', () => {
  it('blocks entry dialogs so playback is not interrupted', () => {
    expect(isGlobalEntryDialogBlockedPath('/highlights/6')).toBe(true);
    expect(isProfileStrengthReminderBlockedPath('/highlights/6')).toBe(true);
    expect(isInterestCampaignDialogBlockedPath('/highlights/6')).toBe(true);
    expect(isGlobalEntryDialogBlockedPath('/highlights')).toBe(false);
  });
  it('blocks profile reminder on edit account and creator profiles', () => {
    expect(isProfileStrengthReminderBlockedPath('/profile')).toBe(true);
    expect(isProfileStrengthReminderBlockedPath('/reels/u/12')).toBe(true);
    expect(isProfileStrengthReminderBlockedPath('/home')).toBe(false);
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
    expect(isHeroNavbarPath('/live/broadcast/31', false)).toBe(false);
  });

  it('goes transparent only when isLiveHero is true', () => {
    expect(isHeroNavbarPath('/live/broadcast/31', true)).toBe(true);
  });

  it('go-live camera never goes transparent', () => {
    expect(isHeroNavbarPath('/live/go-live/31', true)).toBe(false);
  });

  it('unrelated hero pages are unaffected by the new param', () => {
    expect(isHeroNavbarPath('/home')).toBe(true);
    expect(isHeroNavbarPath('/profile')).toBe(true);
    expect(isHeroNavbarPath('/upcoming-tournaments/6')).toBe(true);
  });

  it('highlight details use solid navbar (standard live-style shell)', () => {
    expect(isHeroNavbarPath('/highlights/6')).toBe(false);
    expect(isNavbarOverlayPath('/highlights/6')).toBe(false);
  });

  it('reels feed uses transparent hero navbar; upload does not', () => {
    expect(isHeroNavbarPath('/reels')).toBe(true);
    expect(isHeroNavbarPath('/reels/upload')).toBe(false);
  });

  it('non-hero pages stay solid', () => {
    expect(isHeroNavbarPath('/shop')).toBe(false);
    expect(isHeroNavbarPath('/scorecard')).toBe(false);
  });
});
