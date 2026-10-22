import { secureStorage } from '@/shared/native/secureStorage';

const PROFILES_KEY = 'tapeya:profiles';

export type SavedProfile = {
  id: number;
  name: string;
  nickname: string | null;
  phone: string;
  avatarUrl: string | null;
  /** Null after a 401 — row stays so the user can re-OTP without retyping. */
  token: string | null;
};

let memoryCache: SavedProfile[] | null = null;
let migrateOnce: Promise<void> | null = null;

function parseList(raw: string | null): SavedProfile[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as SavedProfile[]) : [];
  } catch {
    return [];
  }
}

/** One-shot: lift early client localStorage blob into secureStorage, then clear it. */
function ensureMigrated(): Promise<void> {
  if (!migrateOnce) {
    migrateOnce = (async () => {
      const existing = await secureStorage.get(PROFILES_KEY);
      if (existing != null) return;

      let fromLocalStorage: string | null = null;
      try {
        fromLocalStorage = window.localStorage.getItem(PROFILES_KEY);
      } catch {
        fromLocalStorage = null;
      }
      if (!fromLocalStorage) return;

      await secureStorage.set(PROFILES_KEY, fromLocalStorage);
      try {
        window.localStorage.removeItem(PROFILES_KEY);
      } catch {
        /* ignore */
      }
    })();
  }
  return migrateOnce;
}

async function readProfiles(): Promise<SavedProfile[]> {
  await ensureMigrated();
  if (memoryCache) return memoryCache;
  const raw = await secureStorage.get(PROFILES_KEY);
  memoryCache = parseList(raw);
  return memoryCache;
}

async function writeProfiles(list: SavedProfile[]): Promise<SavedProfile[]> {
  memoryCache = list;
  await secureStorage.set(PROFILES_KEY, JSON.stringify(list));
  return list;
}

/** Newest-first saved accounts for silent re-auth / OTP shortcut. No max count. */
export async function getProfiles(): Promise<SavedProfile[]> {
  return readProfiles();
}

/** Newest successful login moves to the top; same phone updates in place. */
export async function saveProfile(profile: SavedProfile): Promise<SavedProfile[]> {
  const current = await readProfiles();
  return writeProfiles([profile, ...current.filter((p) => p.phone !== profile.phone)]);
}

export async function removeProfile(phone: string): Promise<SavedProfile[]> {
  const current = await readProfiles();
  return writeProfiles(current.filter((p) => p.phone !== phone));
}

/** A 401 costs the token, not the identity. */
export async function clearProfileToken(phone: string): Promise<SavedProfile[]> {
  const current = await readProfiles();
  return writeProfiles(current.map((p) => (p.phone === phone ? { ...p, token: null } : p)));
}
