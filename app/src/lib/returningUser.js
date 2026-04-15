import { getSavedProfiles } from '@/lib/savedProfiles';

const STORAGE_KEY = 'tapeya_returning_user';

/**
 * True if this device has been used with an account before (saved login cards,
 * or a prior successful OTP / re-login). Splash: first install → register,
 * otherwise → login.
 */
export function isReturningUser() {
  if (getSavedProfiles().length > 0) return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markReturningUser() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // private mode / quota
  }
}
