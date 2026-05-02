/**
 * FreeHitIndicator
 *
 * Animated banner shown when the next delivery is a free hit (Law 21.18).
 * Renders null when pendingFreeHit is false, so callers can safely include it unconditionally.
 *
 * @param {boolean} pendingFreeHit
 */
export function FreeHitIndicator({ pendingFreeHit }) {
  if (!pendingFreeHit) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Free Hit — batsman cannot be bowled, LBW, caught, or hit wicket"
      className="flex items-center justify-center gap-2 rounded-xl border border-[#DA9811]/40 bg-[#DA9811]/10 px-4 py-2.5 text-center"
    >
      {/* Lightning bolt icon */}
      <svg
        className="h-5 w-5 shrink-0 text-[#DA9811]"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M13 2L4.5 13H11L10 22L19.5 11H13L13 2Z" />
      </svg>
      <span className="animate-pulse text-[13px] font-bold tracking-widest text-[#DA9811] uppercase">
        Free Hit
      </span>
      <svg
        className="h-5 w-5 shrink-0 text-[#DA9811]"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M13 2L4.5 13H11L10 22L19.5 11H13L13 2Z" />
      </svg>
    </div>
  );
}
