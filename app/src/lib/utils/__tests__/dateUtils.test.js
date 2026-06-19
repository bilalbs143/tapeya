import { describe, expect, it } from 'vitest';

import { formatIsoDateForDisplay, parseDisplayOrIsoDate, toApiDate } from '../dateUtils';

describe('formatIsoDateForDisplay', () => {
  it('converts API ISO dates to MM-DD-YYYY', () => {
    expect(formatIsoDateForDisplay('1990-05-12')).toBe('05-12-1990');
    expect(formatIsoDateForDisplay('1990-05-12T00:00:00.000000Z')).toBe('05-12-1990');
  });

  it('does not corrupt values already in MM-DD-YYYY', () => {
    expect(formatIsoDateForDisplay('05-12-1990')).toBe('05-12-1990');
  });
});

describe('toApiDate', () => {
  it('converts DatePicker values to YYYY-MM-DD', () => {
    expect(toApiDate('05-12-1990')).toBe('1990-05-12');
  });

  it('leaves ISO values unchanged', () => {
    expect(toApiDate('1990-05-12')).toBe('1990-05-12');
  });

  it('returns empty string for corrupt legacy values instead of passing them through', () => {
    expect(toApiDate('12-1990-05')).toBe('');
  });
});

describe('parseDisplayOrIsoDate', () => {
  it('parses both display and ISO formats', () => {
    const fromDisplay = parseDisplayOrIsoDate('05-12-1990');
    const fromIso = parseDisplayOrIsoDate('1990-05-12');

    expect(fromDisplay?.getFullYear()).toBe(1990);
    expect(fromDisplay?.getMonth()).toBe(4);
    expect(fromDisplay?.getDate()).toBe(12);
    expect(fromIso?.getFullYear()).toBe(1990);
    expect(fromIso?.getMonth()).toBe(4);
    expect(fromIso?.getDate()).toBe(12);
  });
});
