/**
 * Shared LIVE badge for live-stream thumbnails (feed, hub, home slider).
 *
 * @param {{ className?: string }} props
 */
export function LiveStreamChip({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded bg-[#E53935] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase ${className}`.trim()}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" aria-hidden />
      Live
    </span>
  );
}
