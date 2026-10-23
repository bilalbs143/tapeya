import { describe, expect, it, vi } from 'vitest';

import {
  getNativeStoreConfig,
  openExternalStoreUrl,
  sanitizeAppStoreUrl,
  sanitizePlayStoreUrl,
  toNativeAppStoreUrl,
  toNativePlayStoreUrl,
} from './storeLinks';

describe('storeLinks', () => {
  it('sanitizes App Store URLs', () => {
    expect(sanitizeAppStoreUrl('https://apps.apple.com/app/tapeya/id123')).toBe(
      'https://apps.apple.com/app/tapeya/id123'
    );
    expect(sanitizeAppStoreUrl('https://evil.example/apps.apple.com')).toBe('');
    expect(sanitizeAppStoreUrl('not-a-url')).toBe('');
  });

  it('sanitizes Play Store URLs', () => {
    expect(sanitizePlayStoreUrl('https://play.google.com/store/apps/details?id=com.tapeya')).toBe(
      'https://play.google.com/store/apps/details?id=com.tapeya'
    );
    expect(sanitizePlayStoreUrl('https://evil.example/play.google.com')).toBe('');
  });

  it('opens only sanitized store URLs', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    openExternalStoreUrl('https://apps.apple.com/app/id1');
    expect(open).toHaveBeenCalledWith('https://apps.apple.com/app/id1', '_blank', 'noopener,noreferrer');
    open.mockClear();
    openExternalStoreUrl('https://evil.example');
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it('reads native store config for iOS and Android', () => {
    expect(
      getNativeStoreConfig(
        {
          ios_app_store_version: '1.2.3',
          ios_app_store_url: 'https://apps.apple.com/app/id1',
        },
        'ios'
      )
    ).toEqual({
      configuredVersion: '1.2.3',
      storeUrl: 'https://apps.apple.com/app/id1',
      storeName: 'App Store',
    });

    expect(
      getNativeStoreConfig(
        {
          android_play_store_version: '2.0.0',
          android_play_store_url: 'https://play.google.com/store/apps/details?id=com.tapeya',
        },
        'android'
      )
    ).toEqual({
      configuredVersion: '2.0.0',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.tapeya',
      storeName: 'Play Store',
    });
  });

  it('builds native deep links', () => {
    expect(toNativeAppStoreUrl('https://apps.apple.com/app/id1')).toBe('itms-apps://itunes.apple.com/app/id1');
    expect(toNativePlayStoreUrl('https://play.google.com/store/apps/details?id=com.tapeya')).toBe(
      'market://details?id=com.tapeya'
    );
  });
});
