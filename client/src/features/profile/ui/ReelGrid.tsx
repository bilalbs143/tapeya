import { Link } from 'react-router-dom';

import { reelRoutes } from '@/features/reels';

import { cn } from '@/shared/lib/cn';

type ReelTile = {
  id: number;
  posterUrl: string | null;
  views: number;
};

type ReelGridProps = {
  reels: ReelTile[];
  className?: string | undefined;
};

export function ReelGrid({ reels, className }: ReelGridProps) {
  return (
    <ul className={cn('grid grid-cols-3 gap-1.5', className)}>
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
  );
}
