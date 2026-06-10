/**
 * Number, price, and list formatting helpers.
 * Date formatting lives in {@link ./utils/dateUtils.js}.
 */

/**
 * Parse a value to a finite number (for calculations). Handles locale-formatted strings.
 *
 * @param {number|string|null|undefined} value
 * @param {number} [fallback=0] - Value to return when result is not finite
 * @returns {number}
 */
export function toNumber(value, fallback = 0) {
  const cleaned = typeof value === 'string' ? value.replace(/,/g, '') : value;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Format a numeric price for display (system-wide).
 *
 * @param {number|string} value - Price value
 * @param {string} [currency='PKR'] - Currency code
 * @returns {string} Formatted string e.g. "PKR 1,499"
 */
export function formatPrice(value, currency = 'PKR') {
  const code = currency && String(currency).trim() ? String(currency).trim() : 'PKR';
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return `${code} 0`;
  return `${code} ${num.toLocaleString()}`;
}

/** @param {number} n */
function ordinalSuffix(n) {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Ordinal match label: 1 -> "1st Match", 2 -> "2nd Match", etc.
 *
 * @param {number} n - Match number
 * @returns {string}
 */
export function formatOrdinalMatch(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num < 1) return 'Match';
  return `${num}${ordinalSuffix(num)} Match`;
}

/**
 * 1-based list index with trailing period (e.g. "1.", "12.") for numbered roster rows.
 *
 * @param {number} position - 1-based index
 * @returns {string}
 */
export function formatListIndex(position) {
  return `${position}.`;
}

/**
 * Format engagement count: 5000 -> "5K", 1240 -> "1.2K", 68 -> "68"
 *
 * @param {number} count
 * @returns {string}
 */
export function formatCount(count) {
  if (count >= 1000) {
    const k = count / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return String(count);
}
