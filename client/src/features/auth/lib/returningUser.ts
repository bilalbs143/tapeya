import { APP_PATHS } from '@/shared/config/paths';

import { getProfiles } from './profiles';

const STORAGE_KEY = 'tapeya_returning_user';

/** Device has saved profiles or prior OTP — routes cold start to login vs register. */
export async function isReturningUser(): Promise<boolean> {
  const profiles = await getProfiles();
  if (profiles.length > 0) return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markReturningUser(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // private mode / quota
  }
}

/**
 * Sync cold-start target (flag only). Profiles without the flag are corrected
 * async by `guestAuthPath` — rare after `markReturningUser` on OTP.
 */
export function guestAuthPathSync(): string {
  try {
    if (localStorage.getItem(STORAGE_KEY) === '1') return APP_PATHS.login;
  } catch {
    // private mode
  }
  return APP_PATHS.register;
}

/** First install → register; returning device → login. */
export async function guestAuthPath(): Promise<string> {
  return (await isReturningUser()) ? APP_PATHS.login : APP_PATHS.register;
}
