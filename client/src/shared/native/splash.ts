import { Capacitor } from '@capacitor/core';

import { hideNativeSplashBrand } from '@/shared/native/appearance';

/** Native splash façade (§11) — hide after auth hydrate. */
export async function hideNativeSplash(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 0 });
  } catch {
    /* optional */
  }

  await hideNativeSplashBrand();
}
