import { describe, expect, it } from 'vitest';

import { buildDeepLinkPath, isAllowedDeepLinkPath, isSafeNotificationNavigatePath } from '../deepLinkRegistry';
import { buildAppSchemeDeepLink, buildHttpsDeepLink, pathFromDeepLinkUrl } from '../deepLinkUtils';

describe('deepLinkRegistry', () => {
  it('builds known routes', () => {
    expect(buildDeepLinkPath('post', { postId: 8 })).toBe('/feed/8');
    expect(buildDeepLinkPath('reel', { reelId: 42 })).toBe('/reels/42');
    expect(buildDeepLinkPath('reelCreator', { userId: 9 })).toBe('/reels/u/9');
    expect(buildDeepLinkPath('liveGoLive', { streamId: 31 })).toBe('/live/go-live/31');
  });

  it('allows registered paths only', () => {
    expect(isAllowedDeepLinkPath('/feed/8')).toBe(true);
    expect(isAllowedDeepLinkPath('/reels/12')).toBe(true);
    expect(isAllowedDeepLinkPath('/reels/u/12')).toBe(true);
    expect(isAllowedDeepLinkPath('/reels/upload')).toBe(false);
    expect(isAllowedDeepLinkPath('/live/go-live/31')).toBe(true);
    expect(isAllowedDeepLinkPath('/shop')).toBe(false);
  });

  it('allows notification navigate paths for push / in-app taps', () => {
    expect(isSafeNotificationNavigatePath('/feed/8')).toBe(true);
    expect(isSafeNotificationNavigatePath('/reels/12')).toBe(true);
    expect(isSafeNotificationNavigatePath('/notification-center')).toBe(true);
    expect(isSafeNotificationNavigatePath('/shop/orders/9')).toBe(true);
    expect(isSafeNotificationNavigatePath('/shop')).toBe(false);
    expect(isSafeNotificationNavigatePath('/reels/upload')).toBe(false);
  });
});

describe('deepLinkUtils', () => {
  it('builds https and scheme URLs from a path', () => {
    expect(buildHttpsDeepLink('/feed/8', 'https://tapeya.com')).toBe('https://tapeya.com/feed/8');
    expect(buildAppSchemeDeepLink('/feed/8')).toBe('tapeya://feed/8');
    expect(buildHttpsDeepLink('/reels/12', 'https://tapeya.com')).toBe('https://tapeya.com/reels/12');
    expect(buildAppSchemeDeepLink('/reels/12')).toBe('tapeya://reels/12');
    expect(buildAppSchemeDeepLink('/live/go-live/31')).toBe('tapeya://live/go-live/31');
  });

  it('parses https and custom-scheme deep links', () => {
    expect(pathFromDeepLinkUrl('https://tapeya.com/feed/8')).toBe('/feed/8');
    expect(pathFromDeepLinkUrl('tapeya://feed/8')).toBe('/feed/8');
    expect(pathFromDeepLinkUrl('https://tapeya.com/reels/12')).toBe('/reels/12');
    expect(pathFromDeepLinkUrl('https://tapeya.com/reels/12/')).toBe('/reels/12');
    expect(pathFromDeepLinkUrl('https://tapeya.com/reels/upload')).toBe(null);
    expect(pathFromDeepLinkUrl('tapeya://reels/12')).toBe('/reels/12');
    expect(pathFromDeepLinkUrl('tapeya://live/go-live/31')).toBe('/live/go-live/31');
  });
});
