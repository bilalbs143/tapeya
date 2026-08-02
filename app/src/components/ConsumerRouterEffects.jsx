import { useAppDeepLink } from '@/hooks/useAppDeepLink';
import { useLiveHubChannel } from '@/hooks/useLiveHubChannel';
import { usePlatformTracking } from '@/hooks/usePlatformTracking';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/** Push + platform sync — consumer app only (not overlay). */
export function ConsumerRouterEffects() {
  usePushNotifications();
  usePlatformTracking();
  useAppDeepLink();
  useLiveHubChannel();
  return null;
}
