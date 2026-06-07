/**
 * Shared back chevron for multi-step scoring / dismissal dialogs.
 *
 * @param {Function} onClick
 * @param {string} [ariaLabel='Back']
 * @param {string} [className]
 */
export function DialogBackButton({ onClick, ariaLabel = 'Back', className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DA9811] ${className}`.trim()}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
