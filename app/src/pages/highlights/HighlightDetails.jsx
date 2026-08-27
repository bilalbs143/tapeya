import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
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
import { buildHighlightShareUrl, shareLink } from '@/lib/share';
import { resolveYoutubeEmbed, usesIosNativeStreamPlayer } from '@/lib/utils/liveStreamUtils';
import { hideYoutubeStreamOverlay } from '@/native/youtubeStreamOverlay';
import { ThumbsUpIcon } from '@/pages/feed/PostCard';
import LandscapeRotatedStage from '@/pages/live/LandscapeRotatedStage';
import {
  useDislikeHighlightMutation,
  useGetHighlightQuery,
  useGetHighlightsQuery,
  useLikeHighlightMutation,
  useShareHighlightMutation,
} from '@/store/api/highlightApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty } from '@/ui/ListState';
import { LoaderBlock } from '@/ui/Loader';

import { MoreHighlightRow } from './components/MoreHighlightRow';
import {
  formatHighlightDate,
  formatHighlightDuration,
  getHighlightTitle,
  getMoreHighlights,
  isValidHighlightId,
} from './highlightsUtils';

const feedShareIcon = `${CLOUDFRONT_APP_BASE}/images/icons/feed-share.svg`;
const maxMinIcon = `${CLOUDFRONT_APP_BASE}/images/icons/max-min-icon.svg`;

function engagementFromHighlight(h) {
  if (!h) {
    return { likes_count: 0, dislikes_count: 0, shares_count: 0, my_reaction: null };
  }
  return {
    likes_count: h.likes_count ?? h.likesCount ?? 0,
    dislikes_count: h.dislikes_count ?? h.dislikesCount ?? 0,
    shares_count: h.shares_count ?? h.sharesCount ?? 0,
    my_reaction: h.my_reaction ?? h.myReaction ?? null,
  };
}

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

