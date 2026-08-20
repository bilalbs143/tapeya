import { useEffect, useMemo, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CLOUDFRONT_APP_BASE, FIXTURE_BG_IMAGE } from '@/lib/constants/assets';
import { LG_MEDIA_QUERY, NAVBAR_HERO_CONTROL_OFFSET } from '@/lib/constants/layout';
import { formatCount } from '@/lib/format';
import { buildHighlightShareUrl, shareLink } from '@/lib/share';
import { ThumbsUpIcon } from '@/pages/feed/PostCard';
import {
  useDislikeHighlightMutation,
  useGetHighlightQuery,
  useGetHighlightsQuery,
  useLikeHighlightMutation,
  useShareHighlightMutation,
} from '@/store/api/highlightApi';
import { Container } from '@/ui/Container';
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

function ThumbsDownIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
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

export default function HighlightDetails() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const { highlightId } = useParams();
  const location = useLocation();
  const stateHighlight = location.state?.highlight;
  const hasValidId = isValidHighlightId(highlightId);

  // Fetch the full highlight from the API (also increments views_count on the server)
  const { data: apiHighlight, isLoading, isError } = useGetHighlightQuery(highlightId, { skip: !hasValidId });

  // Fallback to router state while API loads
  const highlight = apiHighlight ?? stateHighlight ?? null;

  // Fetch all highlights for "More Highlights" section
  const { data: allHighlights = [] } = useGetHighlightsQuery({ per_page: 50 });
  const moreHighlights = useMemo(() => getMoreHighlights(allHighlights, highlight?.id), [allHighlights, highlight?.id]);

  const [likeHighlight, { isLoading: isLiking }] = useLikeHighlightMutation();
  const [dislikeHighlight, { isLoading: isDisliking }] = useDislikeHighlightMutation();
  const [shareHighlight] = useShareHighlightMutation();

  const [counts, setCounts] = useState({ likes_count: 0, dislikes_count: 0, shares_count: 0 });
  const [myReaction, setMyReaction] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset player when the URL changes (navigating to a different highlight).
  // Use highlightId from params — it's a stable string, never undefined.
  useEffect(() => {
    setIsPlaying(false);
  }, [highlightId]);

  // Sync counts + reaction when fresh API data arrives.
  // Intentionally uses apiHighlight only — stateHighlight is router-state and never updates.
  useEffect(() => {
    if (!apiHighlight) return;
    setCounts({
      likes_count: apiHighlight.likes_count ?? 0,
      dislikes_count: apiHighlight.dislikes_count ?? 0,
      shares_count: apiHighlight.shares_count ?? 0,
    });
    setMyReaction(apiHighlight.my_reaction ?? null);
  }, [apiHighlight]);

  const handleLike = async () => {
    if (!highlight || isLiking || isDisliking || myReaction === 'like') return;

    // Optimistic update
    const prevReaction = myReaction;
    setMyReaction('like');
    setCounts((prev) => ({
      ...prev,
      likes_count: prev.likes_count + 1,
      dislikes_count: prevReaction === 'dislike' ? Math.max(0, prev.dislikes_count - 1) : prev.dislikes_count,
    }));

    try {
      const result = await likeHighlight(highlight.id).unwrap();
      // Sync with server response
      setCounts({
        likes_count: result.likes_count ?? 0,
        dislikes_count: result.dislikes_count ?? 0,
        shares_count: result.shares_count ?? counts.shares_count,
      });
      setMyReaction(result.my_reaction ?? null);
    } catch {
      // Revert on error
      setMyReaction(prevReaction);
      setCounts((prev) => ({
        ...prev,
        likes_count: highlight.likes_count ?? 0,
        dislikes_count: highlight.dislikes_count ?? 0,
      }));
    }
  };

  const handleDislike = async () => {
    if (!highlight || isLiking || isDisliking || myReaction === 'dislike') return;

    const prevReaction = myReaction;
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
        shares_count: result.shares_count ?? counts.shares_count,
      });
      setMyReaction(result.my_reaction ?? null);
    } catch {
      setMyReaction(prevReaction);
      setCounts((prev) => ({
        ...prev,
        likes_count: highlight.likes_count ?? 0,
        dislikes_count: highlight.dislikes_count ?? 0,
      }));
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
    if (highlight?.videoUrl) setIsPlaying(true);
  };

  const hasVideo = !!highlight?.videoUrl;

  const handleMoreHighlightClick = (item) => {
    navigate(`/highlights/${item.id}`, { state: { highlight: item } });
  };

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!hasValidId || (isError && !stateHighlight)) {
    return (
      <div className="min-h-screen bg-black">
        <Container className="py-8 text-center">
          <p className="text-muted text-[14px]">Highlight not found.</p>
          <button
            type="button"
            onClick={() => navigate('/highlights')}
            className="text-brand mt-4 text-[14px] font-bold transition-opacity active:opacity-80"
          >
            Back to Highlights
          </button>
        </Container>
      </div>
    );
  }

  const bannerImage = highlight?.thumbnailUrl || FIXTURE_BG_IMAGE;
  const displayTitle = getHighlightTitle(highlight);
  const dateLabel = formatHighlightDate(highlight?.publishedAt);
  const durationLabel = formatHighlightDuration(highlight?.duration);
  const description = highlight?.description ?? '';

  // video_source from the API tells us the type; video_url is already a ready-to-use embed URL
  // for YouTube or a direct storage URL for uploaded videos.
  const isYouTube = highlight?.videoSource === 'youtube';
  const isDirectVideo = highlight?.videoSource === 'upload';

  return (
    <div className="bg-black">
      {/* Hero banner / video player */}
      <div className="relative h-[200px] w-full overflow-hidden bg-black lg:h-[400px]">
        {isPlaying && isYouTube ? (
          <iframe
            src={`${highlight.videoUrl}${highlight.videoUrl?.includes('?') ? '&' : '?'}autoplay=1`}
            title={displayTitle}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : isPlaying && isDirectVideo ? (
          /* Direct video file */
          <div className="flex h-full w-full items-center justify-center bg-black">
            <video
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
          /* Thumbnail / poster with centered play button overlay */
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
                {/* Simple play triangle */}
                <svg viewBox="0 0 80 80" className="h-16 w-16 drop-shadow-lg" aria-hidden>
                  <circle cx="40" cy="40" r="40" fill="black" fillOpacity="0.45" />
                  <polygon points="32,24 32,56 60,40" fill="white" />
                </svg>
              </button>
            ) : null}
          </>
        )}

        <AppSubpageBackButton
          onClick={() => navigate(-1)}
          className={`absolute left-4 z-10 ${isDesktop ? 'top-4' : ''}`}
          style={isDesktop ? undefined : { top: NAVBAR_HERO_CONTROL_OFFSET }}
          aria-label="Back"
        />
      </div>

      <Container className="!px-4 !py-0">
        {isLoading && !highlight ? <LoaderBlock label="Loading highlight" className="mt-4 py-6" /> : null}

        {/* Title & date */}
        {highlight ? (
          <div className="mt-4">
            <h1 className="text-[16px] leading-tight font-bold text-white">{displayTitle}</h1>
            {dateLabel || durationLabel ? (
              <p className="text-muted mt-1 text-[14px]">{[dateLabel, durationLabel].filter(Boolean).join(' · ')}</p>
            ) : null}
          </div>
        ) : null}

        {/* Reactions — centered */}
        {highlight ? (
          <div className="mt-4 flex justify-center">
            <div className="flex items-start gap-8">
              {/* Like */}
              <button
                type="button"
                onClick={handleLike}
                disabled={isLiking || isDisliking}
                className="flex flex-col items-center gap-1.5 transition-opacity active:opacity-80 disabled:opacity-60"
                aria-label={`Like. ${formatCount(counts.likes_count)} likes`}
                aria-pressed={myReaction === 'like'}
              >
                <div
                  className={`flex h-[44px] w-[44px] items-center justify-center rounded-full transition-colors ${
                    myReaction === 'like' ? 'bg-brand' : 'bg-surface'
                  }`}
                >
                  <ThumbsUpIcon filled={myReaction === 'like'} className={myReaction === 'like' ? 'text-black' : 'text-white'} />
                </div>
                <span className="text-[12px] font-medium text-white">{formatCount(counts.likes_count)}</span>
              </button>

              {/* Dislike */}
              <button
                type="button"
                onClick={handleDislike}
                disabled={isLiking || isDisliking}
                className="flex flex-col items-center gap-1.5 transition-opacity active:opacity-80 disabled:opacity-60"
                aria-label={`Dislike. ${formatCount(counts.dislikes_count)} dislikes`}
                aria-pressed={myReaction === 'dislike'}
              >
                <div
                  className={`flex h-[44px] w-[44px] items-center justify-center rounded-full transition-colors ${
                    myReaction === 'dislike' ? 'bg-brand' : 'bg-surface'
                  }`}
                >
                  <ThumbsDownIcon className={myReaction === 'dislike' ? 'text-black' : 'text-white'} />
                </div>
                <span className="text-[12px] font-medium text-white">{formatCount(counts.dislikes_count)}</span>
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                className="flex flex-col items-center gap-1.5 transition-opacity active:opacity-80"
                aria-label={`Share. ${formatCount(counts.shares_count)} shares`}
              >
                <div className="bg-surface flex h-[44px] w-[44px] items-center justify-center rounded-full">
                  <img src={feedShareIcon} alt="" className="h-5 w-5 brightness-0 invert" aria-hidden />
                </div>
                <span className="text-[12px] font-medium text-white">{formatCount(counts.shares_count)}</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Description */}
        {description ? <p className="mt-4 text-left text-[14px] leading-relaxed text-white/95">{description}</p> : null}

        {/* More Highlights */}
        {moreHighlights.length > 0 ? (
          <section className="border-surface-border mt-6 border-t pt-6 pb-6">
            <h2 className="text-muted mb-3 text-[13px] font-bold tracking-wide uppercase md:text-[16px]">More Highlights</h2>
            <div className="space-y-3">
              {moreHighlights.map((item) => (
                <MoreHighlightRow key={item.id} highlight={item} onClick={handleMoreHighlightClick} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
