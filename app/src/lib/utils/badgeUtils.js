/** Format a numeric count for display on notification/cart badges (e.g. "99+"). */
export function formatCountBadge(count, max = 99) {
  if (count <= 0) return null;
  return count > max ? `${max}+` : String(count);
}
