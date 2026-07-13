import { describe, expect, it } from 'vitest';

import { coalesceTrim, resolveTournamentShortCode, toNum } from '../utils';

describe('graphics core utils', () => {
  it('coalesceTrim returns first non-empty string', () => {
    expect(coalesceTrim('', null, 'PSL', 'Other')).toBe('PSL');
  });

  it('toNum coerces finite numbers', () => {
    expect(toNum('12')).toBe(12);
    expect(toNum('x')).toBeNull();
  });

  describe('resolveTournamentShortCode', () => {
    it('prefers explicit short code', () => {
      expect(resolveTournamentShortCode('PSL', 'Pallandari Super League')).toBe('PSL');
    });

    it('derives acronym from multi-word tournament name', () => {
      expect(resolveTournamentShortCode('', 'Pallandari Super League')).toBe('PSL');
    });

    it('uses first three letters for single-word name', () => {
      expect(resolveTournamentShortCode(null, 'Tapeya')).toBe('TAP');
    });

    it('returns empty when both inputs are blank', () => {
      expect(resolveTournamentShortCode('', '')).toBe('');
    });
  });
});
