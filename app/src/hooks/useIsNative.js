import { usePlatform } from './usePlatform';

/**
 * Hook to check if running in native app (iOS/Android)
 */
export function useIsNative() {
  const platform = usePlatform();
  return platform === 'ios' || platform === 'android';
}
