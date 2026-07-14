import { describe, expect, it } from 'vitest';

import {
  BROADCAST_NAME_STYLE,
  collectNameWords,
  resolveBroadcastNameParts,
  resolveBroadcastPlayerName,
} from '../playerNameResolver';

describe('resolveBroadcastPlayerName — compact (LT)', () => {
  it('uses first initial + full second name and drops the third', () => {
    expect(resolveBroadcastPlayerName('Muhammad Bilal Khan')).toBe('M Bilal');
    expect(resolveBroadcastPlayerName('Muhammad Nawaz Ali')).toBe('M Nawaz');
    expect(resolveBroadcastPlayerName('Shaheen Shah Afridi')).toBe('S Shah');
  });

  it('initials the first word for two-part names', () => {
    expect(resolveBroadcastPlayerName('Babar Azam')).toBe('B Azam');
  });

  it('keeps a single-word name full', () => {
    expect(resolveBroadcastPlayerName('Rashid')).toBe('Rashid');
  });

  it('defaults to compact when style is omitted', () => {
    expect(resolveBroadcastPlayerName('Muhammad Bilal Khan')).toBe('M Bilal');
  });

  it('handles empty input', () => {
    expect(resolveBroadcastPlayerName('')).toBe('');
    expect(resolveBroadcastPlayerName(null)).toBe('');
  });
});

describe('resolveBroadcastPlayerName — standard (FS)', () => {
  it('keeps first two words full and drops the third', () => {
    expect(resolveBroadcastPlayerName('Muhammad Bilal Khan', BROADCAST_NAME_STYLE.standard)).toBe('Muhammad Bilal');
    expect(resolveBroadcastPlayerName('Muhammad Nawaz Ali', BROADCAST_NAME_STYLE.standard)).toBe('Muhammad Nawaz');
  });

  it('abbreviates a word longer than 12 characters', () => {
    expect(resolveBroadcastPlayerName('Christopheranthony Nawaz', BROADCAST_NAME_STYLE.standard)).toBe('C. Nawaz');
  });

  it('abbreviates only the long word when the other is short', () => {
    expect(resolveBroadcastPlayerName('Muhammad Verylongsurnamehere', BROADCAST_NAME_STYLE.standard)).toBe(
      'Muhammad V.',
    );
  });

  it('keeps a single-word name full', () => {
    expect(resolveBroadcastPlayerName('Rashid', BROADCAST_NAME_STYLE.standard)).toBe('Rashid');
  });

  it('places a single-word standard name on lastName for FS hero layouts', () => {
    expect(resolveBroadcastNameParts('Rashid', BROADCAST_NAME_STYLE.standard)).toEqual({
      firstName: '',
      lastName: 'Rashid',
      displayName: 'Rashid',
    });
  });
});

describe('resolveBroadcastNameParts', () => {
  it('compact: splits into initial firstName and full lastName', () => {
    expect(resolveBroadcastNameParts('Muhammad Nawaz Ali')).toEqual({
      firstName: 'M',
      lastName: 'Nawaz',
      displayName: 'M Nawaz',
    });
  });

  it('standard: keeps full first two words', () => {
    expect(resolveBroadcastNameParts('Muhammad Nawaz Ali', BROADCAST_NAME_STYLE.standard)).toEqual({
      firstName: 'Muhammad',
      lastName: 'Nawaz',
      displayName: 'Muhammad Nawaz',
    });
  });

  it('reads from firstName/lastName when name is absent', () => {
    expect(
      resolveBroadcastNameParts(
        {
          firstName: 'Muhammad',
          lastName: 'Nawaz Ali',
        },
        BROADCAST_NAME_STYLE.standard,
      ),
    ).toEqual({
      firstName: 'Muhammad',
      lastName: 'Nawaz',
      displayName: 'Muhammad Nawaz',
    });
  });

  it('prefers full name field when present', () => {
    expect(
      resolveBroadcastNameParts({
        name: 'Muhammad Nawaz Ali',
        firstName: 'Wrong',
        lastName: 'Name',
      }),
    ).toEqual({
      firstName: 'M',
      lastName: 'Nawaz',
      displayName: 'M Nawaz',
    });
  });

  it('keeps single-word parts without inventing a last name', () => {
    expect(resolveBroadcastNameParts('Rashid')).toEqual({
      firstName: 'Rashid',
      lastName: '',
      displayName: 'Rashid',
    });
  });
});

describe('collectNameWords', () => {
  it('normalizes display_name aliases', () => {
    expect(collectNameWords({ display_name: 'A B C' })).toEqual(['A', 'B', 'C']);
  });

  it('prefers first/last when display_name is a single surname token', () => {
    expect(
      collectNameWords({
        display_name: 'Bilal',
        first_name: 'Muhammad',
        last_name: 'Bilal',
      }),
    ).toEqual(['Muhammad', 'Bilal']);
  });
});
