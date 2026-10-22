import { ReportSheet } from '@/features/feed';

import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/IconButton';
import { ChevronDownIcon } from '@/shared/ui/icons';

import { ReelCommentSheet } from '../ui/ReelCommentSheet';
import { ReelsPageBody } from '../ui/ReelsPageBody';
import { ReelsPageChrome } from '../ui/ReelsPageChrome';
import { useReelsPage } from '../ui/useReelsPage';

/** Reels player — phone: vertical snap; desk: boxed 9:16 with prev/next. */
export default function ReelsPage() {
  const {
    desk,
    feedTab,
    selectTab,
    ordered,
    current,
    active,
    muted,
    setMuted,
    soundTip,
    setSoundTip,
    commentsForId,
    setCommentsForId,
    reportForId,
    setReportForId,
    scroller,
    isLoading,
    isError,
    refetch,
    skip,
    isOwn,
    slideHandlers,
  } = useReelsPage();

  const body = (
    <ReelsPageBody
      desk={desk}
      feedTab={feedTab}
      onSelectTab={selectTab}
      ordered={ordered}
      current={current}
      active={active}
      muted={muted}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      scroller={scroller}
      isOwn={isOwn}
      slideHandlers={slideHandlers}
    />
  );

  return (
    <div className={cn('relative h-full', desk ? 'bg-surface' : 'bg-page')}>
      {desk ? (
        ordered.length ? (
          <div className="flex h-full items-center justify-center gap-3 px-3 py-4">
            <div className="relative aspect-reel-poster h-full w-auto max-w-[calc(100%-3.75rem)] shrink-0 overflow-hidden rounded-card bg-black">
              {body}
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <IconButton
                label="Previous Reel"
                round
                size="lg"
                variant="outline"
                disabled={active <= 0}
                onClick={() => skip(-1)}
              >
                <ChevronDownIcon className="h-5 w-5 rotate-180" />
              </IconButton>
              <IconButton
                label="Next Reel"
                round
                size="lg"
                variant="outline"
                disabled={active >= ordered.length - 1}
                onClick={() => skip(1)}
              >
                <ChevronDownIcon className="h-5 w-5" />
              </IconButton>
            </div>
          </div>
        ) : (
          // Empty / error / loading stay on themed surface — not inside the black player card.
          body
        )
      ) : (
        <>
          {body}
          {ordered.length ? <ReelsPageChrome desk={false} feedTab={feedTab} onSelectTab={selectTab} /> : null}
          {ordered.length && muted && soundTip && active === 0 ? (
            <button
              type="button"
              onClick={() => {
                setMuted(false);
                setSoundTip(false);
              }}
              className="absolute top-[max(88px,calc(env(safe-area-inset-top)+78px))] left-4 z-10 flex min-h-[30px] items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 text-3xs font-bold text-white"
            >
              Tap for Sound
            </button>
          ) : null}
        </>
      )}

      <ReelCommentSheet
        reelId={current?.id ?? null}
        open={commentsForId != null && commentsForId === current?.id}
        onOpenChange={(open) => {
          if (!open) setCommentsForId(null);
          else if (current) setCommentsForId(current.id);
        }}
        commentsCount={current?.comments}
      />

      <ReportSheet
        subject="reel"
        postId={current?.id ?? null}
        open={reportForId != null && reportForId === current?.id}
        onOpenChange={(open) => {
          if (!open) setReportForId(null);
          else if (current) setReportForId(current.id);
        }}
      />
    </div>
  );
}
