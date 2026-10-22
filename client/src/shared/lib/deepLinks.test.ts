import { describe, expect, it } from 'vitest';

import {
  buildHttpsDeepLink,
  isSafeNotificationNavigatePath,
  pathFromDeepLinkUrl,
  resolveNotificationHref,
  rewriteLegacyAppPath,
} from './deepLinks';

describe('deepLinks', () => {
  it('builds https share links from a public origin', () => {
    expect(buildHttpsDeepLink('/live/broadcast/44', 'https://tapeya.com')).toBe('https://tapeya.com/live/broadcast/44');
  });

  it('rewrites legacy share paths', () => {
    expect(rewriteLegacyAppPath('/scorecard/match/9')).toBe('/match/9');
    expect(rewriteLegacyAppPath('/reels/u/3')).toBe('/users/3');
    expect(rewriteLegacyAppPath('/serials/2/e/1')).toBe('/entertainment/2/e/1');
    expect(rewriteLegacyAppPath('/live/streaming')).toBe('/entertainment');
    expect(rewriteLegacyAppPath('/live/streaming/foo')).toBe('/entertainment');
    expect(rewriteLegacyAppPath('/notification-center')).toBe('/notifications');
    expect(rewriteLegacyAppPath('/home')).toBe('/');
  });

  it('parses https and tapeya scheme URLs', () => {
    expect(pathFromDeepLinkUrl('https://tapeya.com/scorecard/match/5')).toBe('/match/5');
    expect(pathFromDeepLinkUrl('tapeya://entertainment/2/e/1')).toBe('/entertainment/2/e/1');
    expect(pathFromDeepLinkUrl('tapeya://reels/u/9')).toBe('/users/9');
  });

  it('keeps inbox self-links out of card hrefs but allows push navigate', () => {
    expect(resolveNotificationHref('/notification-center')).toBeNull();
    expect(isSafeNotificationNavigatePath('/notification-center')).toBe(true);
    expect(isSafeNotificationNavigatePath('/notifications')).toBe(true);
  });
});
