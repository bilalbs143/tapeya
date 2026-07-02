import { usePlatformTracking } from '@/hooks/usePlatformTracking';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/** Push + platform sync — consumer app only (not overlay). */
export function ConsumerRouterEffects() {
  usePushNotifications();
  usePlatformTracking();
  return null;
}
