import { describe, expect, it } from 'vitest';

import { DEFAULT_DIAL } from './constants';
import {
  clampNational,
  isValidNational,
  nationalDigits,
  nationalNumberError,
  optionalNationalError,
  splitE164,
  toE164,
} from './phone';

describe('nationalDigits', () => {
  it('strips non-digits and leading trunk zeros', () => {
    expect(nationalDigits('0300 123 4567')).toBe('3001234567');
    expect(nationalDigits('003001234567')).toBe('3001234567');
    expect(nationalDigits('300-123-4567')).toBe('3001234567');
  });
});

describe('clampNational', () => {
  it('caps to the selected country max', () => {
    expect(clampNational('300123456789', '+92')).toBe('3001234567');
    expect(clampNational('03001234567', '+92')).toBe('3001234567');
  });
});

describe('toE164', () => {
  it('builds E.164 and drops a leading 0', () => {
    expect(toE164('+92', '3001234567')).toBe('+923001234567');
    expect(toE164(DEFAULT_DIAL, '03001234567')).toBe('+923001234567');
  });
});

describe('isValidNational', () => {
  it('rejects leading zero and short numbers', () => {
    expect(isValidNational('03001234567', '+92')).toBe(false);
    expect(isValidNational('123', '+92')).toBe(false);
    expect(isValidNational('', '+92')).toBe(false);
  });

  it('enforces country length', () => {
    expect(isValidNational('3001234567', '+92')).toBe(true);
    expect(isValidNational('300123456', '+92')).toBe(false);
    expect(isValidNational('501234567', '+971')).toBe(true);
    expect(isValidNational('5012345678', '+971')).toBe(false);
    expect(isValidNational('2015550123', '+1')).toBe(true);
  });
});

describe('nationalNumberError', () => {
  it('calls out leading zero separately', () => {
    expect(nationalNumberError('03001234567', '+92')).toMatch(/leading 0|trunk zero/i);
    expect(nationalNumberError('3001234567', '+92')).toBeNull();
  });

  it('mentions the selected country length', () => {
    expect(nationalNumberError('300123456', '+92')).toMatch(/10-digit.*Pakistan/i);
    expect(nationalNumberError('50123456', '+971')).toMatch(/9-digit.*United Arab Emirates/i);
  });
});

describe('splitE164', () => {
  it('splits curated dial codes and falls back to default', () => {
    expect(splitE164('+923001234567')).toEqual({ code: 'PK', dial: '+92', national: '3001234567' });
    expect(splitE164('+971501234567')).toEqual({ code: 'AE', dial: '+971', national: '501234567' });
    expect(splitE164('+12015550123')).toEqual({ code: 'US', dial: '+1', national: '2015550123' });
    expect(splitE164(null)).toEqual({ code: 'PK', dial: DEFAULT_DIAL, national: '' });
  });
});

describe('optionalNationalError', () => {
  it('allows empty and validates when present', () => {
    expect(optionalNationalError('', '+92')).toBeNull();
    expect(optionalNationalError('   ', '+92')).toBeNull();
    expect(optionalNationalError('300123456', '+92')).toMatch(/10-digit/i);
    expect(optionalNationalError('3001234567', '+92')).toBeNull();
  });
});
