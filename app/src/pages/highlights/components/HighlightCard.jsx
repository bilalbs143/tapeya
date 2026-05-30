import { formatHighlightDate } from '@/pages/highlights/highlightsUtils';
import { HIGHLIGHTS_FALLBACK_IMAGE } from '@/pages/highlights/highlightsData';

export function HighlightCard({ highlight, onClick, disabled = false }) {
  const imageUrl = highlight.thumbnailUrl || HIGHLIGHTS_FALLBACK_IMAGE;
  const title = highlight.title ?? 'Highlight';
  const dateLabel = formatHighlightDate(highlight.publishedAt);

  return (
    <button
      type="button"
      onClick={() => !disabled && onClick?.(highlight)}
      disabled={disabled}
      className="flex w-full flex-col overflow-hidden rounded-[17px] bg-[#141412] text-left transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DA9811] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:opacity-90 disabled:cursor-default disabled:opacity-60"
    >
      <div className="h-[148px] w-full overflow-hidden bg-[#0d0d0b]">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== HIGHLIGHTS_FALLBACK_IMAGE) {
              e.currentTarget.src = HIGHLIGHTS_FALLBACK_IMAGE;
            }
          }}
        />
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-[13px] font-bold text-white">{title}</h3>
        {dateLabel ? <p className="text-[12px] text-[#A2A6AB]">{dateLabel}</p> : null}
      </div>
    </button>
  );
}
