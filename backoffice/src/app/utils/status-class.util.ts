/**
 * Maps status (and other enum) values to Tailwind badge classes.
 * Add new cases here to keep styling consistent across the app.
 */
const STATUS_CLASS_MAP: Record<string, string> = {
  active: 'bg-light-success text-success',
  blocked: 'bg-light-error text-error',
  verification_pending: 'bg-light-warning text-warning',
  inactive: 'bg-light-secondary text-secondary',
  pending: 'bg-light-warning text-warning',
  approved: 'bg-light-success text-success',
  rejected: 'bg-light-error text-error',
  processing: 'bg-light-primary text-primary',
  dispatched: 'bg-light-info text-info',
  delivered: 'bg-light-success text-success',
  cancelled: 'bg-light-error text-error',
  scheduled: 'bg-light-secondary text-secondary',
  toss_done: 'bg-light-info text-info',
  in_progress: 'bg-light-primary text-primary',
  completed: 'bg-light-success text-success',
  read: 'bg-light-success text-success',
  unread: 'bg-light-warning text-warning',
  upcoming: 'bg-light-info text-info',
  live: 'bg-light-primary text-primary',
};

const DEFAULT_STATUS_CLASS = 'bg-light-secondary text-secondary';

/**
 * Returns the badge CSS classes for a given status enum value (e.g. from API status_enum).
 * Normalizes to lowercase so API values like "ACTIVE" or "Verification_Pending" still match.
 */
export function getStatusClass(statusEnum: string | null | undefined): string {
  if (statusEnum == null || statusEnum === '') {
    return DEFAULT_STATUS_CLASS;
  }
  const key = statusEnum.toLowerCase();
  return STATUS_CLASS_MAP[key] ?? DEFAULT_STATUS_CLASS;
}
