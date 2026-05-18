import { NAVBAR_ICON_BADGE_CLASS } from '@/lib/constants/navbar';

/**
 * Count badge for navbar icon buttons (notifications, cart).
 * Keep markup identical everywhere so position and styling stay in sync.
 */
export function NavbarIconBadge({ label, animatePop = false }) {
  if (!label) {
    return null;
  }

  return (
    <span
      className={`${NAVBAR_ICON_BADGE_CLASS}${animatePop ? ' animate-badge-pop origin-top-right' : ''}`}
      aria-hidden
    >
      {label}
    </span>
  );
}
