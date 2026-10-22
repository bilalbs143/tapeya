import type { UnknownAction } from '@reduxjs/toolkit';

import { AUTH_SESSION_KEY, secureStorage } from '@/shared/native/secureStorage';

import { type AuthCredentials, clearCredentials, markAuthHydrated, setCredentials } from './authSlice';

type AuthDispatch = (action: UnknownAction) => unknown;

/** Legacy `app/` redux-persist key (localStorage). */
const LEGACY_PERSIST_KEY = 'persist:root';

/** §8 session persist — secureStorage durable, Redux in-memory; explicit dispatch avoids store↔baseApi cycle. */
export async function persistAuthSession(dispatch: AuthDispatch, credentials: AuthCredentials): Promise<void> {
  await secureStorage.set(AUTH_SESSION_KEY, JSON.stringify(credentials));
  dispatch(setCredentials(credentials));
}

export async function clearAuthSession(dispatch: AuthDispatch): Promise<void> {
  await secureStorage.remove(AUTH_SESSION_KEY);
  dispatch(clearCredentials());
}

/** One-shot legacy `persist:root` auth lift for app cutover. */
export function readLegacyAuthSession(): AuthCredentials | null {
  try {
    const raw = window.localStorage.getItem(LEGACY_PERSIST_KEY);
    if (!raw) return null;

    const root = JSON.parse(raw) as { auth?: unknown };
    const authRaw = root.auth;
    const auth = typeof authRaw === 'string' ? (JSON.parse(authRaw) as unknown) : authRaw;
    if (!auth || typeof auth !== 'object') return null;

    const accessToken = (auth as { accessToken?: unknown }).accessToken;
    const userId = (auth as { user?: { id?: unknown } }).user?.id;
    if (typeof accessToken !== 'string' || !accessToken.trim()) return null;
    if (typeof userId !== 'number' || !Number.isFinite(userId) || userId <= 0) return null;

    return { accessToken, userId };
  } catch {
    return null;
  }
}

function clearLegacyPersistRoot(): void {
  try {
    window.localStorage.removeItem(LEGACY_PERSIST_KEY);
  } catch {
    /* ignore */
  }
}

export async function hydrateAuthSession(dispatch: AuthDispatch): Promise<void> {
  try {
    let raw = await secureStorage.get(AUTH_SESSION_KEY);

    // Cutover: no secure session yet → lift token from old app localStorage once.
    if (!raw) {
      const legacy = readLegacyAuthSession();
      if (legacy) {
        raw = JSON.stringify(legacy);
        await secureStorage.set(AUTH_SESSION_KEY, raw);
        clearLegacyPersistRoot();
      }
    }

    if (!raw) {
      dispatch(clearCredentials());
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<AuthCredentials>;
      if (typeof parsed.accessToken === 'string' && typeof parsed.userId === 'number') {
        dispatch(setCredentials({ accessToken: parsed.accessToken, userId: parsed.userId }));
        return;
      }
    } catch {
      // Corrupt payload — drop it.
    }

    await secureStorage.remove(AUTH_SESSION_KEY);
    dispatch(clearCredentials());
  } catch {
    // Storage threw — still mark hydrated so RequireAuth doesn't hang.
    dispatch(markAuthHydrated());
  }
}
