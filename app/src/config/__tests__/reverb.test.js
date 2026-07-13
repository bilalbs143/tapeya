import { afterEach, describe, expect, it, vi } from 'vitest';

import { getReverbClientConfig } from '@/config/reverb';

describe('getReverbClientConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to the shared dev default when VITE_REVERB_APP_KEY is unset', () => {
    vi.stubEnv('VITE_REVERB_APP_KEY', '');
    expect(getReverbClientConfig().appKey).toBe('local-reverb-key');
  });

  it('uses VITE_REVERB_APP_KEY when set, so a key rotation needs no code change', () => {
    vi.stubEnv('VITE_REVERB_APP_KEY', 'prod-rotated-key');
    expect(getReverbClientConfig().appKey).toBe('prod-rotated-key');
  });
});
