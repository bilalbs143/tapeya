import { describe, expect, it } from 'vitest';

import { isSixDigitHex, mixColorWithTransparent, normalizeColor, resolveCssColorRgb } from '../accentColor';

describe('shared accentColor', () => {
  it('normalizes empty strings to fallback', () => {
    expect(normalizeColor('', 'var(--accentA)')).toBe('var(--accentA)');
    expect(normalizeColor('  ', '#5b7cff')).toBe('#5b7cff');
  });

  it('detects six-digit hex', () => {
    expect(isSixDigitHex('#5b7cff')).toBe(true);
    expect(isSixDigitHex('#5b7cff21')).toBe(false);
  });

  it('resolves hex to rgb', () => {
    expect(resolveCssColorRgb('#f0a93c')).toEqual({ r: 240, g: 169, b: 60, a: 1 });
  });

  it('appends hex alpha for six-digit colors', () => {
    expect(mixColorWithTransparent('#f0a93c', 80)).toBe('#f0a93ccc');
    expect(mixColorWithTransparent('#9b7bff', 20)).toBe('#9b7bff33');
  });

  it('resolves css variables to rgba without color-mix', () => {
    expect(mixColorWithTransparent('var(--accentA)', 20)).toMatch(/^rgba\(91,\s*124,\s*255,\s*0\.2\)$/);
    expect(mixColorWithTransparent('var(--accentB)', 80)).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*0\.8\)$/);
  });
});
