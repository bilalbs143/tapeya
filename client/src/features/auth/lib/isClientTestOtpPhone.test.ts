import { describe, expect, it } from 'vitest';

import { isClientTestOtpPhone, parseTestOtpPhones } from './isClientTestOtpPhone';

describe('parseTestOtpPhones', () => {
  it('splits a comma-separated string', () => {
    expect(parseTestOtpPhones('+923216516130, +923001234567')).toEqual(['+923216516130', '+923001234567']);
  });
});

describe('isClientTestOtpPhone', () => {
  const list = '+923216516130,+923001234567';

  it('matches E.164 and digits-only forms', () => {
    expect(isClientTestOtpPhone('+923216516130', list)).toBe(true);
    expect(isClientTestOtpPhone('923216516130', list)).toBe(true);
  });

  it('rejects unknown phones and empty lists', () => {
    expect(isClientTestOtpPhone('+923009999999', list)).toBe(false);
    expect(isClientTestOtpPhone('+923216516130', '')).toBe(false);
    expect(isClientTestOtpPhone(null, list)).toBe(false);
  });
});
