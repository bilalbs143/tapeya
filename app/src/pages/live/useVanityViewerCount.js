import { useEffect, useRef, useState } from 'react';

/** Opening look — small crowd that feels early, not already packed. */
const START_MIN = 12;
const START_MAX = 42;
const FLOOR = 8;
const CEILING = 1400;

const DELTA_MIN = 4;
const DELTA_MAX = 28;
const INTERVAL_MIN = 5000;
const INTERVAL_MAX = 11000;

/** Rough viewer growth per minute of watch time (before noise). */
const GROWTH_PER_MINUTE = 55;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Viewer count for the live watch chrome.
 *
 * - `enabled: true` (default) — vanity base that climbs over the session, plus real presence
 *   (match-linked / admin streams).
 * - `enabled: false` — real presence only (self-serve mobile go-live).
 *
 * @param {number} [realCount=0]
 * @param {{ enabled?: boolean }} [options]
 */
export function useVanityViewerCount(realCount = 0, { enabled = true } = {}) {
  const [base, setBase] = useState(() => randomInt(START_MIN, START_MAX));
  const timerRef = useRef(null);
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;
    startedAtRef.current = Date.now();
    setBase(randomInt(START_MIN, START_MAX));

    function schedule() {
      timerRef.current = setTimeout(
        () => {
          if (cancelled) return;

          setBase((prev) => {
            const elapsedMin = (Date.now() - startedAtRef.current) / 60_000;
            // Soft target rises over time so the room feels busier the longer you stay.
            const risingTarget = Math.min(CEILING, START_MAX + elapsedMin * GROWTH_PER_MINUTE);
            const belowTarget = prev < risingTarget;

            // Prefer growth early / while under target; still allow dips and spikes.
            let upChance = belowTarget ? 0.78 : 0.42;
            if (prev > risingTarget * 1.15) upChance = 0.28;

            const delta = randomInt(DELTA_MIN, DELTA_MAX);
            const goUp = Math.random() < upChance;
            // Occasional larger jump either way so it feels less mechanical.
            const spike = Math.random() < 0.12 ? randomInt(DELTA_MAX, DELTA_MAX * 2) : delta;
            const next = goUp ? prev + spike : prev - spike;

            return Math.max(FLOOR, Math.min(CEILING, next));
          });

          schedule();
        },
        randomInt(INTERVAL_MIN, INTERVAL_MAX),
      );
    }

    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timerRef.current);
    };
  }, [enabled]);

  if (!enabled) {
    return realCount;
  }

  return base + realCount;
}

export function formatViewerCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
