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
 * Vanity viewer count: starts low, climbs over the session, with dips and spikes
 * around a slowly rising target. Real presence is added on top.
 */
export function useVanityViewerCount(realCount = 0) {
  const [base, setBase] = useState(() => randomInt(START_MIN, START_MAX));
  const timerRef = useRef(null);
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;

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
  }, []);

  return base + realCount;
}

export function formatViewerCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
