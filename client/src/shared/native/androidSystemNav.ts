import { SystemBars, SystemBarType } from '@capacitor/core';

import { getPlatform } from '@/shared/platform/platform';

/**
 * Android OS navigation bar (3-button / gesture strip) — hide app-wide.
 * Status bar stays visible. iOS / web: no-op.
 *
 * Android may briefly re-show the bar after swipe or resume; call
 * {@link reapplyAndroidSystemNavHidden} from `appStateChange` when active.
 * Native MainActivity sets transient-by-swipe so reveal auto-dismisses.
 */

function isAndroidNative(): boolean {
  return getPlatform() === 'android';
}

async function hideNavigationBar(): Promise<void> {
  if (!isAndroidNative()) return;
  try {
    await SystemBars.hide({ bar: SystemBarType.NavigationBar });
  } catch {
    /* plugin / WebView timing */
  }
}

/** Boot — hide once after the bridge is up. */
export async function startAndroidSystemNavHidden(): Promise<void> {
  await hideNavigationBar();
}

/** Re-apply after resume / focus (OS often restores the bar). */
export async function reapplyAndroidSystemNavHidden(): Promise<void> {
  await hideNavigationBar();
}
