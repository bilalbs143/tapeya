import { UploadVideoPlayer, YoutubeProxyPlayer } from '@/features/live';

import { PageDock, ScreenBar } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { PlayFillIcon, RotateIcon, ShareIcon, ThumbsDownIcon, ThumbsUpIcon } from '@/shared/ui/icons';
import { ImmersiveLandscapeStage } from '@/shared/ui/ImmersiveLandscapeStage';
import { type MediaActionItem, MediaActionRow } from '@/shared/ui/MediaActionRow';

import { compactCount, type Highlight } from '../model/schemas';
import { HighlightThumb } from './HighlightThumb';
import { useHighlightDetail } from './useHighlightDetail';

type HighlightDetailBodyProps = {
  clip: Highlight;
  related: Highlight[];
};

/** Player stage, reactions, and related list for HighlightDetailPage. */
export function HighlightDetailBody({ clip, related }: HighlightDetailBodyProps) {
  const flow = useHighlightDetail(clip);
  const {
    playing,
    playSession,
    landscape,
    deviceLandscape,
    exitLandscape,
    likes,
    dislikes,
    myReaction,
    reacting,
    hasVideo,
    youtubeSrc,
    isUpload,
    shareLabel,
    startPlayback,
    handleLike,
    handleDislike,
    handleShare,
    onEnterLandscape,
    goList,
    openRelated,
  } = flow;

  const highlightActions: MediaActionItem[] = [
    {
      key: 'like',
      label: compactCount(likes),
      ariaLabel: 'Like',
      onClick: () => void handleLike(),
      disabled: reacting,
      active: myReaction === 'like',
      icon: <ThumbsUpIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} filled={myReaction === 'like'} />,
    },
    {
      key: 'dislike',
      label: compactCount(dislikes),
      ariaLabel: 'Dislike',
      onClick: () => void handleDislike(),
      disabled: reacting,
      active: myReaction === 'dislike',
      icon: <ThumbsDownIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} filled={myReaction === 'dislike'} />,
    },
    {
      key: 'share',
      label: shareLabel,
      ariaLabel: 'Share',
      onClick: () => void handleShare(),
      disabled: reacting,
      icon: <ShareIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />,
    },
    {
      key: 'full',
      label: 'Full',
      ariaLabel: 'Rotate to Landscape',
      onClick: onEnterLandscape,
      icon: <RotateIcon className="h-3.5 w-3.5 shrink-0" />,
      className: 'tab:hidden',
    },
  ];

  // Dock-fill: player + meta stay put; only “More Highlights” scrolls inside.
  // BottomNav hidden (same as watch/episode) — below-fold column owns home-indicator inset.
  return (
    <PageDock
      body="fill"
      padKeyboard={!landscape}
      header={!landscape ? <ScreenBar title="Highlight" subtitle="Match Clip" onBack={goList} /> : undefined}
      className={landscape ? 'overflow-visible' : undefined}
    >
      <div className={cn('flex min-h-0 flex-1 flex-col', landscape ? 'overflow-visible' : 'overflow-hidden')}>
        <div className={cn('relative shrink-0 overflow-hidden tab:rounded-field', landscape && 'overflow-visible')}>
          <ImmersiveLandscapeStage landscape={landscape} deviceLandscape={deviceLandscape} onExit={exitLandscape}>
            {!playing && clip.thumbnailUrl ? (
              <img src={clip.thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : null}
            {!playing && !clip.thumbnailUrl ? (
              <div className="absolute inset-0 bg-[linear-gradient(150deg,var(--color-brand-deep),var(--color-page-deep))]" />
            ) : null}
            {playing && youtubeSrc ? (
              <YoutubeProxyPlayer key={playSession} src={youtubeSrc} title={clip.title} posterUrl={clip.thumbnailUrl} />
            ) : null}
            {playing && isUpload && clip.videoUrl ? (
              <UploadVideoPlayer key={playSession} src={clip.videoUrl} posterUrl={clip.thumbnailUrl} />
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
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-[max(1rem,var(--safe-above-keyboard))]">
            <div className="border-border-subtle shrink-0 border-b px-4 py-3">
              <div className="flex flex-col gap-1">
                <h1 className="line-clamp-2 text-body-sm leading-snug font-extrabold text-ink">{clip.title}</h1>
                {clip.description ? (
                  <p className="text-muted line-clamp-2 pt-0.5 text-xs leading-relaxed">{clip.description}</p>
                ) : null}
              </div>
              <MediaActionRow className="mt-3" actions={highlightActions} />
            </div>

            {related.length ? (
              <section className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-3">
                <h2 className="font-mono text-muted shrink-0 pb-2.5 text-4xs font-bold tracking-eyebrow uppercase">
                  More Highlights
                </h2>
                <ul data-scroll-to-top className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pb-2">
                  {related.map((c) => (
                    <li key={c.id} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => openRelated(c.id)}
                        className="border-border-subtle bg-surface hover:border-border flex w-full items-center gap-3 rounded-panel border p-2.5 text-left"
                      >
                        <HighlightThumb src={c.thumbnailUrl} className="h-[46px] w-[78px] shrink-0 rounded-icon" />
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 text-xs leading-snug font-bold text-ink">{c.title}</span>
                          {c.duration ? (
                            <span className="text-dim mt-0.5 block text-3xs leading-normal">{c.duration}</span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </PageDock>
  );
}
