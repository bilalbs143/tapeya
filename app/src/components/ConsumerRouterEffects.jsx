import { useBroadcastDeepLink } from '@/hooks/useBroadcastDeepLink';
import { useLiveHubChannel } from '@/hooks/useLiveHubChannel';
import { usePlatformTracking } from '@/hooks/usePlatformTracking';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/** Push + platform sync — consumer app only (not overlay). */
export function ConsumerRouterEffects() {
  usePushNotifications();
  usePlatformTracking();
  useBroadcastDeepLink();
  useLiveHubChannel();
  return null;
}
