/**
 * Formats a Date to YYYY-MM-DD.
 *
 * @param {Date} d
 * @returns {string}
 */
export function toDateStr(d) {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Parses a date string to a Date (noon UTC to avoid timezone rollover). Returns null for invalid.
 *
 * @param {string} str - ISO date (YYYY-MM-DD) or parseable string
 * @returns {Date | null}
 */
export function parseDate(str) {
  if (!str) return null;
  const s = String(str).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T12:00:00');
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Converts MM-DD-YYYY (e.g. from DatePicker) to YYYY-MM-DD for the API.
 * DatePicker (src/ui/DatePicker.jsx) always emits MM-DD-YYYY; this function
 * accepts that format. Returns the original value when not a valid string
 * or when parts are missing.
 *
 * @param {string} value - Date string (MM-DD-YYYY or MM/DD/YYYY)
 * @returns {string} YYYY-MM-DD or unchanged value
 */
export function toApiDate(value) {
  if (!value || typeof value !== 'string') return value;
  const [mm, dd, yyyy] = value.split(/[-/]/);
  return yyyy && mm && dd ? `${yyyy}-${mm}-${dd}` : value;
}

/**
 * Human-readable age from a YYYY-MM-DD date-of-birth. Returns '—' for missing/invalid.
 *
 * @param {string} [dateOfBirth] - YYYY-MM-DD
 * @returns {string}
 */
export function formatAge(dateOfBirth) {
  if (!dateOfBirth) return '—';
  const d = new Date(dateOfBirth);
  if (Number.isNaN(d.getTime())) return '—';
  const today = new Date();
  let years = today.getFullYear() - d.getFullYear();
  const lastBday = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (lastBday > today) {
    years -= 1;
    lastBday.setFullYear(today.getFullYear() - 1);
  }
  const days = Math.floor((today - lastBday) / (24 * 60 * 60 * 1000));
  if (years <= 0 && days <= 0) return '—';
  const parts = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  return parts.join(' ');
}
