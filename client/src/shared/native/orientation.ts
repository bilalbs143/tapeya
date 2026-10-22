import { ScreenOrientation } from '@capacitor/screen-orientation';

import { isNativePlatform } from '@/shared/platform/platform';

/** Screen orientation façade — no-op on web. §11 */
export type OrientationLock = 'portrait' | 'landscape' | 'any';

/** `any` unlocks for tilt-to-rotate; returns true when native lock succeeded. */
export async function lockOrientation(lock: OrientationLock): Promise<boolean> {
  if (!isNativePlatform()) return false;
  if (lock === 'any') {
    return unlockOrientation();
  }
  const target = lock === 'landscape' ? 'landscape' : 'portrait';
  try {
    await ScreenOrientation.lock({ orientation: target });
    return true;
  } catch {
    return false;
  }
}

/** @deprecated Prefer `lockOrientation` — kept for callers that ignore the boolean. */
export async function lockScreenOrientation(orientation: 'portrait' | 'landscape'): Promise<boolean> {
  return lockOrientation(orientation);
}

export async function unlockOrientation(): Promise<boolean> {
  if (!isNativePlatform()) return false;
  try {
    await ScreenOrientation.unlock();
    return true;
  } catch {
    return false;
  }
}

/** @deprecated Prefer `unlockOrientation`. */
export async function unlockScreenOrientation(): Promise<boolean> {
  return unlockOrientation();
}

export function readDeviceLandscape(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia === 'function' && window.matchMedia('(orientation: landscape)').matches) {
    return true;
  }
  return window.innerWidth > window.innerHeight;
}
