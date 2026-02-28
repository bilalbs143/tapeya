const STORAGE_KEY = 'tapeya_saved_profiles';
const MAX_PROFILES = 5;

/**
 * Saved profile with optional token for instant re-login (no OTP).
 * @typedef {{ id: number; name: string; nickname?: string; phone: string; email?: string; accessToken?: string }} SavedProfile
 */

/**
 * @returns {SavedProfile[]}
 */
export function getSavedProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed?.profiles) ? parsed.profiles : [];
    return list.slice(0, MAX_PROFILES);
  } catch {
    return [];
  }
}

/**
 * Add or update a profile. Same phone updates existing and moves to top.
 * Stores accessToken for instant re-login without OTP.
 * @param {SavedProfile & { accessToken?: string }} profile
 */
export function addSavedProfile(profile) {
  if (!profile?.phone) return;
  const list = getSavedProfiles();
  const normalized = {
    id: profile.id,
    name: profile.name ?? 'User',
    nickname: profile.nickname ?? null,
    phone: profile.phone,
    email: profile.email ?? null,
    accessToken: profile.accessToken ?? null,
  };
  const filtered = list.filter((p) => p.phone !== normalized.phone);
  const updated = [normalized, ...filtered].slice(0, MAX_PROFILES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profiles: updated }));
  } catch {
    // quota exceeded or disabled
  }
}

/**
 * Remove stored token from a profile (e.g. when token expired/invalid).
 * @param {string} phone
 */
export function clearProfileToken(phone) {
  if (!phone) return;
  const list = getSavedProfiles();
  const updated = list.map((p) =>
    p.phone === phone ? { ...p, accessToken: null } : p,
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profiles: updated }));
  } catch {}
}

/**
 * Move profile with this phone to top (e.g. after successful login).
 * @param {string} phone
 */
export function bumpSavedProfile(phone) {
  if (!phone) return;
  const list = getSavedProfiles();
  const idx = list.findIndex((p) => p.phone === phone);
  if (idx <= 0) return;
  const [item] = list.splice(idx, 1);
  const updated = [item, ...list];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profiles: updated }));
  } catch {}
}

/**
 * Remove a profile from saved list (e.g. "Remove account" action).
 * @param {string} phone
 */
export function removeSavedProfile(phone) {
  if (!phone) return;
  const list = getSavedProfiles().filter((p) => p.phone !== phone);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profiles: list }));
  } catch {}
}
