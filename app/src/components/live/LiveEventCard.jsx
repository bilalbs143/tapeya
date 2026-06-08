import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const FALLBACK_IMAGE = `${CLOUDFRONT_APP_BASE}/images/standard/live-img-1.png`;

/**
 * Live / upcoming broadcast card — image header, optional LIVE badge, title + metadata.
 */
export function LiveEventCard({ image, title, line2, line3, isLive = false }) {
  return (
    <article className="bg-surface-border flex h-full flex-col overflow-hidden rounded-[20px]">
      <div className="bg-surface-deep relative aspect-[16/10] w-full shrink-0 overflow-hidden">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_IMAGE) {
              e.currentTarget.src = FALLBACK_IMAGE;
            }
          }}
        />
        {isLive && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
            Live
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col space-y-1 px-4 py-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[15px] leading-snug font-bold text-white">{title}</h3>
        {line2 ? <p className="text-[13px] text-[#888888]">{line2}</p> : null}
        {line3 ? <p className="text-[13px] text-[#888888]">{line3}</p> : null}
      </div>
    </article>
  );
}
