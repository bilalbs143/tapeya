import { describe, expect, it } from 'vitest';

import { accentGlowShadow, accentMix, normalizeAccentColor } from '../accent';

describe('accent helpers', () => {
  it('normalizes empty strings to fallback', () => {
    expect(normalizeAccentColor('', 'var(--accentA)')).toBe('var(--accentA)');
    expect(normalizeAccentColor('  ', '#5b7cff')).toBe('#5b7cff');
  });

  it('appends hex alpha for six-digit colors', () => {
    expect(accentMix('#f0a93c', 80)).toBe('#f0a93ccc');
    expect(accentMix('#9b7bff', 20)).toBe('#9b7bff33');
  });

  it('uses color-mix for css variables', () => {
    expect(accentMix('var(--accentA)', 20)).toBe('color-mix(in srgb, var(--accentA) 20%, transparent)');
    expect(accentMix('var(--accentB)', 80)).toBe('color-mix(in srgb, var(--accentB) 80%, transparent)');
  });

  it('builds glow shadows from percent opacity', () => {
    expect(accentGlowShadow('#5b7cff', 13)).toBe('0 0 calc(16px * var(--glow)) #5b7cff21');
  });
});
