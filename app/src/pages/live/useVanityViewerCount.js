import { useEffect, useMemo, useState } from 'react';

/** Shared tick — every client refreshes on the same wall-clock bucket. */
const TICK_MS = 3_000;

/** Ease from near-min into the oscillating band. */
const RAMP_MS = 90_000;

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
 * @returns {{ min: number, max: number } | null} null when disabled / invalid
 */
export function resolveVanityViewerRange(minRaw, maxRaw) {
  const a = Math.round(Number(minRaw));
  const b = Math.round(Number(maxRaw));
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (a === 0 && b === 0) return null;
  if (a < 0 || b < 0) return null;
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  if (max < 1) return null;
  return { min, max };
}

/**
 * Same streamId + now + range → same number on every device.
 * Slow + medium waves drift up/down inside [min, max] (never parks at max).
 */
export function computeVanityBase(streamId, startedAtMs, range, nowMs = Date.now()) {
  const { min: lo, max: hi } = range;
  if (hi <= lo) return lo;

  const seed = hash32(streamId);
  const span = hi - lo;
  const tSec = nowMs / 1000;

  // Per-stream periods so different streams are not locked together.
  const slowPeriod = 180 + intIn(seed, 4, 0, 180); // 3–6 min
  const medPeriod = 45 + intIn(seed, 5, 0, 45); // 45–90 s
  const slow = 0.5 + 0.5 * Math.sin((2 * Math.PI * tSec) / slowPeriod + unit(seed, 6) * Math.PI * 2);
  const med = 0.5 + 0.5 * Math.sin((2 * Math.PI * tSec) / medPeriod + unit(seed, 7) * Math.PI * 2);

  const tick = Math.floor(nowMs / TICK_MS);
  const wobble = (unit(seed, tick) * 2 - 1) * 0.04; // ±4% of band, shared per tick

  // Keep away from exact edges so the count keeps moving.
  let u = 0.7 * slow + 0.3 * med + wobble;
  u = Math.min(0.96, Math.max(0.04, u));

  let value = lo + u * span;

  if (Number.isFinite(startedAtMs)) {
    const ramp = Math.min(1, Math.max(0, nowMs - startedAtMs) / RAMP_MS);
    const ease = 1 - (1 - ramp) ** 2;
    const openAt = lo + span * 0.08;
    value = openAt + (value - openAt) * ease;
  }

  return Math.round(Math.min(hi, Math.max(lo, value)));
}

/**
 * Match/admin watch: vanity when range is set.
 * Self-serve: vanity only when caller passes enabled (settings flag).
 * While settings are still loading (`settingsReady: false`), returns null (hide badge).
 */
export function useVanityViewerCount(
  realCount = 0,
  { enabled = true, settingsReady = true, streamId = null, startedAt = null, min = null, max = null } = {},
) {
  const range = useMemo(() => resolveVanityViewerRange(min, max), [min, max]);
  const startedAtMs = useMemo(() => {
    if (startedAt == null || startedAt === '') return null;
    const ms = new Date(startedAt).getTime();
    return Number.isFinite(ms) ? ms : null;
  }, [startedAt]);

  const vanityOn = Boolean(enabled && settingsReady && streamId != null && range);
  const waiting = Boolean(enabled && !settingsReady);

  const [base, setBase] = useState(0);

  useEffect(() => {
    if (!vanityOn || !range) {
      setBase(0);
      return undefined;
    }

    const refresh = () => setBase(computeVanityBase(streamId, startedAtMs, range));
    refresh();

    const untilNextTick = TICK_MS - (Date.now() % TICK_MS);
    let intervalId = null;
    const timeoutId = setTimeout(() => {
      refresh();
      intervalId = setInterval(refresh, TICK_MS);
    }, untilNextTick);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId != null) clearInterval(intervalId);
    };
  }, [vanityOn, streamId, startedAtMs, range]);

  if (waiting) return null;
  if (!vanityOn) return realCount;
  return base;
}

export function formatViewerCount(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
