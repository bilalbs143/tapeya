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

/** @param {string} s */
function isoDateHead(s) {
  return String(s).trim().split('T')[0] ?? '';
}

/** @param {string} s */
export function isIsoDateString(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(isoDateHead(s));
}

/** MM-DD-YYYY (DatePicker display format). */
export function isDisplayDateString(s) {
  return /^\d{1,2}-\d{1,2}-\d{4}$/.test(String(s).trim());
}

/**
 * Parse MM-DD-YYYY or YYYY-MM-DD to a local Date. Returns undefined when invalid.
 *
 * @param {string} [value]
 * @returns {Date | undefined}
 */
export function parseDisplayOrIsoDate(value) {
  if (!value || typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  const head = isoDateHead(trimmed);

  if (isIsoDateString(head)) {
    const [year, month, day] = head.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  const display = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (display) {
    const [, mm, dd, yyyy] = display.map(Number);
    const d = new Date(yyyy, mm - 1, dd);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  return undefined;
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
  const head = isoDateHead(iso);

  if (isIsoDateString(head)) {
    const [year, month, day] = head.split('-');
    return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}-${year}`;
  }

  if (isDisplayDateString(head)) {
    const match = head.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (!match) return '';
    const [, mm, dd, yyyy] = match;
    return `${mm.padStart(2, '0')}-${dd.padStart(2, '0')}-${yyyy}`;
  }

  return '';
}

/** DatePicker → MM-DD-YYYY; API expects YYYY-MM-DD. Returns '' when unparseable. */
export function toApiDate(value) {
  if (value == null || value === '') return '';

  if (value instanceof Date) {
    return toDateStr(value);
  }

  if (typeof value !== 'string') return '';

  const trimmed = value.trim();
  const head = isoDateHead(trimmed);

  if (isIsoDateString(head)) {
    return head;
  }

  const display = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (display) {
    const [, mm, dd, yyyy] = display;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const [, mm, dd, yyyy] = slash;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  const parsed = parseDisplayOrIsoDate(trimmed);
  return parsed ? toDateStr(parsed) : '';
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

/**
 * Format a date for display (system-wide).
 *
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
 *
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
 * Format date range with ordinal days: "10th - 15th June 2026".
 *
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

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const RELATIVE_DAYS_CUTOFF = 10;

/**
 * Humanized relative date: "2 hours ago" → fallback to formatDate after 10 days.
 *
 * @param {string|Date|null|undefined} dateString
 * @returns {string}
 */
export function formatRelativeDate(dateString) {
  if (!dateString) return '';
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now - date;

  if (diffMs < 0) return formatDate(date);
  if (diffMs < MINUTE_MS) return 'Moments ago';
  if (diffMs < HOUR_MS) {
    const mins = Math.floor(diffMs / MINUTE_MS);
    return mins === 1 ? '1 minute ago' : `${mins} minutes ago`;
  }
  if (diffMs < DAY_MS) {
    const hours = Math.floor(diffMs / HOUR_MS);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  const diffDays = Math.floor(diffMs / DAY_MS);
  if (diffDays <= RELATIVE_DAYS_CUTOFF) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }

  return formatDate(date);
}
