import { Capacitor } from '@capacitor/core';

/** Native splash façade (§11) — hide after auth hydrate. */
const launchedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
const MIN_VISIBLE_MS = 1200;

export async function hideNativeSplash(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - launchedAt;
  const waitMs = Math.max(0, MIN_VISIBLE_MS - elapsed);
  if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs));

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch {
    /* optional */
  }
}
