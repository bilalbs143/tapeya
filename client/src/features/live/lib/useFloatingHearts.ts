import { useCallback, useState } from 'react';

/** Soft token gradients for avatar fallbacks when the liker has no photo. */
const BUBBLE_GRADIENTS = [
  'bg-[linear-gradient(135deg,var(--color-like),var(--color-danger))]',
  'bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-cyan))]',
  'bg-[linear-gradient(135deg,var(--color-danger-text),var(--color-like))]',
  'bg-[linear-gradient(135deg,var(--color-brand-cyan),var(--color-brand-deep))]',
  'bg-[linear-gradient(135deg,var(--color-positive),var(--color-brand))]',
] as const;

export type FloatingHeart = {
  id: number;
  left: number;
  bottom: number;
  drift: number;
  gradient: (typeof BUBBLE_GRADIENTS)[number];
  avatarUrl: string | null;
  initials: string;
};

let heartId = 0;
const MAX_FLOATING_HEARTS = 20;

/** Spawns Facebook-style avatar bubbles with a heart badge over the player. */
export function useFloatingHearts() {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  const spawnBurst = useCallback((avatarUrl: string | null = null, initials = '?') => {
    const gradient = BUBBLE_GRADIENTS[Math.floor(Math.random() * BUBBLE_GRADIENTS.length)] ?? BUBBLE_GRADIENTS[0];
    if (!gradient) return;
    const bubble: FloatingHeart = {
      id: ++heartId,
      left: 72 + Math.random() * 18,
      bottom: 16 + Math.random() * 10,
      drift: -20 + Math.random() * 40,
      gradient,
      avatarUrl,
      initials: initials.trim() || '?',
    };
    setHearts((prev) => [...prev, bubble].slice(-MAX_FLOATING_HEARTS));
  }, []);

  const removeHeart = useCallback((id: number) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const clearHearts = useCallback(() => {
    setHearts([]);
  }, []);

  return { hearts, spawnBurst, removeHeart, clearHearts };
}
