/**
 * Shared 3-column reel poster grid for profile surfaces.
 */

import { Link } from 'react-router-dom';

import { formatCount } from '@/lib/format';

function EyeIcon({ className = 'h-3 w-3' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function HeartGlyph({ className = 'h-3 w-3' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * @param {{
 *   items: Array<{ id: number|string, posterUrl?: string|null, views?: number, likes?: number }>,
 *   emptyMessage?: string,
 *   emptyAction?: { to: string, label: string } | null,
 * }} props
 */
export function ReelPosterGrid({ items, emptyMessage = 'No reels yet.', emptyAction = null }) {
  if (!items?.length) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted text-sm">{emptyMessage}</p>
        {emptyAction ? (
          <Link to={emptyAction.to} className="text-brand mt-2 inline-block text-sm font-semibold">
            {emptyAction.label}
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {items.map((reel) => (
        <Link key={reel.id} to={`/reels/${reel.id}`} className="relative aspect-9/16 overflow-hidden bg-black/40">
          {reel.posterUrl ? (
            <img src={reel.posterUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="text-muted flex h-full w-full items-center justify-center text-[10px]">Reel</div>
          )}
          <span className="absolute top-1.5 left-1.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
            <PlayGlyph />
          </span>
          {(reel.views ?? 0) > 0 ? (
            <span className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded bg-black/55 px-1 py-0.5 text-[10px] text-white">
              <EyeIcon />
              {formatCount(reel.views)}
            </span>
          ) : null}
          {(reel.likes ?? 0) > 0 ? (
            <span className="absolute right-1 bottom-1 flex items-center gap-0.5 rounded bg-black/55 px-1 py-0.5 text-[10px] text-white">
              <HeartGlyph />
              {formatCount(reel.likes)}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

function PlayGlyph() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5L8 5.5Z" />
    </svg>
  );
}
