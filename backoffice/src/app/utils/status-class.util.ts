/**
 * Maps status (and other enum) values to Tailwind badge classes.
 * Add new cases here to keep styling consistent across the app.
 *
 * How to add a new status tone:
 * 1. Pick the closest existing meaning — success/warning/error/info/neutral
 *    (neutral = muted, e.g. inactive, removed, dismissed — not a 5th brand
 *    color). Don't invent a new tone; this app's palette is one accent plus
 *    four status meanings.
 * 2. Add `your_status: 'bg-light-<tone> text-<tone>'` below — except neutral,
 *    which pairs `bg-light-secondary` with `text-muted`, not `text-secondary`.
 *    `--mat-sys-secondary` (what `text-secondary` reads) is a fixed hex, not
 *    theme-flipped — fine for a solid-fill+white-text button, unreadable
 *    paired with a light background tint in dark mode. `text-muted` reads
 *    `--n-60`, which is the token actually designed to flip per theme.
 * 3. Nothing else to touch — those Tailwind classes already read the app's
 *    design tokens (src/globals.css `@theme`), so the new status is on-brand
 *    automatically in both light and dark.
 */
const STATUS_CLASS_MAP: Record<string, string> = {
  active: 'bg-light-success text-success',
  blocked: 'bg-light-error text-error',
  verification_pending: 'bg-light-warning text-warning',
  inactive: 'bg-light-secondary text-muted',
  pending: 'bg-light-warning text-warning',
  approved: 'bg-light-success text-success',
  suspended: 'bg-light-error text-error',
  rejected: 'bg-light-error text-error',
  processing: 'bg-light-primary text-primary',
  dispatched: 'bg-light-info text-info',
  delivered: 'bg-light-success text-success',
  cancelled: 'bg-light-error text-error',
  scheduled: 'bg-light-secondary text-muted',
  toss_done: 'bg-light-info text-info',
  in_progress: 'bg-light-primary text-primary',
  completed: 'bg-light-success text-success',
  read: 'bg-light-success text-success',
  unread: 'bg-light-warning text-warning',
  upcoming: 'bg-light-info text-info',
  live: 'bg-light-primary text-primary',
  uploading: 'bg-light-warning text-warning',
  ready: 'bg-light-success text-success',
  failed: 'bg-light-error text-error',
  removed: 'bg-light-secondary text-muted',
  open: 'bg-light-warning text-warning',
  resolved: 'bg-light-success text-success',
  reviewed: 'bg-light-info text-info',
  dismissed: 'bg-light-secondary text-muted',
  actioned: 'bg-light-success text-success',
  unpaid: 'bg-light-warning text-warning',
  advance: 'bg-light-info text-info',
  paid: 'bg-light-success text-success',
  refunded: 'bg-light-secondary text-muted',
  linked: 'bg-light-success text-success',
  custom: 'bg-light-warning text-warning',
  idle: 'bg-light-secondary text-muted',
  ended: 'bg-light-secondary text-muted',
  streaming: 'bg-light-primary text-primary',
  /** Neutral pill for non-status labels (e.g. tournament type). */
  generic: 'bg-light-secondary text-muted',
};

const DEFAULT_STATUS_CLASS = 'bg-light-secondary text-muted';

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
