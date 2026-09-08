import { useEffect, useState } from 'react';

/** Opening look — solid early crowd, not an empty room. */
const START_MIN = 180;
const START_MAX = 420;
const FLOOR = 120;

/** Per-stream ceiling (deterministic from stream id). */
const CEILING_MIN = 2_200;
const CEILING_MAX = 3_800;

const WOBBLE_MIN = 14;
const WOBBLE_MAX = 52;

/** Shared tick so every client refreshes the same bucket together. */
const TICK_MS = 4_000;

/** Rough viewer growth per minute of stream time (before wobble). */
const GROWTH_PER_MINUTE = 130;

function hash32(input) {
  let h = 2166136261;
  const s = String(input ?? '');
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic [0, 1) from seed + salt. */
function unit(seed, salt) {
  let x = (seed ^ Math.imul(salt | 0, 0x9e3779b9)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  x = (x ^ (x >>> 16)) >>> 0;
  return x / 0x100000000;
}

function intIn(seed, salt, min, max) {
  return min + Math.floor(unit(seed, salt) * (max - min + 1));
}

/**
 * Shared vanity base for a stream. Same streamId + startedAt + wall-clock tick
 * → same number on every device.
 *
 * @param {string|number|null|undefined} streamId
 * @param {number|null|undefined} startedAtMs
 * @param {number} [nowMs]
 */
export function computeVanityBase(streamId, startedAtMs, nowMs = Date.now()) {
  const seed = hash32(streamId);
  const startBase = intIn(seed, 1, START_MIN, START_MAX);
  const ceiling = intIn(seed, 2, CEILING_MIN, CEILING_MAX);

  const started = Number.isFinite(startedAtMs) ? startedAtMs : null;
  const elapsedMin = started == null ? 0 : Math.max(0, (nowMs - started) / 60_000);
  const rising = Math.min(ceiling, startBase + elapsedMin * GROWTH_PER_MINUTE);

  const tick = Math.floor(nowMs / TICK_MS);
  const amp = intIn(seed, 3, WOBBLE_MIN, WOBBLE_MAX);
  const spike = unit(seed, tick + 11) < 0.12 ? 1.8 : 1;
  const wobble = (unit(seed, tick) * 2 - 1) * amp * spike;

  return Math.max(FLOOR, Math.min(ceiling, Math.round(rising + wobble)));
}

/**
 * Viewer count for the live watch chrome.
 *
 * - `enabled: true` (default) — vanity base shared across all watchers of this stream,
 *   plus real presence (match-linked / admin streams).
 * - `enabled: false` — real presence only (self-serve mobile go-live).
 *
 * Pass `streamId` + `startedAt` so every client derives the same vanity number.
 *
 * @param {number} [realCount=0]
 * @param {{ enabled?: boolean, streamId?: string|number|null, startedAt?: string|number|null }} [options]
 */
export function useVanityViewerCount(realCount = 0, { enabled = true, streamId = null, startedAt = null } = {}) {
  const startedAtMs = startedAt == null || startedAt === '' ? null : new Date(startedAt).getTime();
  const startedOk = startedAtMs != null && Number.isFinite(startedAtMs);

  const [base, setBase] = useState(() =>
    enabled && streamId != null ? computeVanityBase(streamId, startedOk ? startedAtMs : null) : 0,
  );

  useEffect(() => {
    if (!enabled || streamId == null) {
      setBase(0);
      return undefined;
    }

    const started = startedOk ? startedAtMs : null;

    function refresh() {
      setBase(computeVanityBase(streamId, started));
    }

    refresh();

    // Align first refresh to the next shared tick boundary so clients converge faster.
    const now = Date.now();
    const untilNextTick = TICK_MS - (now % TICK_MS);
    let intervalId = null;
    const timeoutId = setTimeout(() => {
      refresh();
      intervalId = setInterval(refresh, TICK_MS);
    }, untilNextTick);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId != null) clearInterval(intervalId);
    };
  }, [enabled, streamId, startedAtMs, startedOk]);

  if (!enabled) {
    return realCount;
  }

  return base + realCount;
}

export function formatViewerCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
