import { useOrientationLock } from '@/shared/native/useOrientationLock';

/** Lock orientation to the broadcast while mounted; pop on leave. */
export function useBroadcastOrientationLock({
  orientation,
  enabled = true,
}: {
  orientation: 'portrait' | 'landscape' | null | undefined;
  enabled?: boolean | undefined;
}): boolean {
  return useOrientationLock(orientation ?? null, enabled);
}
