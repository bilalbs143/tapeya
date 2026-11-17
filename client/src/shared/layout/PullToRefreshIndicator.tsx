import { cn } from '@/shared/lib/cn';
import { Spinner } from '@/shared/ui/Spinner';

import { PTR_REFRESH_OFFSET, PTR_THRESHOLD, pullProgress } from './pullToRefresh';

type PullToRefreshIndicatorProps = {
  pull: number;
  refreshing: boolean;
  threshold?: number | undefined;
  className?: string | undefined;
};

/**
 * Facebook-style spinner above the scroller content.
 * Host owns content `translateY`; this only paints the glyph in the revealed gap.
 */
export function PullToRefreshIndicator({
  pull,
  refreshing,
  threshold = PTR_THRESHOLD,
  className,
}: PullToRefreshIndicatorProps) {
  const visible = refreshing || pull > 2;
  const progress = refreshing ? 1 : pullProgress(pull, threshold);
  const height = refreshing ? PTR_REFRESH_OFFSET : Math.max(pull, 0);

  return (
    <div
      aria-hidden={!refreshing}
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-20 flex items-end justify-center overflow-hidden',
        className
      )}
      style={{ height }}
    >
      <span
        className={cn(
          'mb-2 grid place-items-center transition-opacity duration-150',
          visible ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          transform: refreshing ? undefined : `rotate(${progress * 180}deg)`,
        }}
      >
        <Spinner size="md" tone="brand" label={refreshing ? 'Refreshing' : 'Pull to refresh'} />
      </span>
    </div>
  );
}
