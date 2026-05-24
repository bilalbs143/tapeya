import { useCallback, useState } from 'react';

const HEART_COLORS = ['#ef4444', '#f87171', '#fb7185', '#e11d48', '#fda4af'];

let heartId = 0;

const MAX_FLOATING_HEARTS = 25;

/** Spawns floating hearts over the player (YouTube / Facebook live style). */
export function useFloatingHearts() {
  const [hearts, setHearts] = useState([]);

  const spawnBurst = useCallback((count = 5) => {
    const batch = Array.from({ length: count }, () => ({
      id: ++heartId,
      left: 68 + Math.random() * 24,
      bottom: 14 + Math.random() * 16,
      size: 20 + Math.random() * 16,
      drift: -40 + Math.random() * 80,
      delay: Math.random() * 0.35,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
    }));
    setHearts((prev) => [...prev, ...batch].slice(-MAX_FLOATING_HEARTS));
  }, []);

  const removeHeart = useCallback((id) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const clearHearts = useCallback(() => {
    setHearts([]);
  }, []);

  return { hearts, spawnBurst, removeHeart, clearHearts };
}
