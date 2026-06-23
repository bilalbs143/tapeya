import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { ACTIVE_PLATFORM_LABELS } from 'src/app/shared/constants/active-platform.constants';

/**
 * Parses a date string (ISO or YYYY-MM-DD) as a local date,
 * avoiding timezone-shift issues from `new Date('YYYY-MM-DD')`.
 */
export function parseLocalDate(value: string | null | undefined): Date | null {
  const head = (value ?? '').toString().split('T')[0] ?? '';
  const parts = head.split('-').map((p) => Number(p));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function ageFromBirthdate(birth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Returns a formatted string like "1995-06-15 (29)" or the empty-cell placeholder.
 */
export function birthdateAgeLine(isoOrYmd: string | null | undefined): string {
  if (!isoOrYmd) return EMPTY_CELL;
  const birth = parseLocalDate(isoOrYmd);
  if (!birth) return EMPTY_CELL;
  const y = birth.getFullYear();
  const m = String(birth.getMonth() + 1).padStart(2, '0');
  const d = String(birth.getDate()).padStart(2, '0');
  return `${y}-${m}-${d} (${ageFromBirthdate(birth)})`;
}

/**
 * Returns "City, Country", "City", "Country" or the empty-cell placeholder.
 */
export function cityCountryLine(city: string | null | undefined, country: string | null | undefined): string {
  const c = (city ?? '').trim();
  const co = (country ?? '').trim();
  if (c && co) return `${c}, ${co}`;
  if (c) return c;
  if (co) return co;
  return EMPTY_CELL;
}

const ACTIVE_PLATFORM_LABELS_MAP = ACTIVE_PLATFORM_LABELS;

/** Last active client platform (web / iOS / Android). */
export function formatActivePlatform(platform: string | null | undefined): string {
  const value = platform?.trim();
  if (!value) return EMPTY_CELL;
  return ACTIVE_PLATFORM_LABELS_MAP[value] ?? value;
}
