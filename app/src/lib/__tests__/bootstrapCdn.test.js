import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_CDN_PUBLIC_BASE, getCdnPublicBase } from '@/lib/constants/assets';

const LAST_GOOD_STORAGE_KEY = 'tapeya.cdnPublicBaseUrl';

/** This suite runs under vitest's `node` environment (project-wide, no DOM) — fake a minimal Storage. */
function createFakeLocalStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

function settingsResponse(cdnPublicBaseUrl) {
  return {
    ok: true,
    json: async () => ({ data: [{ key: 'cdn_public_base_url', value: cdnPublicBaseUrl }] }),
  };
}

describe('bootstrapCdnFromPublicSettings', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('localStorage', createFakeLocalStorage());
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves on the first attempt and persists it as last-known-good', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(settingsResponse('https://cdn.tapeya.com')));
    const { bootstrapCdnFromPublicSettings } = await import('../bootstrapCdn');

    await bootstrapCdnFromPublicSettings();

    expect(getCdnPublicBase()).toBe('https://cdn.tapeya.com');
    expect(localStorage.getItem(LAST_GOOD_STORAGE_KEY)).toBe('https://cdn.tapeya.com');
  });

  it('retries a transient failure before succeeding', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('network blip'))
      .mockResolvedValueOnce(settingsResponse('https://cdn.tapeya.com'));
    vi.stubGlobal('fetch', fetchMock);
    const { bootstrapCdnFromPublicSettings } = await import('../bootstrapCdn');

    await bootstrapCdnFromPublicSettings();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getCdnPublicBase()).toBe('https://cdn.tapeya.com');
  });

  it('falls back to the last-known-good CDN base when every retry fails', async () => {
    localStorage.setItem(LAST_GOOD_STORAGE_KEY, 'https://cdn.tapeya.com');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { bootstrapCdnFromPublicSettings } = await import('../bootstrapCdn');

    await bootstrapCdnFromPublicSettings();

    expect(getCdnPublicBase()).toBe('https://cdn.tapeya.com');
  });

  it('falls back to the built-in default when every retry fails and nothing is cached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { bootstrapCdnFromPublicSettings } = await import('../bootstrapCdn');

    await bootstrapCdnFromPublicSettings();

    expect(getCdnPublicBase()).toBe(DEFAULT_CDN_PUBLIC_BASE);
  });
});

describe('reattemptIfDegraded', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('localStorage', createFakeLocalStorage());
    vi.stubGlobal('window', { location: { reload: vi.fn() } });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing when the last resolution was healthy', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(settingsResponse('https://cdn.tapeya.com')));
    const { bootstrapCdnFromPublicSettings, reattemptIfDegraded } = await import('../bootstrapCdn');
    await bootstrapCdnFromPublicSettings(); // healthy boot — not degraded

    await reattemptIfDegraded();

    expect(fetch).toHaveBeenCalledTimes(1); // no extra call from the no-op reattempt
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it('reloads when a corrected CDN base is found after a degraded boot', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);
    const { bootstrapCdnFromPublicSettings, reattemptIfDegraded } = await import('../bootstrapCdn');
    await bootstrapCdnFromPublicSettings(); // degraded boot — falls back to built-in default

    fetchMock.mockResolvedValue(settingsResponse('https://cdn.tapeya.com'));
    await reattemptIfDegraded();

    expect(getCdnPublicBase()).toBe('https://cdn.tapeya.com');
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload when the retry is still unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { bootstrapCdnFromPublicSettings, reattemptIfDegraded } = await import('../bootstrapCdn');
    await bootstrapCdnFromPublicSettings(); // degraded boot

    await reattemptIfDegraded(); // still unreachable

    expect(window.location.reload).not.toHaveBeenCalled();
  });
});
