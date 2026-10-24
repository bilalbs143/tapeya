import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config/paths';

import { userProfilePath } from './userProfilePath';

describe('userProfilePath', () => {
  it('always uses numeric id for in-app navigation', () => {
    expect(userProfilePath({ id: 12, nickname: '  waqar  ' })).toBe(`${APP_PATHS.user}/12`);
    expect(userProfilePath({ id: 12, nickname: null })).toBe(`${APP_PATHS.user}/12`);
    expect(userProfilePath({ id: 12, nickname: '   ' })).toBe(`${APP_PATHS.user}/12`);
    expect(userProfilePath({ id: 12 })).toBe(`${APP_PATHS.user}/12`);
  });
});
