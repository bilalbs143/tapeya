import type { RefObject } from 'react';
import { Link } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { isInPlayerWindow, isNextPlayerSlide } from '../lib/reelPlayerWindow';
import { reelsEmptyCopy } from '../lib/reelsEmptyCopy';
import type { Reel, ReelTab } from '../model/schemas';
import { ReelSlide } from './ReelSlide';
import { ReelsPageChrome } from './ReelsPageChrome';
import type { useReelsPage } from './useReelsPage';

type SlideHandlers = ReturnType<typeof useReelsPage>['slideHandlers'];

type ReelsPageBodyProps = {
  desk: boolean;
  feedTab: ReelTab;
  onSelectTab: (tab: ReelTab) => void;
  ordered: Reel[];
  current: Reel | undefined;
  active: number;
  muted: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  scroller: RefObject<HTMLDivElement | null>;
  isOwn: (reel: Reel) => boolean;
  slideHandlers: SlideHandlers;
};

/** Loading / empty / desk card / phone snap scroller for ReelsPage. */
export function ReelsPageBody({
  desk,
  feedTab,
  onSelectTab,
  ordered,
  current,
  active,
  muted,
  isLoading,
  isError,
  onRetry,
  scroller,
  isOwn,
  slideHandlers,
}: ReelsPageBodyProps) {
  if (isLoading && !ordered.length) {
    return <Skeleton className="h-full w-full rounded-none" />;
  }
  if (isError && !ordered.length) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <ErrorState title="Couldn't Load Reels" onRetry={onRetry} />
      </div>
    );
  }
  if (!ordered.length) {
    const copy = reelsEmptyCopy(feedTab);
    return (
      <div className="flex h-full items-center justify-center px-6">
        <EmptyState
          title={copy.title}
          description={copy.description}
          action={
            feedTab === 'explore' ? (
              <Button asChild variant="secondary">
                <Link to={APP_PATHS.createReel}>Upload a Reel</Link>
              </Button>
            ) : null
          }
        />
      </div>
    );
  }

  if (desk) {
    if (!current) return null;
    const nextReel = ordered[active + 1];
    return (
      <div className="relative h-full w-full">
        <ReelSlide
          reel={current}
          active
          inPlayerWindow
          muted={muted}
          isOwn={isOwn(current)}
          desk
          {...slideHandlers(current)}
        />
        {/* Off-screen next player so desk/keyboard skip is already primed. */}
        {nextReel ? (
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-0" aria-hidden>
            <ReelSlide
              reel={nextReel}
              active={false}
              inPlayerWindow
              isNext
              muted
              chromeHidden
              isOwn={isOwn(nextReel)}
              desk
              {...slideHandlers(nextReel)}
            />
          </div>
        ) : null}
        <ReelsPageChrome desk feedTab={feedTab} onSelectTab={onSelectTab} />
      </div>
    );
  }

  return (
    <div ref={scroller} data-scroll-to-top className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto">
      {ordered.map((reel, index) => (
        <div key={reel.id} data-index={index} className="h-full snap-start">
          <ReelSlide
            reel={reel}
            active={index === active}
            isNext={isNextPlayerSlide(index, active)}
            inPlayerWindow={isInPlayerWindow(index, active)}
            muted={muted}
            isOwn={isOwn(reel)}
            {...slideHandlers(reel)}
          />
        </div>
      ))}
    </div>
  );
}
