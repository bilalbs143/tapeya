import { ScreenOrientation } from '@capacitor/screen-orientation';

import { isNative } from '@/platform/platform';

/**
 * Thin, defensive wrapper around `@capacitor/screen-orientation`.
 *
 * Same no-op-on-web contract as `tapeyaBroadcast.js`: never throws on web (or when the
 * native plugin is unavailable), so callers can lock/unlock unconditionally and rely on the
 * boolean result to decide whether to fall back to a CSS/coach-mark experience.
 */

/**
 * @param {'portrait'|'landscape'} orientation
 * @returns {Promise<boolean>} true when the device was actually locked natively.
 */
export async function lockScreenOrientation(orientation) {
  if (!isNative()) {
    return false;
  }
  const target = orientation === 'landscape' ? 'landscape' : 'portrait';
  try {
    await ScreenOrientation.lock({ orientation: target });
    return true;
  } catch {
    return false;
  }
}

/**
 * Release any programmatic lock so the app returns to its default posture.
 * @returns {Promise<boolean>} true when the unlock call succeeded natively.
 */
export async function unlockScreenOrientation() {
  if (!isNative()) {
    return false;
  }
  try {
    await ScreenOrientation.unlock();
    return true;
  } catch {
    return false;
  }
}
