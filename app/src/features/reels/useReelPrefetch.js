/**
 * Warm upcoming reel media after DOM windowing.
 * Forward slides attach a real player; this also pulls first bytes + posters
 * into HTTP / image cache so snap feels instant.
 *
 * Concurrency 2 (prioritises +1); skips Save-Data / 2G.
 */

import { useEffect, useRef } from 'react';

const PROGRESSIVE_WARM_RANGE = 'bytes=0-786431';
const PREFETCH_CONCURRENCY = 2;

/** Network Information API is missing on Safari/iOS — treat as unknown. */
export function hasNetworkInformationApi() {
  return typeof navigator !== 'undefined' && 'connection' in navigator && navigator.connection != null;
}

export function prefersReducedData() {
  if (typeof navigator === 'undefined') return false;
  if (navigator.connection?.saveData) return true;
  const effectiveType = navigator.connection?.effectiveType;
  return effectiveType === 'slow-2g' || effectiveType === '2g';
}

/** @returns {number} how many upcoming reels to byte-warm (0 / 3 / 5) */
export function getReelPrefetchDepth() {
  if (prefersReducedData()) return 0;
  if (!hasNetworkInformationApi()) return 5;
  return navigator.connection?.effectiveType === '3g' ? 3 : 5;
}

export function isHlsPrefetchUrl(url) {
  if (typeof url !== 'string' || !url) return false;
  const path = url.split('?')[0].toLowerCase();
  return path.endsWith('.m3u8') || path.includes('/hls/');
}

/**
 * @param {string} playlist
 * @param {string} baseUrl
 * @returns {string|null}
 */
export function firstM3u8Uri(playlist, baseUrl) {
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

/**
 * @param {{ playback?: { hlsUrl?: string|null, url?: string|null, type?: string|null }, posterUrl?: string|null, videoUrl?: string|null }} reel
 * @returns {string|null}
 */
export function pickPrefetchTarget(reel) {
  if (!reel) return null;
  const candidates = [reel.playback?.hlsUrl, reel.playback?.url, reel.videoUrl];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate) return candidate;
  }
  return null;
}

/**
 * @param {string} url
 * @param {AbortSignal} signal
 */
async function fetchText(url, signal) {
  const res = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit', signal });
  if (!res.ok) throw new Error('prefetch');
  return res.text();
}

/**
 * Decode upcoming poster into browser image cache (cheap; paints instantly on snap).
 *
 * @param {string|null|undefined} url
 * @param {AbortSignal} signal
 */
export function warmPoster(url, signal) {
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
 * Pull first playable media bytes into the browser cache (HLS first segment or MP4 range).
 *
 * @param {{ playback?: { hlsUrl?: string|null, url?: string|null }, videoUrl?: string|null }} reel
 * @param {AbortSignal} signal
 */
export async function warmReelMedia(reel, signal) {
  const target = pickPrefetchTarget(reel);
  if (!target) return;

  if (isHlsPrefetchUrl(target)) {
    const master = await fetchText(target, signal);
    const next = firstM3u8Uri(master, target);
    if (!next) return;
    if (isHlsPrefetchUrl(next)) {
      const variant = await fetchText(next, signal);
      const segment = firstM3u8Uri(variant, next);
      if (segment) {
        await fetch(segment, { method: 'GET', mode: 'cors', credentials: 'omit', signal });
      }
      return;
    }
    await fetch(next, { method: 'GET', mode: 'cors', credentials: 'omit', signal });
    return;
  }

  await fetch(target, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    signal,
    headers: { Range: PROGRESSIVE_WARM_RANGE },
  });
}

/**
 * Warm poster + first media bytes for one upcoming reel.
 *
 * @param {{ playback?: object, posterUrl?: string|null, videoUrl?: string|null }} reel
 * @param {AbortSignal} signal
 */
export async function warmReel(reel, signal) {
  await Promise.all([warmPoster(reel?.posterUrl, signal), warmReelMedia(reel, signal)]);
}

/**
 * @template T
 * @param {T[]} items
 * @param {(item: T) => Promise<void>} worker
 * @param {number} concurrency
 * @param {AbortSignal} signal
 */
export async function runPrefetchPool(items, worker, concurrency, signal) {
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
    }),
  );
}

/**
 * @param {Array<{ playback?: { hlsUrl?: string|null, url?: string|null, type?: string|null }, posterUrl?: string|null, videoUrl?: string|null }>} reels
 * @param {number} activeIndex
 */
export function useReelPrefetch(reels, activeIndex) {
  const inflightRef = useRef(null);

  useEffect(() => {
    if (!Array.isArray(reels) || reels.length === 0) return undefined;

    const depth = getReelPrefetchDepth();
    if (depth < 1) return undefined;

    inflightRef.current?.abort();
    const controller = new AbortController();
    inflightRef.current = controller;

    const queue = [];
    for (let offset = 1; offset <= depth; offset += 1) {
      const reel = reels[activeIndex + offset];
      if (reel) queue.push(reel);
    }
    if (queue.length === 0) return undefined;

    let cancelled = false;
    void runPrefetchPool(
      queue,
      async (reel) => {
        if (cancelled || controller.signal.aborted) return;
        await warmReel(reel, controller.signal);
      },
      PREFETCH_CONCURRENCY,
      controller.signal,
    );

    return () => {
      cancelled = true;
      controller.abort();
      if (inflightRef.current === controller) {
        inflightRef.current = null;
      }
    };
  }, [reels, activeIndex]);
}
