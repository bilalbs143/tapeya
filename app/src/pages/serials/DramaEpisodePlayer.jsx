import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import PostCommentsThread from '@/components/feed/PostCommentsThread';
import { IframeStreamPlayer } from '@/features/stream/adapters/IframeStreamPlayer';
import { useLiveBroadcastImmersiveDocument } from '@/features/stream/hooks/useLiveBroadcastImmersiveDocument';
import { IosLandscapeStreamChrome } from '@/features/stream/ios/IosLandscapeStreamChrome';
import { nativeUnderlaySurfaceClass } from '@/features/stream/ios/iosNativeStreamLayout';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CLOUDFRONT_APP_BASE, FIXTURE_BG_IMAGE } from '@/lib/constants/assets';
import { LG_MEDIA_QUERY } from '@/lib/constants/layout';
import {
  getLiveBroadcastShellClass,
  LIVE_BROADCAST_BOTTOM_OVERLAY,
  LIVE_BROADCAST_CONTROLS_OVERLAY_Z,
  LIVE_BROADCAST_IMMERSIVE_HEIGHT,
  LIVE_BROADCAST_IMMERSIVE_TOGGLE_Z,
  LIVE_BROADCAST_LANDSCAPE_SHELL_STYLE,
  LIVE_BROADCAST_LANDSCAPE_SHELL_Z,
  LIVE_BROADCAST_SHELL_HEIGHT,
  LIVE_BROADCAST_SHELL_HEIGHT_DESKTOP,
  LIVE_BROADCAST_TOGGLE_BTN,
} from '@/lib/constants/liveBroadcastLayout';
import { formatCount } from '@/lib/format';
import { buildDramaEpisodeShareUrl, shareLink } from '@/lib/share';
import { resolveYoutubeEmbed, usesIosNativeStreamPlayer } from '@/lib/utils/liveStreamUtils';
import { hideYoutubeStreamOverlay } from '@/native/youtubeStreamOverlay';
import { ThumbsUpIcon } from '@/pages/feed/PostCard';
import LandscapeRotatedStage from '@/pages/live/LandscapeRotatedStage';
import {
  useDislikeDramaEpisodeMutation,
  useGetDramaEpisodeQuery,
  useLikeDramaEpisodeMutation,
  useShareDramaEpisodeMutation,
} from '@/store/api/dramaApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { LoaderBlock } from '@/ui/Loader';

const maxMinIcon = `${CLOUDFRONT_APP_BASE}/images/icons/max-min-icon.svg`;
const feedShareIcon = `${CLOUDFRONT_APP_BASE}/images/icons/feed-share.svg`;

function ThumbsDownIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path
        d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"
        fill="none"
      />
    </svg>
  );
}

function EpisodeLandscapeExitToggle({ onClick }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="pointer-events-none fixed right-0 bottom-0 p-4 pb-[calc(env(safe-area-inset-bottom)+12px)]"
      style={{ zIndex: LIVE_BROADCAST_IMMERSIVE_TOGGLE_Z }}
    >
      <button
        type="button"
        onClick={onClick}
        className={`pointer-events-auto touch-manipulation ${LIVE_BROADCAST_TOGGLE_BTN}`}
        aria-label="Rotate to portrait"
      >
        <img src={maxMinIcon} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
      </button>
    </div>,
    document.body,
  );
}

