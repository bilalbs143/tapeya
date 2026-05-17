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
 * Converts YYYY-MM-DD (API / profile) to MM-DD-YYYY for DatePicker display.
 * Strips a time portion if present (e.g. `1990-05-12T00:00:00Z`).
 *
 * @param {string} [iso]
 * @returns {string}
 */
export function formatIsoDateForDisplay(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const head = iso.split('T')[0] ?? '';
  const [year, month, day] = head.split('-');
  if (!year || !month || !day) return '';
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}-${year}`;
}

/** DatePicker → MM-DD-YYYY; API expects YYYY-MM-DD. Leaves ISO dates unchanged. */
export function toApiDate(value) {
  if (!value || typeof value !== 'string') return value;
  const trimmed = value.trim();
  const head = trimmed.split('T')[0] ?? '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) {
    return head;
  }
  const parts = trimmed.split(/[-/]/);
  if (parts.length !== 3) return value;
  const [mm, dd, yyyy] = parts;
  if (!yyyy || !mm || !dd) return value;
  if (String(yyyy).length !== 4) return value;
  return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
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
