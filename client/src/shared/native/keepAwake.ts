import { KeepAwake } from '@capacitor-community/keep-awake';

import { isNativePlatform } from '@/shared/platform/platform';

/** Ref-counted wake lock — native KeepAwake / web Wake Lock. §11 */

let refs = 0;
let webWakeLock: WakeLockSentinel | null = null;

async function enableNative(): Promise<void> {
  try {
    await KeepAwake.keepAwake();
  } catch {
    /* plugin missing / denied */
  }
}

async function disableNative(): Promise<void> {
  try {
    await KeepAwake.allowSleep();
  } catch {
    /* ignore */
  }
}

async function enableWeb(): Promise<void> {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
  try {
    webWakeLock = await navigator.wakeLock.request('screen');
    webWakeLock.addEventListener('release', () => {
      webWakeLock = null;
    });
  } catch {
    webWakeLock = null;
  }
}

async function disableWeb(): Promise<void> {
  if (!webWakeLock) return;
  try {
    await webWakeLock.release();
  } catch {
    /* ignore */
  }
  webWakeLock = null;
}

export async function acquireKeepAwake(): Promise<void> {
  refs += 1;
  if (refs !== 1) return;
  if (isNativePlatform()) await enableNative();
  else await enableWeb();
}

export async function releaseKeepAwake(): Promise<void> {
  refs = Math.max(0, refs - 1);
  if (refs !== 0) return;
  if (isNativePlatform()) await disableNative();
  else await disableWeb();
}

/** Re-acquire after resume — web wake locks drop on background. */
export async function reapplyKeepAwake(): Promise<void> {
  if (refs <= 0) return;
  if (isNativePlatform()) await enableNative();
  else await enableWeb();
}

/** Test-only. */
export function __resetKeepAwakeForTests(): void {
  refs = 0;
  webWakeLock = null;
}
