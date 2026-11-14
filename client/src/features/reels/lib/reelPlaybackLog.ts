/**
 * Timed reel playback diagnostics.
 *
 * Enabled when:
 * - Vite DEV, or
 * - `localStorage.tapeya_reel_debug = '1'` (then reload)
 *
 * Filter console for `[reel]`. Open full-screen `/reels`
 * (home ReelBand is posters only — no HLS attach there).
 */

import { Capacitor } from '@capacitor/core';

const FLAG = 'tapeya_reel_debug';
const startedAt = typeof performance !== 'undefined' ? performance.now() : 0;
const marks = new Map<string, number>();
let announced = false;

function enabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(FLAG) === '1';
  } catch {
    return false;
  }
}

function msSinceStart(): number {
  return Math.round((typeof performance !== 'undefined' ? performance.now() : 0) - startedAt);
}

function shortUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const path = u.pathname.split('/').filter(Boolean).slice(-2).join('/');
    return `${path}${u.search ? '?…' : ''}`;
  } catch {
    return url.slice(-48);
  }
}

function announceOnce(): void {
  if (announced || !enabled()) return;
  announced = true;

  console.log('[reel] debug ON — open /reels and watch attach → play', {
    t: `+${msSinceStart()}ms`,
    platform: Capacitor.getPlatform?.() ?? 'unknown',
    dev: import.meta.env.DEV,
  });
}

/** Call when the full-screen reels route mounts so Safari shows a ping before play. */
export function reelDebugPing(reason = 'reels-mount'): void {
  if (!enabled()) return;
  announceOnce();

  console.log('[reel] ping', { t: `+${msSinceStart()}ms`, reason });
}

export function reelMark(key: string): void {
  if (!enabled()) return;
  announceOnce();
  marks.set(key, performance.now());
}

export function reelSince(key: string): number | null {
  const t = marks.get(key);
  if (t == null) return null;
  return Math.round(performance.now() - t);
}

/** Console timeline for first-play / stall investigation. */
export function reelLog(phase: string, detail?: Record<string, unknown>): void {
  if (!enabled()) return;
  announceOnce();
  const payload: Record<string, unknown> = {
    t: `+${msSinceStart()}ms`,
    ...detail,
  };
  if (typeof detail?.url === 'string') {
    payload.url = shortUrl(detail.url);
  }

  console.log(`[reel] ${phase}`, payload);
}
