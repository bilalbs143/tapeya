import { LiveStreamThumbnail } from '@/components/live/LiveStreamThumbnail';

/**
 * Live / upcoming broadcast card — image header, optional LIVE badge, title + metadata.
 */
export function LiveEventCard({ image, title, line2, line3, isLive = false }) {
  return (
    <article className="bg-surface-border flex h-full flex-col overflow-hidden rounded-[20px]">
      <div className="relative w-full shrink-0">
        <LiveStreamThumbnail src={image} alt={title} />
        {isLive && (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
            Live
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col space-y-1 px-4 py-4">
        <h3 className="text-[14px] leading-snug font-bold break-words text-white">{title}</h3>
        {line2 ? <p className="text-[12px] break-words text-[#888888]">{line2}</p> : null}
        {line3 ? <p className="text-[12px] break-words text-[#888888]">{line3}</p> : null}
      </div>
    </article>
  );
}
