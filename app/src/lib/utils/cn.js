/**
 * Merge class names. Lightweight helper for graphics theme components.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
