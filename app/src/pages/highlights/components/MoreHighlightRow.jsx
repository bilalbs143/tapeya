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
      className="bg-surface focus-visible:ring-brand flex w-full items-center gap-3 rounded-[17px] p-3 text-left transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:opacity-90"
    >
      <div className="bg-surface-deep h-[72px] w-[112px] shrink-0 overflow-hidden rounded-[10px]">
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
        {durationLabel ? <p className="text-muted mt-1 text-[12px]">{durationLabel}</p> : null}
      </div>
    </button>
  );
}
