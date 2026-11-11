import { Capacitor } from '@capacitor/core';

/**
 * Route analytics:
 * - Web → GA4 gtag `page_view` (loads gtag on first call)
 * - Native → Firebase Analytics `screen_view`
 */
export async function logScreenView(path: string, title?: string): Promise<void> {
  const screenName = path || '/';

  if (Capacitor.isNativePlatform()) {
    try {
      const { FirebaseAnalytics } = await import('@capacitor-firebase/analytics');
      await FirebaseAnalytics.setCurrentScreen({
        screenName,
        ...(title ? { screenClassOverride: title } : {}),
      });
    } catch {
      // Plugin missing / Firebase not configured on this shell.
    }
    return;
  }

  const { logPageView } = await import('./google');
  await logPageView(screenName, title);
}
