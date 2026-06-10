import { FIXTURE_BG_IMAGE } from '@/lib/constants/assets';
import { formatHighlightDate } from '@/pages/highlights/highlightsUtils';

export function HighlightCard({ highlight, onClick, disabled = false }) {
  const imageUrl = highlight.thumbnailUrl || FIXTURE_BG_IMAGE;
  const title = highlight.title ?? 'Highlight';
  const dateLabel = formatHighlightDate(highlight.publishedAt);

  return (
    <button
      type="button"
      onClick={() => !disabled && onClick?.(highlight)}
      disabled={disabled}
      className="bg-surface focus-visible:ring-brand flex w-full flex-col overflow-hidden rounded-[17px] text-left transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:opacity-90 disabled:cursor-default disabled:opacity-60"
    >
      <div className="bg-surface-deep h-[148px] w-full overflow-hidden">
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
      <div className="flex flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-[13px] font-bold text-white">{title}</h3>
        {dateLabel ? <p className="text-muted text-[12px]">{dateLabel}</p> : null}
      </div>
    </button>
  );
}
