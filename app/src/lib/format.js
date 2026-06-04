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
  const code = currency && String(currency).trim() ? String(currency).trim() : 'PKR';
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
export function formatDate(value, options = { day: '2-digit', month: 'short', year: 'numeric' }) {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', options);
}

/**
 * Format a date range for display. Uses formatDate for each part.
 * @param {string|Date|null|undefined} startDate - Start date (ISO or Date)
 * @param {string|Date|null|undefined} [endDate] - End date; if same as start or omitted, single date is shown
 * @param {Intl.DateTimeFormatOptions} [options] - Optional format options passed to formatDate
 * @returns {string} e.g. "08 Jan, 2025" or "08 Jan, 2025 – 15 Mar, 2025"
 */
export function formatDateRange(startDate, endDate, options) {
  if (startDate == null || startDate === '') return '—';
  const start = formatDate(startDate, options);
  if (!start) return '—';
  if (endDate == null || endDate === '' || String(endDate) === String(startDate)) return start;
  const end = formatDate(endDate, options);
  if (!end) return start;
  return `${start} – ${end}`;
}

/**
 * Ordinal suffix for day numbers (1st, 2nd, 3rd, 4th, …).
 * @param {number} n - Day of month
 * @returns {string} e.g. "st", "nd", "rd", "th"
 */
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
 * Format date range with ordinal days: "10th - 15th June 2026".
 * @param {string|Date|null|undefined} startDate
 * @param {string|Date|null|undefined} [endDate]
 * @returns {string}
 */
export function formatOrdinalDateRange(startDate, endDate) {
  if (startDate == null || startDate === '') return '—';
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  if (Number.isNaN(start.getTime())) return '—';
  const startDay = start.getDate();
  const startMonth = start.toLocaleDateString('en-GB', { month: 'long' });
  const startYear = start.getFullYear();
  const startStr = `${startDay}${ordinalSuffix(startDay)} ${startMonth} ${startYear}`;
  if (endDate == null || endDate === '' || String(endDate) === String(startDate)) return startStr;
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  if (Number.isNaN(end.getTime())) return startStr;
  const endDay = end.getDate();
  const endMonth = end.toLocaleDateString('en-GB', { month: 'long' });
  const endYear = end.getFullYear();
  if (startMonth === endMonth && startYear === endYear)
    return `${startDay}${ordinalSuffix(startDay)} - ${endDay}${ordinalSuffix(endDay)} ${endMonth} ${endYear}`;
  return `${startStr} – ${endDay}${ordinalSuffix(endDay)} ${endMonth} ${endYear}`;
}

/**
 * Ordinal match label: 1 -> "1st Match", 2 -> "2nd Match", etc.
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
