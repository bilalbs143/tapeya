import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config/paths';

import { userProfilePath } from './userProfilePath';

describe('userProfilePath', () => {
  it('prefers a trimmed nickname', () => {
    expect(userProfilePath({ id: 12, nickname: '  waqar  ' })).toBe(`${APP_PATHS.user}/waqar`);
  });

  it('falls back to numeric id when nickname is missing', () => {
    expect(userProfilePath({ id: 12, nickname: null })).toBe(`${APP_PATHS.user}/12`);
    expect(userProfilePath({ id: 12, nickname: '   ' })).toBe(`${APP_PATHS.user}/12`);
    expect(userProfilePath({ id: 12 })).toBe(`${APP_PATHS.user}/12`);
  });

  it('encodes the path segment', () => {
    expect(userProfilePath({ id: 1, nickname: 'a/b' })).toBe(`${APP_PATHS.user}/${encodeURIComponent('a/b')}`);
  });
});
