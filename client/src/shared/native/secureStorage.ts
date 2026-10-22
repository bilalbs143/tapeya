import { KeychainAccess, SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Preferences } from '@capacitor/preferences';

import { isNativePlatform } from '@/shared/platform/platform';

/** Auth session JSON — Keychain/Keystore on native, Preferences on web. §8 */
export const AUTH_SESSION_KEY = 'auth.session';

/** Prefix for Keychain / encrypted SharedPreferences keys (plugin default is too generic). */
const NATIVE_KEY_PREFIX = 'tapeya_';

let nativeReady: Promise<void> | null = null;

/**
 * Configure Keychain once per process:
 * - no iCloud sync (tokens stay on-device)
 * - ThisDeviceOnly so encrypted backups don't migrate the item
 *
 * Failed configure clears the latch so a later call can retry.
 */
function ensureNativeConfigured(): Promise<void> {
  if (!nativeReady) {
    nativeReady = (async () => {
      await SecureStorage.setKeyPrefix(NATIVE_KEY_PREFIX);
      await SecureStorage.setSynchronize(false);
      await SecureStorage.setDefaultKeychainAccess(KeychainAccess.whenUnlockedThisDeviceOnly);
    })().catch((error: unknown) => {
      nativeReady = null;
      throw error;
    });
  }
  return nativeReady;
}

/** Drop plaintext Preferences leftovers after a successful Keychain write. */
async function clearPreferencesKey(key: string): Promise<void> {
  try {
    await Preferences.remove({ key });
  } catch {
    /* ignore */
  }
}

/**
 * One-shot Preferences → SecureStorage lift for a single key.
 * Safe to call on every get; no-ops when Keychain already has the value.
 * Preferences are only cleared after a successful Keychain write.
 */
async function migrateKeyFromPreferences(key: string): Promise<string | null> {
  const existing = await SecureStorage.getItem(key);
  if (existing != null) {
    await clearPreferencesKey(key);
    return existing;
  }

  const { value } = await Preferences.get({ key });
  if (value == null) return null;

  await SecureStorage.setItem(key, value);
  await clearPreferencesKey(key);
  return value;
}

/**
 * Durable string KV for auth tokens / saved profiles.
 * Native: Keychain (iOS) / Keystore-backed prefs (Android).
 * Web: Capacitor Preferences (localStorage) — plugin web impl is also plaintext.
 */
export const secureStorage = {
  async get(key: string): Promise<string | null> {
    if (!isNativePlatform()) {
      const { value } = await Preferences.get({ key });
      return value;
    }

    await ensureNativeConfigured();
    return migrateKeyFromPreferences(key);
  },

  async set(key: string, value: string): Promise<void> {
    if (!isNativePlatform()) {
      await Preferences.set({ key, value });
      return;
    }

    await ensureNativeConfigured();
    await SecureStorage.setItem(key, value);
    await clearPreferencesKey(key);
  },

  async remove(key: string): Promise<void> {
    if (!isNativePlatform()) {
      await Preferences.remove({ key });
      return;
    }

    await ensureNativeConfigured();
    try {
      await SecureStorage.removeItem(key);
    } catch {
      /* missing key / OS — still clear Preferences */
    }
    await clearPreferencesKey(key);
  },
};
