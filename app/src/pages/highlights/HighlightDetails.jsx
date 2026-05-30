import { useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { LG_MEDIA_QUERY, NAVBAR_HERO_CONTROL_OFFSET } from '@/lib/constants/layout';
import { MoreHighlightRow } from '@/pages/highlights/components/MoreHighlightRow';
import { HIGHLIGHTS_FALLBACK_IMAGE } from '@/pages/highlights/highlightsData';
import {
  formatHighlightDate,
  getHighlightById,
  getHighlightTitle,
  getMoreHighlights,
  isValidHighlightId,
} from '@/pages/highlights/highlightsUtils';
import { formatCount, ThumbsUpIcon } from '@/pages/feed/PostCard';
import { Container } from '@/ui/Container';

const feedShareIcon = `${CLOUDFRONT_APP_BASE}/images/icons/feed-share.svg`;
const playIcon = `${CLOUDFRONT_APP_BASE}/images/icons/video-play.svg`;

const DEFAULT_HIGHLIGHT = {
  title: 'Highlight',
  detailTitle: 'Highlight',
  publishedAt: '',
  description: '',
  thumbnailUrl: HIGHLIGHTS_FALLBACK_IMAGE,
  likesCount: 0,
  dislikesCount: 0,
  sharesCount: 0,
};

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
  const videoRef = useRef(null);

  const hasValidId = isValidHighlightId(highlightId);
  const highlightFromData = hasValidId ? getHighlightById(highlightId) : null;
  const highlight = highlightFromData ?? stateHighlight ?? { id: highlightId, ...DEFAULT_HIGHLIGHT };

  const bannerImage = highlight.thumbnailUrl || HIGHLIGHTS_FALLBACK_IMAGE;
  const displayTitle = getHighlightTitle(highlight);
  const dateLabel = formatHighlightDate(highlight.publishedAt);
  const description = highlight.description ?? '';
  const moreHighlights = useMemo(() => getMoreHighlights(highlight.id), [highlight.id]);

  const [counts, setCounts] = useState({
    likes_count: highlight.likesCount ?? 0,
    dislikes_count: highlight.dislikesCount ?? 0,
    shares_count: highlight.sharesCount ?? 0,
  });
  const [myReaction, setMyReaction] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setCounts({
      likes_count: highlight.likesCount ?? 0,
      dislikes_count: highlight.dislikesCount ?? 0,
      shares_count: highlight.sharesCount ?? 0,
    });
    setMyReaction(null);
    setIsPlaying(false);
  }, [highlight.id, highlight.likesCount, highlight.dislikesCount, highlight.sharesCount]);

  useEffect(() => {
    if (!isPlaying || !videoRef.current) return;
    videoRef.current.play().catch(() => {});
  }, [isPlaying]);

  const handleLike = () => {
    setMyReaction((prev) => {
      if (prev === 'like') {
        setCounts((current) => ({ ...current, likes_count: Math.max(0, current.likes_count - 1) }));
        return null;
      }
      setCounts((current) => ({
        ...current,
        likes_count: current.likes_count + 1,
        dislikes_count: prev === 'dislike' ? Math.max(0, current.dislikes_count - 1) : current.dislikes_count,
      }));
      return 'like';
    });
  };

  const handleDislike = () => {
    setMyReaction((prev) => {
      if (prev === 'dislike') {
        setCounts((current) => ({ ...current, dislikes_count: Math.max(0, current.dislikes_count - 1) }));
        return null;
      }
      setCounts((current) => ({
        ...current,
        dislikes_count: current.dislikes_count + 1,
        likes_count: prev === 'like' ? Math.max(0, current.likes_count - 1) : current.likes_count,
      }));
      return 'dislike';
    });
  };

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: displayTitle,
          text: description || displayTitle,
          url: window.location.href,
        });
        setCounts((current) => ({ ...current, shares_count: current.shares_count + 1 }));
      }
    } catch {
      // User cancelled or share failed.
    }
  };

  const handlePlay = () => {
    if (highlight.videoUrl) {
      setIsPlaying(true);
      return;
    }
  };

  const handleMoreHighlightClick = (item) => {
    if (item.id == null) return;
    navigate(`/highlights/${item.id}`, { state: { highlight: item } });
  };

  if (!hasValidId && !stateHighlight) {
    return (
      <div className="min-h-screen bg-black">
        <Container className="py-8 text-center">
          <p className="text-[14px] text-[#A2A6AB]">Highlight not found.</p>
          <button
            type="button"
            onClick={() => navigate('/highlights')}
            className="mt-4 text-[14px] font-bold text-[#DA9811] transition-opacity active:opacity-80"
          >
            Back to Highlights
          </button>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-black">
      <div className="relative h-[200px] w-full overflow-hidden bg-black lg:h-[400px]">
        {isPlaying && highlight.videoUrl ? (
          <div className="flex h-full w-full items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={highlight.videoUrl}
              controls
              playsInline
              className="max-h-full max-w-full object-contain"
              poster={bannerImage}
            />
          </div>
        ) : (
          <img
            src={bannerImage}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              if (e.currentTarget.src !== HIGHLIGHTS_FALLBACK_IMAGE) {
                e.currentTarget.src = HIGHLIGHTS_FALLBACK_IMAGE;
              }
            }}
          />
        )}
        <AppSubpageBackButton
          onClick={() => navigate(-1)}
          className={`absolute left-4 z-10 ${isDesktop ? 'top-4' : ''}`}
          style={isDesktop ? undefined : { top: NAVBAR_HERO_CONTROL_OFFSET }}
          aria-label="Back"
        />
      </div>

      <Container className="!px-4 !py-0">
        <div className="mt-4">
          <h1 className="text-[16px] leading-tight font-bold text-white">{displayTitle}</h1>
          {dateLabel ? <p className="mt-1 text-[14px] text-[#A2A6AB]">{dateLabel}</p> : null}
        </div>

        <div className="mt-4 flex items-center gap-8">
          <button
            type="button"
            onClick={handlePlay}
            disabled={!highlight.videoUrl}
            className="flex min-w-0 flex-1 items-center justify-center gap-3 rounded-[10px] border border-[#DA9811] bg-black px-5 py-3 text-[14px] font-medium text-[#DA9811] transition-opacity active:opacity-90 disabled:cursor-default disabled:opacity-50"
          >
            <img src={playIcon} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
            Play
          </button>

          <div className="flex shrink-0 items-start gap-4">
            <button
              type="button"
              onClick={handleLike}
              className="flex flex-col items-center gap-1.5 transition-opacity active:opacity-80"
              aria-label={`Like. ${formatCount(counts.likes_count)} likes`}
              aria-pressed={myReaction === 'like'}
            >
              <div
                className={`flex h-[44px] w-[44px] items-center justify-center rounded-full ${myReaction === 'like' ? 'bg-[#DA9811]' : 'bg-[#141412]'}`}
              >
                <ThumbsUpIcon filled={myReaction === 'like'} className={myReaction === 'like' ? 'text-black' : 'text-white'} />
              </div>
              <span className="text-[12px] font-medium text-white">{formatCount(counts.likes_count)}</span>
            </button>

            <button
              type="button"
              onClick={handleDislike}
              className="flex flex-col items-center gap-1.5 transition-opacity active:opacity-80"
              aria-label={`Dislike. ${formatCount(counts.dislikes_count)} dislikes`}
              aria-pressed={myReaction === 'dislike'}
            >
              <div
                className={`flex h-[44px] w-[44px] items-center justify-center rounded-full ${myReaction === 'dislike' ? 'bg-[#DA9811]' : 'bg-[#141412]'}`}
              >
                <ThumbsDownIcon className={myReaction === 'dislike' ? 'text-black' : 'text-white'} />
              </div>
              <span className="text-[12px] font-medium text-white">{formatCount(counts.dislikes_count)}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex flex-col items-center gap-1.5 transition-opacity active:opacity-80"
              aria-label={`Share. ${formatCount(counts.shares_count)} shares`}
            >
              <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#141412]">
                <img src={feedShareIcon} alt="" className="h-5 w-5 brightness-0 invert" aria-hidden />
              </div>
              <span className="text-[12px] font-medium text-white">{formatCount(counts.shares_count)}</span>
            </button>
          </div>
        </div>

        {description ? <p className="mt-4 text-left text-[14px] leading-relaxed text-white/95">{description}</p> : null}

        {moreHighlights.length > 0 ? (
          <section className="mt-6 border-t border-[#1A1A1A] pt-6 pb-6">
            <h2 className="mb-3 text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase md:text-[16px]">
              More Highlights
            </h2>
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
