/**
 * Warm the next reel's media after DOM windowing.
 * Concurrency 1; skips when Save-Data / low bandwidth is preferred.
 * Uses a small Range request so HLS playlists are warmed without pulling segments.
 */

import { useEffect, useRef } from 'react';

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

/**
 * Choose a lightweight warm URL for the next reel (HLS master, else poster).
 *
 * @param {{ playback?: { hlsUrl?: string|null, url?: string|null, type?: string|null }, posterUrl?: string|null, videoUrl?: string|null }} next
 * @param {{ hasConnectionApi?: boolean }} [opts]
 */
export function pickPrefetchTarget(next, _opts = {}) {
  if (!next) return null;

  const candidates = [next.playback?.hlsUrl, next.playback?.url, next.videoUrl];
  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate) continue;
    const path = candidate.split('?')[0].toLowerCase();
    if (path.endsWith('.m3u8') || path.includes('/hls/')) {
      return candidate;
    }
  }

  return next.posterUrl || null;
}

/**
 * @param {Array<{ playback?: { hlsUrl?: string|null, url?: string|null, type?: string|null }, posterUrl?: string|null, videoUrl?: string|null }>} reels
 * @param {number} activeIndex
 */
export function useReelPrefetch(reels, activeIndex) {
  const inflightRef = useRef(null);

  useEffect(() => {
    if (!Array.isArray(reels) || reels.length === 0) return undefined;
    if (prefersReducedData()) return undefined;

    const next = reels[activeIndex + 1];
    const target = pickPrefetchTarget(next);
    if (!target || typeof target !== 'string') return undefined;

    if (inflightRef.current) {
      inflightRef.current.abort();
      inflightRef.current = null;
    }

    const controller = new AbortController();
    inflightRef.current = controller;

    // Lightweight warm: first ~2KB of the HLS master only.
    fetch(target, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal,
      headers: { Range: 'bytes=0-2047' },
    }).catch(() => {
      // Prefetch is best-effort (CORS / Range may fail on some origins).
    });

    return () => {
      controller.abort();
      if (inflightRef.current === controller) {
        inflightRef.current = null;
      }
    };
  }, [reels, activeIndex]);
}
