import { describe, expect, it } from 'vitest';

import { accentGlowShadow } from '../../visualEffects';
import { accentMix, normalizeAccentColor } from '../accent';

describe('theme1 accent helpers', () => {
  it('uses theme1 accentA as default fallback', () => {
    expect(normalizeAccentColor('')).toBe('#5b7cff');
  });

  it('delegates mix to shared helper', () => {
    expect(accentMix('#5b7cff', 13)).toBe('#5b7cff21');
  });

  it('builds glow shadows from percent opacity', () => {
    expect(accentGlowShadow('#5b7cff', 13)).toBe('0 0 calc(16px * var(--glow)) #5b7cff21');
  });
});
