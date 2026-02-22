/**
 * Parse a value to a finite number (for calculations). Handles locale-formatted strings.
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
 * @param {number|string} value - Price value
 * @param {string} [currency='PKR'] - Currency code
 * @returns {string} Formatted string e.g. "PKR 1,499"
 */
export function formatPrice(value, currency = 'PKR') {
  const code =
    currency && String(currency).trim() ? String(currency).trim() : 'PKR';
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return `${code} 0`;
  return `${code} ${num.toLocaleString()}`;
}

/**
 * Format a date for display (system-wide).
 * @param {string|Date|null|undefined} value - ISO date string or Date
 * @param {Intl.DateTimeFormatOptions} [options] - Optional Intl options (default: day, short month, year)
 * @returns {string} Formatted string e.g. "08 Jan, 2025" or ""
 */
export function formatDate(
  value,
  options = { day: '2-digit', month: 'short', year: 'numeric' },
) {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', options);
}
