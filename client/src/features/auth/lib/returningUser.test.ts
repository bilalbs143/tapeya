import { beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_PATHS } from '@/shared/config/paths';

vi.mock('./profiles', () => ({
  getProfiles: vi.fn(),
}));

import { getProfiles } from './profiles';
import { guestAuthPath, isReturningUser, markReturningUser } from './returningUser';

const getProfilesMock = vi.mocked(getProfiles);

describe('returningUser', () => {
  beforeEach(() => {
    localStorage.clear();
    getProfilesMock.mockReset();
    getProfilesMock.mockResolvedValue([]);
  });

  it('treats a clean install as first-time', async () => {
    expect(await isReturningUser()).toBe(false);
    expect(await guestAuthPath()).toBe(APP_PATHS.register);
  });

  it('sends returning devices to login after markReturningUser', async () => {
    markReturningUser();
    expect(await isReturningUser()).toBe(true);
    expect(await guestAuthPath()).toBe(APP_PATHS.login);
  });

  it('treats saved profiles as returning even without the flag', async () => {
    getProfilesMock.mockResolvedValue([
      {
        id: 1,
        name: 'Test',
        nickname: null,
        phone: '+15551234567',
        avatarUrl: null,
        token: null,
      },
    ]);
    expect(await isReturningUser()).toBe(true);
    expect(await guestAuthPath()).toBe(APP_PATHS.login);
  });
});
