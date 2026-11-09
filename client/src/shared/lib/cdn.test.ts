import { afterEach, describe, expect, it } from 'vitest';

import { cdnUrl, DEFAULT_CDN_PUBLIC_BASE, getCdnPublicBase, normalizeCdnPublicBase, setCdnPublicBaseUrl } from './cdn';

describe('cdn', () => {
  afterEach(() => {
    setCdnPublicBaseUrl(DEFAULT_CDN_PUBLIC_BASE);
  });

  it('normalizes CDN URLs', () => {
    expect(normalizeCdnPublicBase('https://cdn.tapeya.com/')).toBe('https://cdn.tapeya.com');
    expect(normalizeCdnPublicBase('cdn.tapeya.com')).toBe('https://cdn.tapeya.com');
    expect(normalizeCdnPublicBase('')).toBe('');
  });

  it('falls back to default when cleared', () => {
    setCdnPublicBaseUrl('https://cdn.example.com/');
    expect(getCdnPublicBase()).toBe('https://cdn.example.com');
    setCdnPublicBaseUrl('');
    expect(getCdnPublicBase()).toBe(DEFAULT_CDN_PUBLIC_BASE);
  });

  it('builds asset URLs from the active base', () => {
    setCdnPublicBaseUrl('https://cdn.example.com');
    expect(cdnUrl('app/images/x.jpg')).toBe('https://cdn.example.com/app/images/x.jpg');
    expect(cdnUrl('/app/images/x.jpg')).toBe('https://cdn.example.com/app/images/x.jpg');
  });
});
