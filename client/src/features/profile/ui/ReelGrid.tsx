import type { Ref } from 'react';
import { Link } from 'react-router-dom';

import { reelRoutes } from '@/features/reels';

type ReelTile = {
  id: number;
  posterUrl: string | null;
  views: number;
};

type ReelGridProps = {
  reels: ReelTile[];
  className?: string | undefined;
  loadMoreRef?: Ref<HTMLDivElement> | undefined;
  canLoadMore?: boolean | undefined;
  loadingMore?: boolean | undefined;
};

export function ReelGrid({ reels, className, loadMoreRef, canLoadMore, loadingMore }: ReelGridProps) {
  return (
    <div className={className}>
      <ul className="grid grid-cols-3 gap-1.5">
        {reels.map((reel) => (
          <li key={reel.id}>
            <Link
              to={reelRoutes.detail(reel.id)}
              aria-label={`Reel, ${reel.views.toLocaleString()} views`}
              className="relative block aspect-reel-poster overflow-hidden rounded-icon bg-[image:var(--gradient-media-placeholder)]"
            >
              {reel.posterUrl ? <img src={reel.posterUrl} alt="" className="h-full w-full object-cover" /> : null}
              <span className="font-mono absolute right-1.5 bottom-1.5 text-4xs font-bold text-white/90">
                {reel.views.toLocaleString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {canLoadMore || loadingMore ? (
        <div ref={loadMoreRef} className="flex h-10 items-center justify-center" aria-hidden={!loadingMore}>
          {loadingMore ? (
            <span role="status" className="text-dim font-mono text-4xs font-semibold tracking-[.06em] uppercase">
              Loading More…
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
