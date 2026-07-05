import { describe, expect, it } from 'vitest';

import { collectNameWords, resolveBroadcastNameParts, resolveBroadcastPlayerName } from '../playerNameResolver';

describe('resolveBroadcastPlayerName', () => {
  it('keeps first two words and drops middle/extra names', () => {
    expect(resolveBroadcastPlayerName('Muhammad Nawaz Ali')).toBe('Muhammad Nawaz');
  });

  it('abbreviates a word longer than 12 characters', () => {
    expect(resolveBroadcastPlayerName('Christopheranthony Nawaz')).toBe('C. Nawaz');
  });

  it('abbreviates only the long word when the other is short', () => {
    expect(resolveBroadcastPlayerName('Muhammad Verylongsurnamehere')).toBe('Muhammad V.');
  });

  it('handles a single-word name', () => {
    expect(resolveBroadcastPlayerName('Rashid')).toBe('Rashid');
  });

  it('handles empty input', () => {
    expect(resolveBroadcastPlayerName('')).toBe('');
    expect(resolveBroadcastPlayerName(null)).toBe('');
  });
});

describe('resolveBroadcastNameParts', () => {
  it('splits into first and last for two-word result', () => {
    expect(resolveBroadcastNameParts('Muhammad Nawaz Ali')).toEqual({
      firstName: 'Muhammad',
      lastName: 'Nawaz',
      displayName: 'Muhammad Nawaz',
    });
  });

  it('reads from firstName/lastName when name is absent', () => {
    expect(
      resolveBroadcastNameParts({
        firstName: 'Muhammad',
        lastName: 'Nawaz Ali',
      }),
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
      firstName: 'Muhammad',
      lastName: 'Nawaz',
      displayName: 'Muhammad Nawaz',
    });
  });
});

describe('collectNameWords', () => {
  it('normalizes display_name aliases', () => {
    expect(collectNameWords({ display_name: 'A B C' })).toEqual(['A', 'B', 'C']);
  });
});
