import { appendStreamDebugLine } from '@/lib/utils/streamDebugStore';

/** Enable verbose stream logs: localStorage.setItem('tapeya_stream_debug', '1') */
export function isStreamDebugEnabled() {
  if (import.meta.env.DEV) {
    return true;
  }
  try {
    return typeof window !== 'undefined' && window.localStorage?.getItem('tapeya_stream_debug') === '1';
  } catch {
    return false;
  }
}

/**
 * @param {string} scope
 * @param {unknown} [payload]
 */
export function streamDebugLog(scope, payload) {
  if (!isStreamDebugEnabled()) {
    return;
  }

  appendStreamDebugLine(scope, payload);

  if (payload !== undefined) {
    console.info(`[TapeyaStream:${scope}]`, payload);
  } else {
    console.info(`[TapeyaStream:${scope}]`);
  }
}
