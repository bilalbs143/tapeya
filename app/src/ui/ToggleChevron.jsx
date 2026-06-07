/**
 * Animated chevron for collapsible section headers.
 * Rotates 90° when open.
 */
export function ToggleChevron({ open }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-[#DA9811] transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
