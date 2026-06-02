import { FIXTURE_BG_IMAGE } from '@/lib/constants/assets';
import { formatHighlightDuration, getHighlightTitle } from '@/pages/highlights/highlightsUtils';

export function MoreHighlightRow({ highlight, onClick }) {
  const imageUrl = highlight.thumbnailUrl || FIXTURE_BG_IMAGE;
  const title = getHighlightTitle(highlight);
  const durationLabel = formatHighlightDuration(highlight.duration);

  return (
    <button
      type="button"
      onClick={() => onClick?.(highlight)}
      className="flex w-full items-center gap-3 rounded-[17px] bg-[#141412] p-3 text-left transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DA9811] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:opacity-90"
    >
      <div className="h-[72px] w-[112px] shrink-0 overflow-hidden rounded-[10px] bg-[#0d0d0b]">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== FIXTURE_BG_IMAGE) {
              e.currentTarget.src = FIXTURE_BG_IMAGE;
            }
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-[13px] font-medium text-white">{title}</h3>
        {durationLabel ? <p className="mt-1 text-[12px] text-[#A2A6AB]">{durationLabel}</p> : null}
      </div>
    </button>
  );
}
