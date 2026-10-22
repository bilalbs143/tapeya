import { useLiveHubChannel } from '@/features/live';

/** Auth realtime subscriptions — mount once; RTK patches shared Home/live queries. */

export function RealtimeEffects() {
  useLiveHubChannel();
  return null;
}
