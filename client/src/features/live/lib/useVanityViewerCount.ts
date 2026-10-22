import { useMemo, useSyncExternalStore } from 'react';

/** Shared tick — every client refreshes on the same wall-clock bucket. */
const TICK_MS = 3_000;

/** Ease from near-min into the oscillating band. */
const RAMP_MS = 90_000;

function hash32(input: unknown): number {
  let h = 2166136261;
  const s = String(input ?? '');
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic [0, 1) from seed + salt. */
function unit(seed: number, salt: number): number {
  let x = (seed ^ Math.imul(salt | 0, 0x9e3779b9)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  x = (x ^ (x >>> 16)) >>> 0;
  return x / 0x100000000;
}

function intIn(seed: number, salt: number, min: number, max: number): number {
  return min + Math.floor(unit(seed, salt) * (max - min + 1));
}

export type VanityViewerRange = { min: number; max: number };

/** null when disabled / invalid (both 0, negative, or non-numeric). */
export function resolveVanityViewerRange(minRaw: unknown, maxRaw: unknown): VanityViewerRange | null {
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

/** Same streamId + now + range → same number on every device. Slow + medium waves drift up/down inside [min, max] (never parks at max). */
export function computeVanityBase(
  streamId: number | string,
  startedAtMs: number | null,
  range: VanityViewerRange,
  nowMs = Date.now()
): number {
  const { min: lo, max: hi } = range;
  if (hi <= lo) return lo;

  const seed = hash32(streamId);
  const span = hi - lo;
  const tSec = nowMs / 1000;

  const slowPeriod = 180 + intIn(seed, 4, 0, 180);
  const medPeriod = 45 + intIn(seed, 5, 0, 45);
  const slow = 0.5 + 0.5 * Math.sin((2 * Math.PI * tSec) / slowPeriod + unit(seed, 6) * Math.PI * 2);
  const med = 0.5 + 0.5 * Math.sin((2 * Math.PI * tSec) / medPeriod + unit(seed, 7) * Math.PI * 2);

  const tick = Math.floor(nowMs / TICK_MS);
  const wobble = (unit(seed, tick) * 2 - 1) * 0.04;

  let u = 0.7 * slow + 0.3 * med + wobble;
  u = Math.min(0.96, Math.max(0.04, u));

  let value = lo + u * span;

  if (startedAtMs != null && Number.isFinite(startedAtMs)) {
    const ramp = Math.min(1, Math.max(0, (nowMs - startedAtMs) / RAMP_MS));
    const ease = 1 - (1 - ramp) ** 2;
    const openAt = lo + span * 0.08;
    value = openAt + (value - openAt) * ease;
  }

  return Math.round(Math.min(hi, Math.max(lo, value)));
}

function getVanityTick(): number {
  return Math.floor(Date.now() / TICK_MS);
}

/** Align subscribers to the same wall-clock bucket, then pulse every `TICK_MS`. */
function subscribeVanityTick(onStoreChange: () => void): () => void {
  const untilNextTick = TICK_MS - (Date.now() % TICK_MS);
  let intervalId: ReturnType<typeof setInterval> | null = null;
  const timeoutId = setTimeout(() => {
    onStoreChange();
    intervalId = setInterval(onStoreChange, TICK_MS);
  }, untilNextTick);

  return () => {
    clearTimeout(timeoutId);
    if (intervalId != null) clearInterval(intervalId);
  };
}

function subscribeNoop(): () => void {
  return () => {};
}

type VanityOptions = {
  enabled?: boolean | undefined;
  settingsReady?: boolean | undefined;
  streamId?: number | string | null | undefined;
  startedAt?: string | null | undefined;
  min?: unknown;
  max?: unknown;
};

/** Vanity viewer count when range/flag allow; null while settings load. */
export function useVanityViewerCount(
  realCount = 0,
  {
    enabled = true,
    settingsReady = true,
    streamId = null,
    startedAt = null,
    min = null,
    max = null,
  }: VanityOptions = {}
): number | null {
  const range = useMemo(() => resolveVanityViewerRange(min, max), [min, max]);
  const startedAtMs = useMemo(() => {
    if (startedAt == null || startedAt === '') return null;
    const ms = new Date(startedAt).getTime();
    return Number.isFinite(ms) ? ms : null;
  }, [startedAt]);

  const vanityOn = Boolean(enabled && settingsReady && streamId != null && range);
  const waiting = Boolean(enabled && !settingsReady);

  // Only subscribe while vanity is active so idle watchers don't re-render every 3s.
  const tick = useSyncExternalStore(vanityOn ? subscribeVanityTick : subscribeNoop, getVanityTick, () => 0);

  if (waiting) return null;
  if (!vanityOn || streamId == null || range == null) return realCount;

  return computeVanityBase(streamId, startedAtMs, range, tick * TICK_MS);
}

/** Compact vanity badge label (e.g. 1.2k). */
export function formatVanityViewerCount(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
