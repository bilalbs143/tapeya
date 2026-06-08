import { useEffect, useRef, useState } from 'react';

const BASE_MIN = 180;
const BASE_MAX = 1400;
const DELTA_MIN = 8;
const DELTA_MAX = 55;
const INTERVAL_MIN = 7000;
const INTERVAL_MAX = 15000;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a vanity viewer count that starts at a random base (hundreds–thousands),
 * drifts realistically every 7–15 s, and adds the real presence count on top.
 */
export function useVanityViewerCount(realCount = 0) {
  const [base, setBase] = useState(() => randomInt(BASE_MIN, BASE_MAX));
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    function schedule() {
      timerRef.current = setTimeout(
        () => {
          if (cancelled) return;
          setBase((prev) => {
            const delta = randomInt(DELTA_MIN, DELTA_MAX);
            const direction = Math.random() < 0.6 ? 1 : -1;
            return Math.max(BASE_MIN, Math.min(BASE_MAX, prev + direction * delta));
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
