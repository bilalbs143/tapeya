/**
 * Returns 2-letter initials from a display name or nickname.
 *
 * @param {string} [name] - Full name
 * @param {string} [nickname] - If provided, used for initials instead of name
 * @returns {string}
 */
export function getInitials(name, nickname) {
  if (nickname) return nickname.slice(0, 2).toUpperCase();
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name || 'U').slice(0, 2).toUpperCase();
}

/**
 * Formats a number for display; returns '—' for null/undefined/empty.
 *
 * @param {number|string|null|undefined} n
 * @returns {string}
 */
export function formatNum(n) {
  if (n == null || n === '') return '—';
  if (typeof n === 'number' && Number.isFinite(n)) return String(n);
  return String(n);
}

/**
 * Formats a decimal to 2 dp; returns '—' for null/undefined/empty.
 *
 * @param {number|string|null|undefined} n
 * @param {number} [decimals=2]
 * @returns {string}
 */
export function formatDecimal(n, decimals = 2) {
  if (n == null || n === '') return '—';
  if (typeof n === 'number' && Number.isFinite(n)) return n.toFixed(decimals);
  const parsed = Number(n);
  if (Number.isFinite(parsed)) return parsed.toFixed(decimals);
  return String(n);
}

/** Format a numeric count for display on notification/cart badges (e.g. "99+"). */
export function formatCountBadge(count, max = 99) {
  if (count <= 0) return null;
  return count > max ? `${max}+` : String(count);
}
