import { afterEach, describe, expect, it } from 'vitest';

import {
  interestCampaignDialogAutoShownKey,
  interestCampaignDialogDismissedKey,
  isInterestCampaignDialogAutoShown,
  isInterestCampaignDialogBlockedPath,
  isInterestCampaignDialogDismissed,
  markInterestCampaignDialogAutoShown,
  markInterestCampaignDialogDismissed,
} from './interestCampaignDialog';

describe('interestCampaignDialog session flags', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('tracks dismiss and auto-shown per user + slug', () => {
    expect(isInterestCampaignDialogDismissed(9, 'cup')).toBe(false);
    expect(isInterestCampaignDialogAutoShown(9, 'cup')).toBe(false);

    markInterestCampaignDialogDismissed(9, 'cup');
    markInterestCampaignDialogAutoShown(9, 'cup');

    expect(sessionStorage.getItem(interestCampaignDialogDismissedKey(9, 'cup'))).toBe('1');
    expect(sessionStorage.getItem(interestCampaignDialogAutoShownKey(9, 'cup'))).toBe('1');
    expect(isInterestCampaignDialogDismissed(9, 'cup')).toBe(true);
    expect(isInterestCampaignDialogAutoShown(9, 'cup')).toBe(true);
    expect(isInterestCampaignDialogDismissed(9, 'other')).toBe(false);
  });
});

describe('isInterestCampaignDialogBlockedPath', () => {
  it('blocks auth, immersive media, scoring, and the interest page itself', () => {
    expect(isInterestCampaignDialogBlockedPath('/login')).toBe(true);
    expect(isInterestCampaignDialogBlockedPath('/reels')).toBe(true);
    expect(isInterestCampaignDialogBlockedPath('/reels/12')).toBe(true);
    expect(isInterestCampaignDialogBlockedPath('/live/broadcast/3')).toBe(true);
    expect(isInterestCampaignDialogBlockedPath('/highlights/6')).toBe(true);
    expect(isInterestCampaignDialogBlockedPath('/matches/9/score')).toBe(true);
    expect(isInterestCampaignDialogBlockedPath('/interest/ramzan-cup')).toBe(true);
  });

  it('allows home and regular browse routes', () => {
    expect(isInterestCampaignDialogBlockedPath('/')).toBe(false);
    expect(isInterestCampaignDialogBlockedPath('/shop')).toBe(false);
    expect(isInterestCampaignDialogBlockedPath('/upcoming-tournaments')).toBe(false);
  });
});
