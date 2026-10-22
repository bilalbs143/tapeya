import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'ios' | 'android';

/** Web vs native — features use this instead of `@capacitor/core`. §11 */
export function getPlatform(): Platform {
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android' ? platform : 'web';
}

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}
