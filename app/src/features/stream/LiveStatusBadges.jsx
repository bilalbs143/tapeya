import { formatViewerCount } from '@/pages/live/useVanityViewerCount';

const STATUS_BADGE = {
  live: { dot: 'animate-pulse bg-red-500', label: 'Live' },
  starting: { dot: 'animate-pulse bg-yellow-400', label: 'Starting…' },
  ended: { dot: 'bg-white/50', label: 'Ended' },
};

/** LIVE / Starting / Ended pill — same chrome as the watch-live player. */
export function LiveStatusBadge({ status, label: labelOverride }) {
  const cfg = STATUS_BADGE[status];
  if (!cfg && !labelOverride) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/85 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg?.dot ?? 'animate-pulse bg-red-500'}`} aria-hidden />
      {labelOverride ?? cfg.label}
    </span>
  );
}

/** White viewer pill with eye icon — same chrome as the watch-live player. */
export function LiveViewerCountBadge({ viewerCount, format = true }) {
  const display = format ? formatViewerCount(viewerCount) : String(viewerCount);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-black"
      aria-live="polite"
      aria-label={`${viewerCount} watching`}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="black" strokeWidth="2" />
      </svg>
      <span key={display} className="animate-[fadeSlideIn_0.4s_ease_forwards]">
        {display}
      </span>
    </span>
  );
}