export default function DramaEpisodePlayer() {
  const { serialId, episodeId } = useParams();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const id = Number(episodeId);
  const { data: episode, isLoading, isError, refetch } = useGetDramaEpisodeQuery(id, { skip: !id });
  const [likeEpisode, { isLoading: liking }] = useLikeDramaEpisodeMutation();
  const [dislikeEpisode, { isLoading: disliking }] = useDislikeDramaEpisodeMutation();
  const [shareEpisode] = useShareDramaEpisodeMutation();
  const [counts, setCounts] = useState({ likes_count: 0, dislikes_count: 0, shares_count: 0, comments_count: 0 });
  const [myReaction, setMyReaction] = useState(null);
  const [playingEpisodeId, setPlayingEpisodeId] = useState(null);
  const [isLandscape, setIsLandscape] = useState(false);

  const isPlaying = playingEpisodeId != null && String(playingEpisodeId) === String(episodeId);
  const isYouTube = episode?.videoSource === 'youtube';
  const isDirectVideo = episode?.videoSource === 'upload';
  const hasVideo = Boolean(episode?.videoUrl);
  const bannerImage = episode?.thumbnail || episode?.serial?.poster || FIXTURE_BG_IMAGE;

  const usesIosNativePlayer = useMemo(() => {
    if (!isYouTube || !episode?.videoUrl || !usesIosNativeStreamPlayer()) return false;
    const { iframeSrc, usesProxy } = resolveYoutubeEmbed(episode.videoUrl, null, { showControls: true });
    return usesProxy && Boolean(iframeSrc);
  }, [isYouTube, episode?.videoUrl]);

  const immersiveMobileLandscape = Boolean(isPlaying && isLandscape && !isDesktop);
  const nativeInteractive = Boolean(usesIosNativePlayer && isPlaying && !isDesktop && !immersiveMobileLandscape);
  const isIosNativeLandscape = Boolean(usesIosNativePlayer && immersiveMobileLandscape);
  const isIosNativeUnderlay = isIosNativeLandscape;
  const surfaceBg = nativeUnderlaySurfaceClass(isIosNativeUnderlay);

  useLiveBroadcastImmersiveDocument(immersiveMobileLandscape, isIosNativeUnderlay);

  useLayoutEffect(() => {
    setIsLandscape(false);
    setPlayingEpisodeId(null);
    void hideYoutubeStreamOverlay();
  }, [episodeId]);

  useEffect(() => {
    if (!isPlaying || isDesktop) {
      setIsLandscape(false);
    }
  }, [isPlaying, isDesktop]);

  useEffect(() => {
    return () => {
      void hideYoutubeStreamOverlay();
    };
  }, []);

  useEffect(() => {
    if (!episode) return;
    setMyReaction(episode.myReaction ?? null);
    setCounts({
      likes_count: episode.likesCount ?? 0,
      dislikes_count: episode.dislikesCount ?? 0,
      shares_count: episode.sharesCount ?? 0,
      comments_count: episode.commentsCount ?? 0,
    });
  }, [episode]);

  const toggleLandscape = useCallback(() => {
    if (!isPlaying || isDesktop) return;
    setIsLandscape((prev) => !prev);
  }, [isPlaying, isDesktop]);

  async function handleLike() {
    if (!episode || liking || disliking || myReaction === 'like') return;
    const prevReaction = myReaction;
    const prevCounts = counts;
    setMyReaction('like');
    setCounts((prev) => ({
      ...prev,
      likes_count: prev.likes_count + 1,
      dislikes_count: prevReaction === 'dislike' ? Math.max(0, prev.dislikes_count - 1) : prev.dislikes_count,
    }));
    try {
      const result = await likeEpisode(episode.id).unwrap();
      setCounts((prev) => ({
        ...prev,
        likes_count: result.likes_count ?? 0,
        dislikes_count: result.dislikes_count ?? 0,
        shares_count: result.shares_count ?? prev.shares_count,
        comments_count: result.comments_count ?? prev.comments_count,
      }));
      setMyReaction(result.my_reaction ?? null);
    } catch {
      setMyReaction(prevReaction);
      setCounts(prevCounts);
    }
  }

  async function handleDislike() {
    if (!episode || liking || disliking || myReaction === 'dislike') return;
    const prevReaction = myReaction;
    const prevCounts = counts;
    setMyReaction('dislike');
    setCounts((prev) => ({
      ...prev,
      dislikes_count: prev.dislikes_count + 1,
      likes_count: prevReaction === 'like' ? Math.max(0, prev.likes_count - 1) : prev.likes_count,
    }));
    try {
      const result = await dislikeEpisode(episode.id).unwrap();
      setCounts((prev) => ({
        ...prev,
        likes_count: result.likes_count ?? 0,
        dislikes_count: result.dislikes_count ?? 0,
        shares_count: result.shares_count ?? prev.shares_count,
        comments_count: result.comments_count ?? prev.comments_count,
      }));
      setMyReaction(result.my_reaction ?? null);
    } catch {
      setMyReaction(prevReaction);
      setCounts(prevCounts);
    }
  }

  async function handleShare() {
    if (!episode || !serialId) return;
    const channel = await shareLink({
      title: episode.title,
      text: episode.description || episode.title,
      url: buildDramaEpisodeShareUrl(serialId, episode.id),
    });
    if (!channel) return;
    try {
      const result = await shareEpisode(episode.id).unwrap();
      setCounts((prev) => ({
        ...prev,
        shares_count: result.shares_count ?? prev.shares_count + 1,
      }));
    } catch {
      // Share sheet succeeded; ignore analytics failure.
    }
  }

  if (!id || (!isLoading && (isError || !episode))) {
    return (
      <div className="min-h-screen bg-black">
        <AppSubpageHeader title="EPISODE" onBack={() => navigate(serialId ? `/serials/${serialId}` : '/serials')} />
        <Container>
          {isError ? (
            <ListError message="Could not load episode." onRetry={() => refetch()} />
          ) : (
            <ListEmpty
              title="Episode Not Found."
              action={
                <Button type="button" variant="orange" onClick={() => navigate(serialId ? `/serials/${serialId}` : '/serials')}>
                  Back to Serial
                </Button>
              }
            />
          )}
        </Container>
      </div>
    );
  }

  const showRotateToggle = isPlaying && !isDesktop;
  const landscapeShellClass = getLiveBroadcastShellClass(true, surfaceBg);
  const landscapeShellStyle = {
    ...LIVE_BROADCAST_LANDSCAPE_SHELL_STYLE,
    zIndex: LIVE_BROADCAST_LANDSCAPE_SHELL_Z,
    height: LIVE_BROADCAST_IMMERSIVE_HEIGHT,
  };

  const player =
    isPlaying && isYouTube ? (
      <IframeStreamPlayer
        key={episodeId}
        playback={{ mode: 'iframe', embed_url: episode.videoUrl }}
        fill
        isLandscape={immersiveMobileLandscape}
        showControls
        interactive={nativeInteractive}
        posterUrl={bannerImage}
        title={episode.title}
        className="h-full w-full"
      />
    ) : isPlaying && isDirectVideo ? (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <video
          key={episodeId}
          src={episode.videoUrl}
          controls
          playsInline
          autoPlay
          className="max-h-full max-w-full object-contain"
          poster={bannerImage}
        >
          <track kind="captions" />
        </video>
      </div>
    ) : (
      <>
        <img
          src={bannerImage}
          alt={episode?.title || 'Episode'}
          className="h-full w-full object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== FIXTURE_BG_IMAGE) {
              e.currentTarget.src = FIXTURE_BG_IMAGE;
            }
          }}
        />
        {hasVideo ? (
          <button
            type="button"
            onClick={() => setPlayingEpisodeId(episodeId)}
            className="absolute inset-0 flex items-center justify-center transition-opacity active:opacity-70"
            aria-label="Play episode"
          >
            <svg viewBox="0 0 80 80" className="h-16 w-16 drop-shadow-lg" aria-hidden>
              <circle cx="40" cy="40" r="40" fill="black" fillOpacity="0.45" />
              <polygon points="32,24 32,56 60,40" fill="white" />
            </svg>
          </button>
        ) : null}
      </>
    );

  const playerStage = (
    <div className={`relative h-full w-full overflow-hidden ${surfaceBg}`}>
      {isIosNativeLandscape ? <IosLandscapeStreamChrome onToggleLandscape={toggleLandscape} /> : null}

      <LandscapeRotatedStage
        rotated={immersiveMobileLandscape}
        iosNativeLandscape={isIosNativeLandscape}
        iosNativeUnderlay={isIosNativeUnderlay}
      >
        <div className={`relative size-full overflow-hidden ${surfaceBg}`}>
          <div className="absolute inset-0">{player}</div>

          {showRotateToggle && !immersiveMobileLandscape && !nativeInteractive ? (
            <div className={LIVE_BROADCAST_BOTTOM_OVERLAY} style={{ zIndex: LIVE_BROADCAST_CONTROLS_OVERLAY_Z }}>
              <div className="pointer-events-auto flex justify-end">
                <button
                  type="button"
                  onClick={toggleLandscape}
                  className={LIVE_BROADCAST_TOGGLE_BTN}
                  aria-label="Rotate to landscape"
                >
                  <img src={maxMinIcon} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </LandscapeRotatedStage>

      {showRotateToggle && immersiveMobileLandscape && !isIosNativeLandscape ? (
        <EpisodeLandscapeExitToggle onClick={toggleLandscape} />
      ) : null}
    </div>
  );

  if (immersiveMobileLandscape) {
    return (
      <div className={landscapeShellClass} style={landscapeShellStyle}>
        {playerStage}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col overflow-hidden ${isIosNativeUnderlay ? surfaceBg : 'bg-black'}`}
      style={{ height: isDesktop ? LIVE_BROADCAST_SHELL_HEIGHT_DESKTOP : LIVE_BROADCAST_SHELL_HEIGHT }}
    >
      <AppSubpageHeader title={episode ? `EP ${episode.episodeNumber}` : 'EPISODE'} />

      <div className={`relative mt-4 aspect-video w-full shrink-0 overflow-hidden ${surfaceBg}`}>
        {isLoading && !episode ? (
          <div className="grid h-full place-items-center">
            <LoaderBlock label="Loading episode" />
          </div>
        ) : (
          playerStage
        )}
      </div>

      {showRotateToggle && nativeInteractive ? (
        <div className="flex shrink-0 justify-end bg-black px-4 py-2">
          <button type="button" onClick={toggleLandscape} className={LIVE_BROADCAST_TOGGLE_BTN} aria-label="Rotate to landscape">
            <img src={maxMinIcon} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
          </button>
        </div>
      ) : null}

      {episode ? (
        <div className="flex min-h-0 flex-1 flex-col bg-black">
          <Container fullWidth className="shrink-0 px-4! py-0!">
            <div className="mt-3 flex w-full items-start justify-between gap-3 pb-3">
              <div className="min-w-0 flex-1">
                <h1 className="line-clamp-2 text-[15px] leading-snug font-bold text-white">{episode.title}</h1>
                <p className="text-muted mt-2.5 text-[13px]">
                  {[episode.serial?.title, `EP ${episode.episodeNumber}`, episode.duration].filter(Boolean).join(' · ')}
                </p>
                {episode.description ? (
                  <p className="mt-2.5 line-clamp-2 text-[13px] leading-snug text-white/90">{episode.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1.5 self-center">
                <button
                  type="button"
                  onClick={() => void handleLike()}
                  disabled={liking || disliking}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-opacity active:opacity-80 disabled:opacity-60 ${
                    myReaction === 'like' ? 'bg-brand text-black' : 'bg-surface text-white'
                  }`}
                  aria-label={`Like. ${formatCount(counts.likes_count)} likes`}
                  aria-pressed={myReaction === 'like'}
                >
                  <ThumbsUpIcon filled={myReaction === 'like'} className="h-4 w-4" />
                  <span className="text-[12px] font-medium tabular-nums">{formatCount(counts.likes_count)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleDislike()}
                  disabled={liking || disliking}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-opacity active:opacity-80 disabled:opacity-60 ${
                    myReaction === 'dislike' ? 'bg-brand text-black' : 'bg-surface text-white'
                  }`}
                  aria-label={`Dislike. ${formatCount(counts.dislikes_count)} dislikes`}
                  aria-pressed={myReaction === 'dislike'}
                >
                  <ThumbsDownIcon className="h-4 w-4" />
                  <span className="text-[12px] font-medium tabular-nums">{formatCount(counts.dislikes_count)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="bg-surface flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-white transition-opacity active:opacity-80"
                  aria-label={`Share. ${formatCount(counts.shares_count)} shares`}
                >
                  <img src={feedShareIcon} alt="" className="h-4 w-4 brightness-0 invert" aria-hidden />
                  <span className="text-[12px] font-medium tabular-nums">{formatCount(counts.shares_count)}</span>
                </button>
              </div>
            </div>
          </Container>

          <div className="border-surface-border flex min-h-0 flex-1 flex-col border-t">
            <PostCommentsThread
              postId={id}
              source="drama"
              enabled={Boolean(id)}
              showHeader={false}
              loginFrom={`/serials/${serialId}/e/${id}`}
              render={({ list, composer, total }) => (
                <>
                  <div className="flex shrink-0 items-center justify-between gap-2 px-4 pt-3 pb-2">
                    <h2 className="text-[15px] font-bold text-white">
                      Comments{typeof total === 'number' ? ` (${formatCount(total)})` : ''}
                    </h2>
                    <div className="flex items-center gap-1 text-[12px] font-semibold text-white">
                      Top Comments
                      <svg
                        className="text-muted"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">{list}</div>
                  <div className="border-border bg-surface/98 shrink-0 border-t px-4 py-3">{composer}</div>
                </>
              )}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
