import { Link } from 'react-router-dom';

import { CommentComposer, CommentThread } from '@/features/feed';
import { UploadVideoPlayer, YoutubeProxyPlayer } from '@/features/live';

import { PageDock, ScreenBar } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { PlayFillIcon } from '@/shared/ui/icons';
import { ImmersiveLandscapeStage } from '@/shared/ui/ImmersiveLandscapeStage';
import { MediaActionRow } from '@/shared/ui/MediaActionRow';
import { CommentRowSkeleton, EmptyState, ErrorState } from '@/shared/ui/states';

import { entertainmentPaths } from '../lib/entertainmentPaths';
import type { DramaEpisode } from '../model/schemas';
import { useEntertainmentEpisodeDetail } from './useEntertainmentEpisodeDetail';

type EntertainmentEpisodeDetailProps = {
  episode: DramaEpisode;
  routeSerialId: number;
};

/** Episode player, meta/actions, and comments column. */
export function EntertainmentEpisodeDetail({ episode, routeSerialId }: EntertainmentEpisodeDetailProps) {
  const {
    navigate,
    userId,
    me,
    composerInputRef,
    commentsLoading,
    commentsError,
    refetchComments,
    playing,
    playSession,
    landscape,
    deviceLandscape,
    exitLandscape,
    hasVideo,
    youtubeSrc,
    isUpload,
    poster,
    startPlayback,
    backTo,
    comments,
    commentsTotal,
    meta,
    draft,
    setDraft,
    replyTo,
    setReplyTo,
    sending,
    startReply,
    sendComment,
    toggleCommentLike,
    removeComment,
    loadReplies,
    episodeActions,
  } = useEntertainmentEpisodeDetail({ episode, routeSerialId });

  // Dock-fill: player + meta stay put; comments scroll; composer in footer.
  return (
    <PageDock
      body="fill"
      padKeyboard={!landscape}
      header={
        !landscape ? (
          <ScreenBar
            title="Episode"
            subtitle={episode.serial?.title ?? 'Entertainment'}
            onBack={() => navigate(backTo)}
          />
        ) : undefined
      }
      footer={
        !landscape ? (
          <CommentComposer
            className="shrink-0"
            user={{
              id: me?.id,
              name: me?.name ?? null,
              nickname: me?.nickname,
              avatarUrl: me?.avatarUrl ?? null,
            }}
            draft={draft}
            onDraftChange={setDraft}
            replyTo={replyTo}
            onCancelReply={() => {
              setReplyTo(null);
              setDraft('');
            }}
            onSend={() => void sendComment()}
            sending={sending}
            inputRef={composerInputRef}
          />
        ) : undefined
      }
      className={landscape ? 'overflow-visible' : undefined}
    >
      <div className={cn('relative shrink-0 overflow-hidden tab:rounded-field', landscape && 'overflow-visible')}>
        <ImmersiveLandscapeStage landscape={landscape} deviceLandscape={deviceLandscape} onExit={exitLandscape}>
          {!playing && poster ? (
            <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          {!playing && !poster ? (
            <div className="absolute inset-0 bg-[linear-gradient(150deg,var(--color-brand-deep),var(--color-page-deep))]" />
          ) : null}
          {playing && youtubeSrc ? (
            <YoutubeProxyPlayer key={playSession} src={youtubeSrc} title={episode.title} posterUrl={poster} />
          ) : null}
          {playing && isUpload && episode.videoUrl ? (
            <UploadVideoPlayer key={playSession} src={episode.videoUrl} posterUrl={poster} />
          ) : null}
          {!playing ? (
            <button
              type="button"
              onClick={startPlayback}
              disabled={!hasVideo}
              aria-label={hasVideo ? 'Play video' : 'No video available'}
              className="absolute inset-0 z-10 grid place-items-center bg-black/25 disabled:cursor-default"
            >
              {hasVideo ? (
                <span className="flex h-[54px] items-center gap-2.5 rounded-full bg-black/55 px-5 text-xs font-bold text-white backdrop-blur-[10px]">
                  <PlayFillIcon size="sm" className="h-4 w-4" />
                  Play Video
                </span>
              ) : null}
            </button>
          ) : null}
        </ImmersiveLandscapeStage>
      </div>

      {!landscape ? (
        <>
          <div className="border-border-subtle shrink-0 border-b px-4 py-3">
            <div className="flex flex-col gap-1">
              <h1 className="line-clamp-2 text-body-sm leading-snug font-extrabold text-ink">{episode.title}</h1>
              {meta ? <p className="text-dim text-2xs leading-normal">{meta}</p> : null}
              {episode.serial ? (
                <Link
                  to={entertainmentPaths.detail(episode.serial.id)}
                  className="text-brand-text pt-0.5 text-2xs font-bold"
                >
                  {episode.serial.title}
                </Link>
              ) : null}
              {episode.description ? (
                <p className="text-muted line-clamp-2 pt-0.5 text-xs leading-relaxed">{episode.description}</p>
              ) : null}
            </div>

            <MediaActionRow className="mt-3" actions={episodeActions} />

            {episode.prevEpisodeId != null || episode.nextEpisodeId != null ? (
              <div className="mt-3 flex gap-2">
                {episode.prevEpisodeId != null && Number.isFinite(routeSerialId) ? (
                  <Button asChild variant="secondary" size="sm" className="flex-1">
                    <Link to={entertainmentPaths.episode(routeSerialId, episode.prevEpisodeId)}>Previous</Link>
                  </Button>
                ) : null}
                {episode.nextEpisodeId != null && Number.isFinite(routeSerialId) ? (
                  <Button asChild size="sm" className="flex-1">
                    <Link to={entertainmentPaths.episode(routeSerialId, episode.nextEpisodeId)}>Next</Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <h2 className="font-mono text-muted flex shrink-0 items-center px-4 pt-3 pb-2 text-4xs font-bold tracking-eyebrow uppercase">
              Comments{commentsTotal > 0 ? ` · ${commentsTotal}` : ''}
            </h2>

            <div data-scroll-to-top className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3">
              {commentsLoading ? (
                <div className="flex flex-col gap-3.5 py-2" aria-busy="true" aria-label="Loading Comments">
                  {[0, 1, 2].map((i) => (
                    <CommentRowSkeleton key={i} />
                  ))}
                </div>
              ) : null}

              {commentsError ? (
                <ErrorState title="Couldn't Load Comments" onRetry={() => void refetchComments()} />
              ) : null}

              {!commentsLoading && !commentsError && comments.length === 0 ? (
                <EmptyState title="No Comments Yet" description="Be the first — composer stays focused and ready." />
              ) : null}

              {!commentsLoading && !commentsError && comments.length > 0 ? (
                <CommentThread
                  comments={comments}
                  viewerUserId={userId}
                  onReply={startReply}
                  onLike={(c) => void toggleCommentLike(c)}
                  onDelete={(c) => void removeComment(c)}
                  onLoadReplies={loadReplies}
                />
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </PageDock>
  );
}
