import { describe, expect, it } from 'vitest';

import { accentMix, mixColorWithTransparent } from '../accent';

describe('theme2 accentMix (vMix-safe, wine defaults)', () => {
  it('returns 8-digit hex for six-digit hex accents', () => {
    expect(accentMix('#c40038', 20)).toBe('#c4003833');
    expect(accentMix('#ff0000', 50)).toBe('#ff000080');
  });

  it('uses wine rgba fallback for css variables without DOM', () => {
    expect(accentMix('var(--accentA)', 20)).toBe('rgba(196, 0, 56, 0.2)');
    expect(accentMix('var(--accentB)', 80)).toBe('rgba(196, 0, 56, 0.8)');
  });

  it('never emits color-mix()', () => {
    const samples = [accentMix('#112233', 10), accentMix('var(--accentA)', 40), mixColorWithTransparent('rgb(10, 20, 30)', 25)];
    for (const value of samples) {
      expect(value).not.toMatch(/color-mix/i);
    }
  });
});
