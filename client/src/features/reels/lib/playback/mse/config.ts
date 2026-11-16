import type { HlsConfig } from 'hls.js';

import type { ReelAttachRole } from '../types';

const HLS_ACTIVE_BUFFER = { maxBufferLength: 12, maxMaxBufferLength: 20 };
const HLS_NEXT_BUFFER = { maxBufferLength: 10, maxMaxBufferLength: 16 };

/** hls.js buffer caps — used by Android + web MSE stacks only. */
export function hlsBufferForRole(role: ReelAttachRole): {
  maxBufferLength: number;
  maxMaxBufferLength: number;
} {
  return role === 'active' ? HLS_ACTIVE_BUFFER : HLS_NEXT_BUFFER;
}

/**
 * Stronger retries for flaky CDN / QUIC resets — first-play path unchanged.
 * Defaults only retry manifest errors once; bump so transient resets self-heal.
 */
export function hlsNetworkRetryConfig(): Pick<
  HlsConfig,
  'manifestLoadPolicy' | 'playlistLoadPolicy' | 'fragLoadPolicy'
> {
  return {
    manifestLoadPolicy: {
      default: {
        maxTimeToFirstByteMs: Infinity,
        maxLoadTimeMs: 20_000,
        timeoutRetry: { maxNumRetry: 3, retryDelayMs: 0, maxRetryDelayMs: 0 },
        errorRetry: { maxNumRetry: 4, retryDelayMs: 500, maxRetryDelayMs: 4_000 },
      },
    },
    playlistLoadPolicy: {
      default: {
        maxTimeToFirstByteMs: 10_000,
        maxLoadTimeMs: 20_000,
        timeoutRetry: { maxNumRetry: 3, retryDelayMs: 0, maxRetryDelayMs: 0 },
        errorRetry: { maxNumRetry: 4, retryDelayMs: 500, maxRetryDelayMs: 4_000 },
      },
    },
    fragLoadPolicy: {
      default: {
        maxTimeToFirstByteMs: 10_000,
        maxLoadTimeMs: 120_000,
        timeoutRetry: { maxNumRetry: 4, retryDelayMs: 0, maxRetryDelayMs: 0 },
        errorRetry: { maxNumRetry: 6, retryDelayMs: 500, maxRetryDelayMs: 4_000 },
      },
    },
  };
}
