import { describe, expect, it } from 'vitest';

import { isClientTestOtpPhone, parseTestOtpPhones } from '@/lib/isClientTestOtpPhone';

describe('parseTestOtpPhones', () => {
  it('parses comma-separated API value', () => {
    expect(parseTestOtpPhones('+923216516130, +923001234567')).toEqual(['+923216516130', '+923001234567']);
  });

  it('accepts arrays and empty input', () => {
    expect(parseTestOtpPhones(['+923216516130'])).toEqual(['+923216516130']);
    expect(parseTestOtpPhones('')).toEqual([]);
    expect(parseTestOtpPhones(null)).toEqual([]);
  });
});

describe('isClientTestOtpPhone', () => {
  const list = '+923216516130, +923001111111';

  it('matches phones from the API list', () => {
    expect(isClientTestOtpPhone('+923216516130', list)).toBe(true);
    expect(isClientTestOtpPhone('923216516130', list)).toBe(true);
  });

  it('returns false when not listed or list empty', () => {
    expect(isClientTestOtpPhone('+923009999999', list)).toBe(false);
    expect(isClientTestOtpPhone('+923216516130', '')).toBe(false);
    expect(isClientTestOtpPhone(null, list)).toBe(false);
  });
});