/** Web landscape exit — same portal as live `LandscapeExitToggle`. */
function HighlightLandscapeExitToggle({ onClick }) {
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

export default function HighlightDetails() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const { highlightId } = useParams();
  const location = useLocation();
  const stateHighlight = location.state?.highlight;
  const hasValidId = isValidHighlightId(highlightId);

  const { data: apiHighlight, isLoading } = useGetHighlightQuery(highlightId, { skip: !hasValidId });

  // Prefer API; keep list navigation state even if the detail request errors (transient / offline).
  const highlight = apiHighlight ?? stateHighlight ?? null;

  const { data: allHighlights = [] } = useGetHighlightsQuery({ per_page: 50 });
  const moreHighlights = useMemo(() => getMoreHighlights(allHighlights, highlight?.id), [allHighlights, highlight?.id]);

  const [likeHighlight, { isLoading: isLiking }] = useLikeHighlightMutation();
  const [dislikeHighlight, { isLoading: isDisliking }] = useDislikeHighlightMutation();
  const [shareHighlight] = useShareHighlightMutation();

  const initialEngagement = engagementFromHighlight(stateHighlight);
  const [counts, setCounts] = useState({
    likes_count: initialEngagement.likes_count,
    dislikes_count: initialEngagement.dislikes_count,
    shares_count: initialEngagement.shares_count,
  });
  const [myReaction, setMyReaction] = useState(initialEngagement.my_reaction);
  // Tie playback to the current id so switching highlights stops immediately (no useEffect lag).
  const [playingHighlightId, setPlayingHighlightId] = useState(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const isPlaying = playingHighlightId != null && String(playingHighlightId) === String(highlightId);

  const isYouTube = highlight?.videoSource === 'youtube';
  const isDirectVideo = highlight?.videoSource === 'upload';
  const hasVideo = Boolean(highlight?.videoUrl);

  const usesIosNativePlayer = useMemo(() => {
    if (!isYouTube || !highlight?.videoUrl || !usesIosNativeStreamPlayer()) return false;
    const { iframeSrc, usesProxy } = resolveYoutubeEmbed(highlight.videoUrl, null, { showControls: true });
    return usesProxy && Boolean(iframeSrc);
  }, [isYouTube, highlight?.videoUrl]);

  // Match live: immersive rotate for any non-desktop width (phones + tablets).
  const immersiveMobileLandscape = Boolean(isPlaying && isLandscape && !isDesktop);
  // Portrait iOS: native above Capacitor so YouTube play/pause/seek work.
  // Landscape iOS: underlay so IosLandscapeStreamChrome stays tappable.
  const nativeInteractive = Boolean(usesIosNativePlayer && isPlaying && !isDesktop && !immersiveMobileLandscape);
  const isIosNativeLandscape = Boolean(usesIosNativePlayer && immersiveMobileLandscape);
  // Same as landscape — portrait interactive path does not underlay.
  const isIosNativeUnderlay = isIosNativeLandscape;
  const surfaceBg = nativeUnderlaySurfaceClass(isIosNativeUnderlay);

  useLiveBroadcastImmersiveDocument(immersiveMobileLandscape, isIosNativeUnderlay);

  // Stop native audio/video as soon as the route id changes (before paint).
  useLayoutEffect(() => {
    setIsLandscape(false);
    void hideYoutubeStreamOverlay();
  }, [highlightId]);

  useEffect(() => {
    if (!isPlaying || isDesktop) {
      setIsLandscape(false);
    }
  }, [isPlaying, isDesktop]);

  // Leaving the page — ensure the native underlay is torn down.
  useEffect(() => {
    return () => {
      void hideYoutubeStreamOverlay();
    };
  }, []);

  useEffect(() => {
    const source = apiHighlight ?? stateHighlight;
    if (!source) return;
    const next = engagementFromHighlight(source);
    setCounts({
      likes_count: next.likes_count,
      dislikes_count: next.dislikes_count,
      shares_count: next.shares_count,
    });
    setMyReaction(next.my_reaction);
  }, [apiHighlight, stateHighlight]);

  const toggleLandscape = useCallback(() => {
    if (!isPlaying || isDesktop) return;
    setIsLandscape((prev) => !prev);
  }, [isPlaying, isDesktop]);

  const handleLike = async () => {
    if (!highlight || isLiking || isDisliking || myReaction === 'like') return;

    const prevReaction = myReaction;
    const prevCounts = counts;
    setMyReaction('like');
    setCounts((prev) => ({
      ...prev,
      likes_count: prev.likes_count + 1,
      dislikes_count: prevReaction === 'dislike' ? Math.max(0, prev.dislikes_count - 1) : prev.dislikes_count,
    }));

    try {
      const result = await likeHighlight(highlight.id).unwrap();
      setCounts({
        likes_count: result.likes_count ?? 0,
        dislikes_count: result.dislikes_count ?? 0,
        shares_count: result.shares_count ?? prevCounts.shares_count,
      });
      setMyReaction(result.my_reaction ?? null);
    } catch {
      setMyReaction(prevReaction);
      setCounts(prevCounts);
    }
  };

  const handleDislike = async () => {
    if (!highlight || isLiking || isDisliking || myReaction === 'dislike') return;

    const prevReaction = myReaction;
    const prevCounts = counts;
    setMyReaction('dislike');
    setCounts((prev) => ({
      ...prev,
      dislikes_count: prev.dislikes_count + 1,
      likes_count: prevReaction === 'like' ? Math.max(0, prev.likes_count - 1) : prev.likes_count,
    }));

    try {
      const result = await dislikeHighlight(highlight.id).unwrap();
      setCounts({
        likes_count: result.likes_count ?? 0,
        dislikes_count: result.dislikes_count ?? 0,
        shares_count: result.shares_count ?? prevCounts.shares_count,
      });
      setMyReaction(result.my_reaction ?? null);
    } catch {
      setMyReaction(prevReaction);
      setCounts(prevCounts);
    }
  };

  const handleShare = async () => {
    if (!highlight) return;

    const channel = await shareLink({
      title: getHighlightTitle(highlight),
      text: highlight.description || getHighlightTitle(highlight),
      url: buildHighlightShareUrl(highlight.id),
    });
    if (!channel) return;

    try {
      const result = await shareHighlight(highlight.id).unwrap();
      setCounts((prev) => ({ ...prev, shares_count: result.shares_count ?? prev.shares_count + 1 }));
    } catch {
      // Share sheet succeeded; ignore analytics failure.
    }
  };

  const handlePlay = () => {
    if (highlight?.videoUrl) setPlayingHighlightId(highlightId);
  };

  const handleMoreHighlightClick = (item) => {
    navigate(`/highlights/${item.id}`, { state: { highlight: item } });
  };

  if (!hasValidId || (!isLoading && !highlight)) {
    return (
      <div className="min-h-screen bg-black">
        <AppSubpageHeader title="HIGHLIGHT" onBack={() => navigate('/highlights')} />
        <Container>
          <ListEmpty
            title="Highlight Not Found."
            action={
              <Button type="button" variant="orange" onClick={() => navigate('/highlights')}>
                Back to Highlights
              </Button>
            }
          />
        </Container>
      </div>
    );
  }

  const bannerImage = highlight?.thumbnailUrl || FIXTURE_BG_IMAGE;
  const displayTitle = getHighlightTitle(highlight);
  const dateLabel = formatHighlightDate(highlight?.publishedAt);
  const durationLabel = formatHighlightDuration(highlight?.duration);
  const description = highlight?.description ?? '';
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
        key={highlightId}
        playback={{ mode: 'iframe', embed_url: highlight.videoUrl }}
        fill
        isLandscape={immersiveMobileLandscape}
        showControls
        interactive={nativeInteractive}
        posterUrl={bannerImage}
        title={displayTitle}
        className="h-full w-full"
      />
    ) : isPlaying && isDirectVideo ? (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <video
          key={highlightId}
          src={highlight.videoUrl}
          controls
          playsInline
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
          alt={displayTitle}
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
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center transition-opacity active:opacity-70"
            aria-label="Play Video"
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

          {/* Web only — iOS interactive native covers overlays; rotate sits below the frame. */}
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
        <HighlightLandscapeExitToggle onClick={toggleLandscape} />
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
      <AppSubpageHeader title="HIGHLIGHT" />

      <div className={`relative mt-4 aspect-video w-full shrink-0 overflow-hidden ${surfaceBg}`}>{playerStage}</div>

      {/* Outside the native frame so rotate stays tappable while YouTube controls are interactive. */}
      {showRotateToggle && nativeInteractive ? (
        <div className="flex shrink-0 justify-end bg-black px-4 py-2">
          <button type="button" onClick={toggleLandscape} className={LIVE_BROADCAST_TOGGLE_BTN} aria-label="Rotate to landscape">
            <img src={maxMinIcon} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
          </button>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-black">
        <Container className="shrink-0 px-4! py-0!">
          {isLoading && !highlight ? <LoaderBlock label="Loading highlight" className="mt-3 py-4" /> : null}

          {highlight ? (
            <div className="mt-3">
              <h1 className="line-clamp-2 text-[15px] leading-snug font-bold text-white">{displayTitle}</h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                {dateLabel || durationLabel ? (
                  <p className="text-muted text-[13px]">{[dateLabel, durationLabel].filter(Boolean).join(' · ')}</p>
                ) : null}
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleLike}
                    disabled={isLiking || isDisliking}
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
                    onClick={handleDislike}
                    disabled={isLiking || isDisliking}
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
                    onClick={handleShare}
                    className="bg-surface flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-white transition-opacity active:opacity-80"
                    aria-label={`Share. ${formatCount(counts.shares_count)} shares`}
                  >
                    <img src={feedShareIcon} alt="" className="h-4 w-4 brightness-0 invert" aria-hidden />
                    <span className="text-[12px] font-medium tabular-nums">{formatCount(counts.shares_count)}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {description ? <p className="mt-2.5 line-clamp-2 text-[13px] leading-snug text-white/90">{description}</p> : null}
        </Container>

        {moreHighlights.length > 0 ? (
          <section className="border-surface-border mt-3 flex min-h-0 flex-1 flex-col overflow-hidden border-t px-4 pt-3 pb-4">
            <h2 className="text-muted mb-2.5 shrink-0 text-[12px] font-bold tracking-wide uppercase">More Highlights</h2>
            <div className="divide-surface-border min-h-0 flex-1 divide-y overflow-y-auto">
              {moreHighlights.map((item) => (
                <MoreHighlightRow key={item.id} highlight={item} onClick={handleMoreHighlightClick} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
