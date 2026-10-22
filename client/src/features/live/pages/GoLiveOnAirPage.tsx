import { Link, useParams } from 'react-router-dom';

import { getHttpStatus, isGoneError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/Button';
import { ErrorState, Skeleton } from '@/shared/ui/states';

import { liveRoutes } from '../routes';
import { GoLiveEndedView } from '../ui/GoLiveEndedView';
import { GoLiveOnAirStage } from '../ui/GoLiveOnAirStage';
import { GoLiveWebGate } from '../ui/GoLiveWebGate';
import { useGoLiveOnAirSession } from '../ui/useGoLiveOnAirSession';

/** On-air broadcast — native preview + RTMP; web shows RTMP credentials for OBS. */
export default function GoLiveOnAirPage() {
  const params = useParams();
  const streamId = Number(params.streamId);
  const valid = Number.isFinite(streamId) && streamId > 0;

  const {
    native,
    phase,
    sessionFinished,
    broadcast,
    broadcastQuery,
    streamTitle,
    ended,
    endReason,
    elapsed,
    networkQuality,
    isMuted,
    cameraFacing,
    orientation,
    needsLandscapeRotate,
    startState,
    endState,
    comments,
    draft,
    setDraft,
    commentsVisible,
    setCommentsVisible,
    chatEnabled,
    viewerLabel,
    floatingHearts,
    removeHeart,
    keyboardInset,
    me,
    handleStart,
    handleEnd,
    handleLeave,
    handleFlip,
    handleToggleMute,
    handleShare,
    handleSendComment,
    handleSendHeart,
    handleRetry,
  } = useGoLiveOnAirSession(streamId, valid);

  if (!valid) {
    return (
      <div className="bg-surface flex min-h-full flex-col px-4 py-8">
        <ErrorState title="Broadcast Not Found" />
      </div>
    );
  }

  const showLoading = phase === 'loading' || (broadcastQuery.isLoading && !broadcast && !sessionFinished && !ended);

  if (showLoading) {
    return (
      <div
        className="relative flex min-h-[100dvh] flex-col bg-transparent"
        aria-busy="true"
        aria-label="Loading Broadcast"
      >
        <div className="relative z-10 flex flex-col gap-2 px-3.5 pt-[max(10px,env(safe-area-inset-top))]">
          <Skeleton className="h-[22px] w-16 rounded-chip bg-white/15" />
          <Skeleton className="h-2.5 w-24 bg-white/10" />
        </div>
        <Skeleton className="min-h-0 w-full flex-1 rounded-none bg-transparent" />
        <div className="relative z-10 px-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">
          <Skeleton className="h-12 w-full rounded-field bg-white/15" />
        </div>
      </div>
    );
  }

  if (phase === 'permission_denied') {
    return (
      <div className="bg-surface flex min-h-[100dvh] flex-col">
        <GoLiveWebGate />
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 px-5 py-8 tab:hidden">
          <ErrorState
            title="Camera Access Needed"
            description="Allow camera and microphone to preview and go live."
            onRetry={() => void handleRetry()}
          />
          <Button asChild variant="secondary" className="mx-auto">
            <Link to={liveRoutes.goLive()}>Back to Go Live</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'plugin_unavailable') {
    return (
      <div className="bg-surface flex min-h-[100dvh] flex-col">
        <GoLiveWebGate />
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 px-5 py-8 tab:hidden">
          <ErrorState
            title="Broadcast Engine Missing"
            description="This build of Tapeya can’t open the camera yet. Update the app, or reinstall a native build that includes Go Live."
            onRetry={() => void handleRetry()}
          />
          <Button asChild variant="secondary" className="mx-auto">
            <Link to={liveRoutes.goLive()}>Back to Go Live</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!ended && !sessionFinished && !broadcast && (phase === 'error' || broadcastQuery.isError)) {
    if (isGoneError(broadcastQuery.error)) {
      return <GoLiveEndedView durationSec={elapsed} reason="ended" />;
    }
    const status = getHttpStatus(broadcastQuery.error);
    return (
      <div className="bg-surface flex min-h-full flex-col gap-4 px-4 py-8">
        <ErrorState
          title={status === 403 ? 'Not Your Broadcast' : "Couldn't Load This Broadcast"}
          description={status === 403 ? 'This stream belongs to someone else.' : 'Check your connection and try again.'}
          onRetry={() => void broadcastQuery.refetch()}
        />
        <Button asChild variant="secondary" className="mx-auto">
          <Link to={liveRoutes.goLive()}>Back to Go Live</Link>
        </Button>
        <GoLiveWebGate />
      </div>
    );
  }

  if (phase === 'ended' || ended) {
    const summary = ended ?? {
      durationSec: elapsed,
      peakViewers: 0,
      ...(endReason ? { reason: endReason } : {}),
    };
    return (
      <GoLiveEndedView durationSec={summary.durationSec} peakViewers={summary.peakViewers} reason={summary.reason} />
    );
  }

  if (phase === 'error') {
    return (
      <div className="bg-surface flex min-h-[100dvh] flex-col">
        <GoLiveWebGate />
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 px-5 py-8 tab:hidden">
          <ErrorState
            title="Broadcast Error"
            description="Something went wrong with the camera or stream. Try again."
            onRetry={() => void handleRetry()}
          />
          <Button variant="secondary" className="mx-auto" onClick={() => void handleLeave()}>
            Leave
          </Button>
        </div>
      </div>
    );
  }

  if (!broadcast) {
    return null;
  }

  return (
    <GoLiveOnAirStage
      native={native}
      phase={phase}
      broadcast={broadcast}
      title={streamTitle}
      orientation={orientation}
      elapsed={elapsed}
      networkQuality={networkQuality}
      isMuted={isMuted}
      cameraFacing={cameraFacing}
      needsLandscapeRotate={needsLandscapeRotate}
      startLoading={startState.isLoading}
      endLoading={endState.isLoading}
      comments={comments}
      draft={draft}
      onDraft={setDraft}
      onSendComment={() => void handleSendComment()}
      commentsVisible={commentsVisible}
      chatEnabled={chatEnabled}
      viewerLabel={viewerLabel}
      floatingHearts={floatingHearts}
      onHeartEnd={removeHeart}
      keyboardInset={keyboardInset}
      {...(me
        ? {
            composerUser: {
              id: me.id,
              name: me.name,
              nickname: me.nickname,
              avatarUrl: me.avatarUrl,
            },
          }
        : {})}
      onStart={handleStart}
      onEnd={handleEnd}
      onLeave={handleLeave}
      onFlip={handleFlip}
      onToggleMute={handleToggleMute}
      onShare={handleShare}
      onSendHeart={handleSendHeart}
      onToggleComments={() => setCommentsVisible((v) => !v)}
    />
  );
}
