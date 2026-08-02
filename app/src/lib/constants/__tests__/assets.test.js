import { describe, expect, it } from 'vitest';

import {
  DEFAULT_APP_ASSETS_BASE,
  DEFAULT_CDN_PUBLIC_BASE,
  getAppAssetsBase,
  getCdnPublicBase,
  normalizeCdnPublicBase,
  setCdnPublicBaseUrl,
} from '../assets';

describe('assets CDN base', () => {
  it('normalizes CDN URLs', () => {
    expect(normalizeCdnPublicBase('https://cdn.tapeya.com/')).toBe('https://cdn.tapeya.com');
    expect(normalizeCdnPublicBase('cdn.tapeya.com')).toBe('https://cdn.tapeya.com');
    expect(normalizeCdnPublicBase('')).toBe('');
  });

  it('updates app assets base from public CDN setting', () => {
    setCdnPublicBaseUrl('https://cdn.tapeya.com/');
    expect(getCdnPublicBase()).toBe('https://cdn.tapeya.com');
    expect(getAppAssetsBase()).toBe('https://cdn.tapeya.com/app');

    setCdnPublicBaseUrl('');
    expect(getCdnPublicBase()).toBe(DEFAULT_CDN_PUBLIC_BASE);
    expect(getAppAssetsBase()).toBe(DEFAULT_APP_ASSETS_BASE);
  });
});
