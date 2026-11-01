import { PageDock, ScreenBar } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { ImmersiveLandscapeStage } from '@/shared/ui/ImmersiveLandscapeStage';
import { LiveBadge } from '@/shared/ui/LiveBadge';

import type { LiveStream } from '../model/schemas';
import { ChatDock } from './ChatDock';
import { FloatingHeartsOverlay } from './FloatingHeartsOverlay';
import { StreamActionRow } from './StreamActionRow';
import { StreamHostRow } from './StreamHostRow';
import { StreamPlayer } from './StreamPlayer';
import type { useWatchPage } from './useWatchPage';

type WatchPageFlow = ReturnType<typeof useWatchPage>;

type WatchPageBodyProps = {
  flow: WatchPageFlow;
  stream: LiveStream;
};

/** Player stage, host row, actions, and chat dock for WatchPage. */
export function WatchPageBody({ flow, stream }: WatchPageBodyProps) {
  const {
    isAuthed,
    me,
    landscape,
    deviceLandscape,
    enterLandscape,
    exitLandscape,
    allowRotate,
    draft,
    setDraft,
    floatingHearts,
    removeHeart,
    canChat,
    comments,
    poster,
    isLive,
    statusLabel,
    viewerLabel,
    viewerCount,
    goLiveList,
    goLoginToWatch,
    send,
    heart,
    handleShare,
  } = flow;

  const statusOverlay = (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center bg-gradient-to-b from-black/55 to-transparent px-3 pt-3 pb-8">
      {stream.status === 'live' ? (
        <LiveBadge
          variant="media"
          viewers={viewerLabel}
          aria-label={viewerLabel ? `Live · ${viewerCount} watching` : 'Live'}
        />
      ) : statusLabel ? (
        <span className="font-mono inline-flex items-center rounded-full bg-black/55 px-1.5 py-0.5 text-4xs leading-none font-bold tracking-[.12em] text-white/90 uppercase backdrop-blur-[10px]">
          {statusLabel}
        </span>
      ) : null}
    </div>
  );

  return (
    <PageDock
      body="fill"
      padKeyboard={!landscape}
      header={
        !landscape ? (
          <ScreenBar title={stream.title} subtitle={stream.host.name} onBack={goLiveList} slideTitle />
        ) : undefined
      }
      className={landscape ? 'overflow-visible' : undefined}
    >
      <div className={cn('flex min-h-0 flex-1 flex-col', landscape ? 'overflow-visible' : 'overflow-hidden')}>
        <div className={cn('relative shrink-0 overflow-hidden tab:rounded-field', landscape && 'overflow-visible')}>
          <ImmersiveLandscapeStage
            landscape={landscape}
            deviceLandscape={deviceLandscape}
            onExit={exitLandscape}
            overlay={landscape ? statusOverlay : null}
          >
            <StreamPlayer
              status={String(stream.status)}
              playback={stream.playback}
              posterUrl={poster}
              fill
              title={stream.title}
            />
          </ImmersiveLandscapeStage>
          {!landscape ? statusOverlay : null}
          {!landscape ? <FloatingHeartsOverlay hearts={floatingHearts} onHeartEnd={removeHeart} /> : null}
          {!landscape && !isAuthed && stream.status === 'live' && !stream.playback ? (
            <div className="absolute inset-0 z-10 grid place-items-center bg-black/55 px-6 text-center">
              <div>
                <p className="text-sm font-extrabold text-white">Sign In to Watch</p>
                <Button className="mt-3" onClick={goLoginToWatch}>
                  Sign In
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {!landscape ? (
          <>
            <div className="border-border-subtle shrink-0 border-b px-4 py-3">
              <StreamHostRow
                host={stream.host}
                isLive={isLive}
                title={stream.title}
                description={stream.description || undefined}
                linkProfile
              />
              <StreamActionRow
                className="mt-3"
                onShare={() => void handleShare(stream)}
                onHeart={heart}
                onRotate={allowRotate ? enterLandscape : undefined}
              />
            </div>

            <ChatDock
              comments={comments}
              draft={draft}
              onDraft={setDraft}
              onSend={() => void send()}
              canChat={canChat}
              user={{
                id: me?.id,
                name: me?.name ?? null,
                nickname: me?.nickname,
                avatarUrl: me?.avatarUrl ?? null,
              }}
              className="min-h-0 flex-1"
            />
          </>
        ) : null}
      </div>
    </PageDock>
  );
}
