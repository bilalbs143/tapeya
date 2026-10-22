import { describe, expect, it } from 'vitest';

import { parseProfileHandle, profilePathSegment } from './resolveHandle';

describe('parseProfileHandle', () => {
  it('parses positive numeric ids', () => {
    expect(parseProfileHandle('11')).toEqual({ kind: 'id', id: 11 });
  });

  it('rejects zero and empty', () => {
    expect(parseProfileHandle('0')).toBeNull();
    expect(parseProfileHandle('')).toBeNull();
    expect(parseProfileHandle(undefined)).toBeNull();
  });

  it('treats non-numeric segments as nicknames', () => {
    expect(parseProfileHandle('sara')).toEqual({ kind: 'nickname', nickname: 'sara' });
    expect(parseProfileHandle('Sara Ali')).toEqual({ kind: 'nickname', nickname: 'Sara Ali' });
  });
});

describe('profilePathSegment', () => {
  it('prefers nickname over id', () => {
    expect(profilePathSegment({ id: 11, nickname: 'sara' })).toBe('sara');
    expect(profilePathSegment({ id: 11, nickname: null })).toBe('11');
  });
});
