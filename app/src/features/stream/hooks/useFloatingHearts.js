import { useCallback, useState } from 'react';

const BUBBLE_GRADIENTS = [
  'from-pink-500 to-rose-400',
  'from-purple-500 to-pink-400',
  'from-orange-400 to-rose-500',
  'from-red-500 to-pink-400',
  'from-fuchsia-500 to-purple-400',
];

let heartId = 0;
const MAX_FLOATING_HEARTS = 20;

/** Spawns Facebook-style avatar bubbles with heart badge over the player. */
export function useFloatingHearts() {
  const [hearts, setHearts] = useState([]);

  const spawnBurst = useCallback((avatarUrl = null, initials = '?') => {
    const bubble = {
      id: ++heartId,
      left: 72 + Math.random() * 18,
      bottom: 16 + Math.random() * 10,
      drift: -20 + Math.random() * 40,
      delay: 0,
      gradient: BUBBLE_GRADIENTS[Math.floor(Math.random() * BUBBLE_GRADIENTS.length)],
      avatarUrl,
      initials,
    };
    setHearts((prev) => [...prev, bubble].slice(-MAX_FLOATING_HEARTS));
  }, []);

  const removeHeart = useCallback((id) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const clearHearts = useCallback(() => {
    setHearts([]);
  }, []);

  return { hearts, spawnBurst, removeHeart, clearHearts };
}
