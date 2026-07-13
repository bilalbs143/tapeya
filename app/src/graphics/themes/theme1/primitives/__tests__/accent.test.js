import { describe, expect, it } from 'vitest';

import { accentMix, mixColorWithTransparent } from '@/graphics/shared/accentColor';

describe('accentMix (vMix-safe)', () => {
  it('returns 8-digit hex for six-digit hex accents', () => {
    expect(accentMix('#5b7cff', 20)).toBe('#5b7cff33');
    expect(accentMix('#ff0000', 50)).toBe('#ff000080');
  });

  it('uses rgba fallback for css variables without DOM', () => {
    expect(accentMix('var(--accentA)', 20)).toBe('rgba(91, 124, 255, 0.2)');
    expect(accentMix('var(--accentB)', 80)).toBe('rgba(91, 124, 255, 0.8)');
  });

  it('never emits color-mix()', () => {
    const samples = [accentMix('#112233', 10), accentMix('var(--accentA)', 40), mixColorWithTransparent('rgb(10, 20, 30)', 25)];
    for (const value of samples) {
      expect(value).not.toMatch(/color-mix/i);
    }
  });
});
