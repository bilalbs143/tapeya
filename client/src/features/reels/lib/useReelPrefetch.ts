/** Prefetch posters + first bytes for upcoming reels (player window is separate). Concurrency 3; skips Save-Data / 2G. */

import { useEffect, useRef } from 'react';

import type { Reel } from '../model/schemas';
import { whenActiveReelAttachIdle } from './playback';

const PROGRESSIVE_WARM_RANGE = 'bytes=0-786431';
/** Keep low so upcoming warm does not contend with the active player on flaky CDN/QUIC. */
const PREFETCH_CONCURRENCY = 2;

type PrefetchReel = Pick<Reel, 'posterUrl' | 'videoUrl' | 'playback'>;

/** Network Information API is missing on Safari/iOS — treat as unknown. */
export function hasNetworkInformationApi(): boolean {
  return typeof navigator !== 'undefined' && 'connection' in navigator && navigator.connection != null;
}

export function prefersReducedData(): boolean {
  if (typeof navigator === 'undefined') return false;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (connection?.saveData) return true;
  const effectiveType = connection?.effectiveType;
  return effectiveType === 'slow-2g' || effectiveType === '2g';
}

/** How many upcoming reels to byte-warm (0 / 2 / 4 / 6). */
export function getReelPrefetchDepth(): number {
  if (prefersReducedData()) return 0;
  // iOS / Safari — no Network Information API. Keep light so first play + video warm win.
  if (!hasNetworkInformationApi()) return 2;
  const connection = (
    navigator as Navigator & {
      connection?: { effectiveType?: string };
    }
  ).connection;
  return connection?.effectiveType === '3g' ? 4 : 6;
}

export function isHlsPrefetchUrl(url: string | null | undefined): boolean {
  if (typeof url !== 'string' || !url) return false;
  const path = url.split('?')[0]?.toLowerCase() ?? '';
  return path.endsWith('.m3u8') || path.includes('/hls/');
}

export function firstM3u8Uri(playlist: string, baseUrl: string): string | null {
  if (typeof playlist !== 'string' || !playlist) return null;
  for (const raw of playlist.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    try {
      return new URL(line, baseUrl).href;
    } catch {
      return null;
    }
  }
  return null;
}

export function pickPrefetchTarget(reel: PrefetchReel | null | undefined): string | null {
  if (!reel) return null;
  const candidates = [reel.playback?.hlsUrl, reel.playback?.url, reel.videoUrl];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate) return candidate;
  }
  return null;
}

/** Decode upcoming poster into browser image cache. */
export function warmPoster(url: string | null | undefined, signal: AbortSignal): Promise<void> {
  if (typeof url !== 'string' || !url) return Promise.resolve();
  if (typeof Image === 'undefined') return Promise.resolve();

  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    const img = new Image();
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', onAbort);
      img.onload = null;
      img.onerror = null;
      resolve();
    };
    const onAbort = () => {
      try {
        img.src = '';
      } catch {
        // Ignore.
      }
      done();
    };

    signal.addEventListener('abort', onAbort, { once: true });
    img.decoding = 'async';
    img.onload = done;
    img.onerror = done;
    img.src = url;
  });
}

/**
 * Pull first playable media bytes into the browser cache.
 * HLS is intentionally skipped — playlists use cache:'no-store' (gzip/Range clash with
 * hls.js) so a prefetch cannot warm the player and only races CDN/QUIC with attach.
 */
export async function warmReelMedia(reel: PrefetchReel, signal: AbortSignal): Promise<void> {
  const target = pickPrefetchTarget(reel);
  if (!target) return;
  if (isHlsPrefetchUrl(target)) return;

  await fetch(target, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    signal,
    headers: { Range: PROGRESSIVE_WARM_RANGE },
  });
}

export async function warmReel(reel: PrefetchReel, signal: AbortSignal): Promise<void> {
  await Promise.all([warmPoster(reel.posterUrl, signal), warmReelMedia(reel, signal)]);
}

export async function runPrefetchPool<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  concurrency: number,
  signal: AbortSignal
): Promise<void> {
  const queue = items.slice();
  const size = Math.max(1, Math.min(concurrency, queue.length || 1));

  await Promise.all(
    Array.from({ length: size }, async () => {
      while (queue.length > 0 && !signal.aborted) {
        const item = queue.shift();
        if (item == null) return;
        try {
          await worker(item);
        } catch {
          // Prefetch is best-effort (CORS / abort).
        }
      }
    })
  );
}

/**
 * Prefetch order: active first (cold-start TTFF), then +1…depth so the next snap stays hot.
 * Depth 0 (Save-Data / 2G) still returns the active reel alone when present.
 */
export function buildReelPrefetchQueue(reels: PrefetchReel[], activeIndex: number, depth: number): PrefetchReel[] {
  const queue: PrefetchReel[] = [];
  const active = reels[activeIndex];
  if (active) queue.push(active);
  for (let offset = 1; offset <= depth; offset += 1) {
    const reel = reels[activeIndex + offset];
    if (reel) queue.push(reel);
  }
  return queue;
}

/** Warm the active reel first (solo), then pool upcoming slides so cold-start TTFF wins. */
export function useReelPrefetch(reels: PrefetchReel[], activeIndex: number): void {
  const inflightRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!Array.isArray(reels) || reels.length === 0) return undefined;

    const depth = getReelPrefetchDepth();
    const queue = buildReelPrefetchQueue(reels, activeIndex, depth);
    if (queue.length === 0) return undefined;

    inflightRef.current?.abort();
    const controller = new AbortController();
    inflightRef.current = controller;

    let cancelled = false;
    void (async () => {
      const [activeReel, ...upcoming] = queue;
      const warmOne = async (reel: PrefetchReel) => {
        if (cancelled || controller.signal.aborted) return;
        try {
          await warmReel(reel, controller.signal);
        } catch {
          // Prefetch is best-effort (CORS / abort).
        }
      };

      // Active first (poster + progressive bytes; HLS media warm is a no-op).
      if (activeReel) await warmOne(activeReel);
      if (cancelled || controller.signal.aborted || upcoming.length === 0) return;

      // Hold upcoming byte-warm until the active video attach has data.
      await new Promise<void>((resolve) => {
        const cancelIdle = whenActiveReelAttachIdle(() => resolve());
        const onAbort = () => {
          cancelIdle();
          resolve();
        };
        if (controller.signal.aborted) {
          onAbort();
          return;
        }
        controller.signal.addEventListener('abort', onAbort, { once: true });
      });
      if (cancelled || controller.signal.aborted) return;

      await runPrefetchPool(upcoming, warmOne, PREFETCH_CONCURRENCY, controller.signal);
    })();

    return () => {
      cancelled = true;
      controller.abort();
      if (inflightRef.current === controller) {
        inflightRef.current = null;
      }
    };
  }, [reels, activeIndex]);
}
