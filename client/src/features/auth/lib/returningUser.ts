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
