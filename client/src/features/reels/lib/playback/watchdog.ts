import { ACTIVE_ATTACH_WATCHDOG_MS, MAX_ATTACH_RETRIES } from './attachContract';
import type { ReelAttachRole } from './types';

type ArmWatchdogOptions = {
  role: ReelAttachRole;
  attempt: number;
  cancelled: () => boolean;
  isReady: () => boolean;
  onRetry: () => void;
  onError: () => void;
  onTimeout?: (() => void) | undefined;
};

/** Active-only attach watchdog — retries then fails. */
export function armActiveAttachWatchdog(options: ArmWatchdogOptions): () => void {
  const { role, attempt, cancelled, isReady, onRetry, onError, onTimeout } = options;
  if (role !== 'active') return () => {};

  const timer = window.setTimeout(() => {
    if (cancelled() || isReady()) return;
    onTimeout?.();
    if (attempt >= MAX_ATTACH_RETRIES) {
      onError();
      return;
    }
    onRetry();
  }, ACTIVE_ATTACH_WATCHDOG_MS);

  return () => window.clearTimeout(timer);
}
