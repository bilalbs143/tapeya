import { beforeEach, describe, expect, it, vi } from 'vitest';

const prefsStore = new Map<string, string>();
const secureStore = new Map<string, string>();

const isNativePlatform = vi.fn(() => false);

vi.mock('@/shared/platform/platform', () => ({
  isNativePlatform: () => isNativePlatform(),
}));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(async ({ key }: { key: string }) => ({
      value: prefsStore.get(key) ?? null,
    })),
    set: vi.fn(async ({ key, value }: { key: string; value: string }) => {
      prefsStore.set(key, value);
    }),
    remove: vi.fn(async ({ key }: { key: string }) => {
      prefsStore.delete(key);
    }),
  },
}));

vi.mock('@aparajita/capacitor-secure-storage', () => ({
  KeychainAccess: { whenUnlockedThisDeviceOnly: 1 },
  SecureStorage: {
    setKeyPrefix: vi.fn(async () => undefined),
    setSynchronize: vi.fn(async () => undefined),
    setDefaultKeychainAccess: vi.fn(async () => undefined),
    getItem: vi.fn(async (key: string) => secureStore.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      secureStore.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      secureStore.delete(key);
    }),
  },
}));

describe('secureStorage', () => {
  beforeEach(() => {
    prefsStore.clear();
    secureStore.clear();
    isNativePlatform.mockReset();
    isNativePlatform.mockReturnValue(false);
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('uses Preferences on web', async () => {
    isNativePlatform.mockReturnValue(false);
    const { secureStorage, AUTH_SESSION_KEY } = await import('./secureStorage');

    await secureStorage.set(AUTH_SESSION_KEY, '{"accessToken":"t","userId":1}');
    expect(prefsStore.get(AUTH_SESSION_KEY)).toBe('{"accessToken":"t","userId":1}');
    expect(secureStore.size).toBe(0);

    await expect(secureStorage.get(AUTH_SESSION_KEY)).resolves.toBe('{"accessToken":"t","userId":1}');
    await secureStorage.remove(AUTH_SESSION_KEY);
    expect(prefsStore.has(AUTH_SESSION_KEY)).toBe(false);
  });

  it('uses Keychain on native and migrates Preferences once', async () => {
    isNativePlatform.mockReturnValue(true);
    prefsStore.set('auth.session', '{"accessToken":"legacy","userId":9}');

    const { secureStorage, AUTH_SESSION_KEY } = await import('./secureStorage');
    const { SecureStorage } = await import('@aparajita/capacitor-secure-storage');

    const raw = await secureStorage.get(AUTH_SESSION_KEY);
    expect(raw).toBe('{"accessToken":"legacy","userId":9}');
    expect(secureStore.get(AUTH_SESSION_KEY)).toBe('{"accessToken":"legacy","userId":9}');
    expect(prefsStore.has(AUTH_SESSION_KEY)).toBe(false);
    expect(SecureStorage.setKeyPrefix).toHaveBeenCalled();
    expect(SecureStorage.setSynchronize).toHaveBeenCalledWith(false);

    await secureStorage.set(AUTH_SESSION_KEY, '{"accessToken":"new","userId":9}');
    expect(secureStore.get(AUTH_SESSION_KEY)).toBe('{"accessToken":"new","userId":9}');
    expect(prefsStore.has(AUTH_SESSION_KEY)).toBe(false);

    await secureStorage.remove(AUTH_SESSION_KEY);
    expect(secureStore.has(AUTH_SESSION_KEY)).toBe(false);
    expect(prefsStore.has(AUTH_SESSION_KEY)).toBe(false);
  });

  it('retries native configure after a failed first attempt', async () => {
    isNativePlatform.mockReturnValue(true);
    const { SecureStorage } = await import('@aparajita/capacitor-secure-storage');
    vi.mocked(SecureStorage.setKeyPrefix)
      .mockRejectedValueOnce(new Error('keychain unavailable'))
      .mockResolvedValue(undefined);

    const { secureStorage, AUTH_SESSION_KEY } = await import('./secureStorage');

    await expect(secureStorage.get(AUTH_SESSION_KEY)).rejects.toThrow('keychain unavailable');
    await expect(secureStorage.get(AUTH_SESSION_KEY)).resolves.toBeNull();
    expect(SecureStorage.setKeyPrefix).toHaveBeenCalledTimes(2);
  });
});
