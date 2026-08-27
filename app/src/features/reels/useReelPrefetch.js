/**
 * Warm upcoming reel media after DOM windowing.
 * ±2 slides attach a real player; this fetches first ~2s of +1…+N into HTTP cache.
 * Concurrency 1; skips Save-Data / 2G.
 */

import { useEffect, useRef } from 'react';

const PROGRESSIVE_WARM_RANGE = 'bytes=0-524287';

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
    (async () => {
      for (const reel of queue) {
        if (cancelled || controller.signal.aborted) return;
        try {
          await warmReelMedia(reel, controller.signal);
        } catch {
          // Prefetch is best-effort (CORS / abort).
        }
      }
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
