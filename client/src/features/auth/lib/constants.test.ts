import { describe, expect, it } from 'vitest';

import { COUNTRIES, countryByCode, countryByDial, DEFAULT_COUNTRY_CODE, DEFAULT_DIAL } from './constants';

describe('COUNTRIES', () => {
  it('defaults to Pakistan first', () => {
    expect(COUNTRIES[0]?.code).toBe('PK');
    expect(DEFAULT_COUNTRY_CODE).toBe('PK');
    expect(DEFAULT_DIAL).toBe('+92');
    expect(countryByDial('+92').code).toBe('PK');
  });

  it('lists United States and Canada separately on +1', () => {
    const us = COUNTRIES.find((c) => c.code === 'US');
    const ca = COUNTRIES.find((c) => c.code === 'CA');
    expect(us?.dial).toBe('+1');
    expect(ca?.dial).toBe('+1');
    expect(us?.name).toBe('United States');
    expect(ca?.name).toBe('Canada');
    expect(countryByDial('+1').code).toBe('US');
    expect(countryByCode('CA').dial).toBe('+1');
  });

  it('covers legacy dials minus microstates / tiny islands', () => {
    expect(COUNTRIES.length).toBeGreaterThan(140);
    expect(COUNTRIES.some((c) => c.code === 'FJ')).toBe(true);
    expect(COUNTRIES.some((c) => c.code === 'RU')).toBe(true);
    expect(COUNTRIES.some((c) => c.code === 'BR')).toBe(true);
    expect(COUNTRIES.some((c) => c.code === 'NR')).toBe(false);
    expect(COUNTRIES.some((c) => c.code === 'KP')).toBe(false);
  });

  it('has unique ISO codes and sane NSN bounds', () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);

    for (const c of COUNTRIES) {
      expect(c.name.length).toBeGreaterThan(2);
      expect(c.nsnMin).toBeGreaterThanOrEqual(7);
      expect(c.nsnMax).toBeLessThanOrEqual(15);
      expect(c.nsnMin).toBeLessThanOrEqual(c.nsnMax);
      expect(c.placeholder.replace(/\D/g, '').length).toBeGreaterThanOrEqual(c.nsnMin);
      expect(c.placeholder.replace(/\D/g, '').length).toBeLessThanOrEqual(c.nsnMax);
    }
  });

  it('falls back to Pakistan for unknown dials', () => {
    expect(countryByDial('+999').code).toBe('PK');
    expect(countryByCode('XX').code).toBe('PK');
  });
});
