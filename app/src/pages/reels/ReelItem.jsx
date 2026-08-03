/**
 * ReelItem
 *
 * Single reel card: video, Instagram-style action rail, caption, scrubber.
 * Coding guidelines: docs/Coding guidelines.md
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { OfficialBadge } from '@/components/OfficialBadge';
import ReelCommentsSheet from '@/components/reels/ReelCommentsSheet';
import ReelReportDialog from '@/components/reels/ReelReportDialog';
import { toggleReelsFocusMode, useReelsFocusMode } from '@/features/reels/reelsFocusModeStore';
import { useReelHls } from '@/features/reels/useReelHls';
import { useViewTracker } from '@/features/reels/useViewTracker';
import { StreamVideoRetry } from '@/features/stream/StreamVideoRetry';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatCount } from '@/lib/format';
import { buildReelShareUrl, shareLink } from '@/lib/share';
import {
  useFollowReelCreatorMutation,
  useLikeReelMutation,
  useSaveReelMutation,
  useShareReelMutation,
  useUnlikeReelMutation,
  useUnsaveReelMutation,
} from '@/store/api/reelsApi';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/selectors';
import { Avatar, AvatarImage } from '@/ui/Avatar';

const defaultAvatar = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;

const ACTION_ICON = 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] transition-transform duration-150 active:scale-90';

/** Match poster + video framing so iOS letterboxing never leaks the other layer. */
const MEDIA_LAYER = 'absolute inset-0 h-full w-full object-contain';

/** Collapse long captions; "See more" only when over this length. */
const CAPTION_COLLAPSE_LIMIT = 100;
const DOUBLE_TAP_MS = 280;

function HeartIcon({ filled, className = '' }) {
  return (
    <svg
      className={`transition-transform duration-200 ${className}`}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

function CommentIcon({ className = '' }) {
  return (
    <svg className={className} width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon({ className = '' }) {
  return (
    <svg className={className} width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon({ filled, className = '' }) {
  return (
    <svg className={className} width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

function FlagIcon({ className = '' }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Expand / compress corners — focus mode (hide app + reels chrome). */
function FocusModeIcon({ expanded, className = '' }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      {expanded ? (
        <>
          <path d="M8 3v3a2 2 0 0 1-2 2H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 3v3a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 21v-3a2 2 0 0 0-2-2H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M16 21v-3a2 2 0 0 1 2-2h3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path d="M9 3H4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 3h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 21H4v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 21h5v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

function PlayIcon({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

function ActionButton({ label, count, onClick, active = false, activeClassName = 'text-white', children }) {
  const showCount = count != null && Number(count) > 0;
  return (
    <div className="flex w-11 flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        className={`${ACTION_ICON} flex size-10 items-center justify-center text-white ${active ? activeClassName : ''}`}
        aria-label={label}
        aria-pressed={active || undefined}
      >
        {children}
      </button>
      <span className="flex h-3 items-center justify-center text-[11px] leading-none font-semibold tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]">
        {showCount ? formatCount(count) : null}
      </span>
    </div>
  );
}

export default function ReelItem({ reel, isActive, inPlayerWindow = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const barRef = useRef(null);
  const lastTapRef = useRef(0);
  const currentUser = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [scrubPercent, setScrubPercent] = useState(0);
  const [scrubTime, setScrubTime] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [likeReel] = useLikeReelMutation();
  const [unlikeReel] = useUnlikeReelMutation();
  const [saveReel] = useSaveReelMutation();
  const [unsaveReel] = useUnsaveReelMutation();
  const [shareReel] = useShareReelMutation();
  const [followCreator] = useFollowReelCreatorMutation();
  const focusMode = useReelsFocusMode();

  const isLiked = Boolean(reel.liked);
  const isSaved = Boolean(reel.saved);
  const isPlaying = isActive && !paused;
  const creatorId = reel.creator?.id ?? null;
  const isOwnReel = currentUser?.id != null && creatorId != null && Number(currentUser.id) === Number(creatorId);
  const showFollow = Boolean(creatorId) && !isOwnReel && !reel.followingCreator;
  const caption = typeof reel.caption === 'string' ? reel.caption.trim() : '';
  const captionNeedsCollapse = caption.length > CAPTION_COLLAPSE_LIMIT;
  const visibleCaption =
    captionNeedsCollapse && !captionExpanded ? `${caption.slice(0, CAPTION_COLLAPSE_LIMIT).trimEnd()}…` : caption;

  const requireAuth = useCallback(
    (action) => {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: location } });
        return;
      }
      action();
    },
    [isAuthenticated, location, navigate],
  );

  useEffect(() => {
    setCaptionExpanded(false);
    setReportOpen(false);
  }, [reel.id]);

  useEffect(() => {
    setVideoReady(false);
  }, [reel.id, inPlayerWindow]);

  const {
    failed: playbackFailed,
    retry: retryPlayback,
    readyToken,
  } = useReelHls(
    videoRef,
    {
      url: reel.playback?.url ?? reel.videoUrl,
      type: reel.playback?.type,
      hlsUrl: reel.playback?.hlsUrl,
    },
    { enabled: inPlayerWindow },
  );

  const getCurrentTimeMs = useCallback(() => {
    const video = videoRef.current;
    return video ? video.currentTime * 1000 : 0;
  }, []);

  const getDurationMs = useCallback(() => {
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      return video.duration * 1000;
    }
    return reel.durationMs ?? 0;
  }, [reel.durationMs]);

  useViewTracker({
    // Match backend: processing + ready are viewable; uploading/failed/rejected/removed are not.
    reelId: reel.status === 'ready' || reel.status === 'processing' ? reel.id : null,
    isActive: isActive && inPlayerWindow,
    isPlaying,
    getCurrentTimeMs,
    getDurationMs,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !inPlayerWindow) return;
    if (isActive) {
      if (!paused && !playbackFailed) {
        // Unmuted autoplay is often blocked after route changes — show the play control.
        video.play().catch(() => setPaused(true));
      }
    } else {
      // Don't seek to 0 — on iOS that flashes black while a neighbor is still on screen.
      video.pause();
      setPaused(false);
      setProgress(0);
    }
  }, [isActive, paused, inPlayerWindow, playbackFailed, readyToken]);

  const revealVideo = useCallback(() => setVideoReady(true), []);

  const getVideo = () => videoRef.current;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !inPlayerWindow) return undefined;
    const onTimeUpdate = () => {
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        setProgress((video.currentTime / duration) * 100);
      }
    };
    const onEnded = () => setProgress(0);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
    };
  }, [inPlayerWindow, reel.id]);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.play().catch(() => setPaused(true));
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  const applyLike = () => {
    if (!reel?.id || isLiked) return;
    likeReel(reel.id);
  };

  const handleVideoTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      lastTapRef.current = 0;
      requireAuth(applyLike);
      return;
    }
    lastTapRef.current = now;
    handleTogglePlay();
  };

  const computePercentFromEvent = (event) => {
    const bar = barRef.current;
    if (!bar) return null;
    const rect = bar.getBoundingClientRect();
    const clientX = 'touches' in event && event.touches.length ? event.touches[0].clientX : event.clientX;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(100, Math.max(0, ratio * 100));
  };

  const applyScrub = (percent) => {
    const video = getVideo();
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
      return;
    }
    const nextTime = (percent / 100) * video.duration;
    video.currentTime = nextTime;
    setProgress(percent);
    setScrubPercent(percent);
    setScrubTime(nextTime);
  };

  const handleScrubStart = (event) => {
    event.preventDefault();
    const percent = computePercentFromEvent(event);
    if (percent == null) return;
    setIsScrubbing(true);
    applyScrub(percent);
  };

  const handleScrubMove = (event) => {
    if (!isScrubbing) return;
    event.preventDefault();
    const percent = computePercentFromEvent(event);
    if (percent == null) return;
    applyScrub(percent);
  };

  const handleScrubEnd = () => {
    if (!isScrubbing) return;
    setIsScrubbing(false);
  };

  const handleLike = () => {
    requireAuth(() => {
      if (!reel?.id) return;
      if (isLiked) {
        unlikeReel(reel.id);
      } else {
        applyLike();
      }
    });
  };

  const handleSave = () => {
    requireAuth(() => {
      if (!reel?.id) return;
      if (isSaved) {
        unsaveReel(reel.id);
      } else {
        saveReel(reel.id);
      }
    });
  };

  const handleFollow = () => {
    requireAuth(() => {
      if (!creatorId || isOwnReel || reel.followingCreator) return;
      followCreator(creatorId);
    });
  };

  const openCreatorProfile = (event) => {
    event?.stopPropagation?.();
    if (!creatorId) return;
    navigate(`/reels/u/${creatorId}`);
  };

  const handleOpenComments = () => {
    setCommentsOpen(true);
  };

  const handleOpenReport = () => {
    if (isOwnReel) return;
    requireAuth(() => setReportOpen(true));
  };

  const handleShare = async () => {
    if (!reel?.id) return;
    // URL only — no title/caption so shares stay a clean deep link.
    const channel = await shareLink({ url: buildReelShareUrl(reel.id) });
    if (channel && isAuthenticated) {
      await shareReel({ id: reel.id, channel });
    }
  };

  return (
    <div className="relative h-screen w-full shrink-0 snap-start overflow-hidden bg-black">
      {reel.posterUrl ? (
        <img
          src={reel.posterUrl}
          alt=""
          className={MEDIA_LAYER}
          loading={inPlayerWindow ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-black" aria-hidden />
      )}

      {inPlayerWindow ? (
        <video
          ref={videoRef}
          loop
          playsInline
          preload="auto"
          onClick={handleVideoTap}
          onLoadedData={revealVideo}
          onPlaying={revealVideo}
          className={`${MEDIA_LAYER} transition-opacity duration-150 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
        >
          <track kind="captions" />
        </video>
      ) : null}

      <StreamVideoRetry
        visible={Boolean(inPlayerWindow && playbackFailed)}
        onRetry={() => {
          retryPlayback();
          setPaused(false);
        }}
      />

      {paused && !playbackFailed && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-sm">
            <PlayIcon className="ml-0.5" />
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/15" />

      <div
        className={`absolute right-0 left-0 z-35 px-4 ${focusMode ? 'bottom-[max(1.5rem,env(safe-area-inset-bottom))]' : 'bottom-20'}`}
      >
        <div
          ref={barRef}
          className="relative h-3 cursor-pointer"
          onMouseDown={handleScrubStart}
          onMouseMove={handleScrubMove}
          onMouseUp={handleScrubEnd}
          onMouseLeave={handleScrubEnd}
          onTouchStart={handleScrubStart}
          onTouchMove={handleScrubMove}
          onTouchEnd={handleScrubEnd}
        >
          <div className="absolute top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-75 ease-linear"
              style={{ width: `${isScrubbing ? scrubPercent : progress}%` }}
            />
          </div>
          {isScrubbing && (
            <div className="pointer-events-none absolute -top-5" style={{ left: `calc(${scrubPercent}% - 18px)` }}>
              <div className="rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-medium text-white">
                {formatTime(scrubTime)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={`absolute right-2 z-20 flex flex-col items-center gap-3 ${
          focusMode ? 'bottom-[max(3.5rem,calc(env(safe-area-inset-bottom)+2.5rem))]' : 'bottom-30'
        }`}
      >
        <div className="relative flex w-11 flex-col items-center pb-1">
          <button
            type="button"
            onClick={openCreatorProfile}
            disabled={!creatorId}
            className="rounded-full bg-linear-to-br from-white via-white to-white/80 p-[1.5px] shadow-[0_2px_10px_rgba(0,0,0,0.45)] transition-opacity enabled:active:opacity-90 disabled:opacity-100"
            aria-label={reel.handle || reel.username ? `View ${reel.handle || reel.username}'s profile` : 'View creator profile'}
          >
            <Avatar className="h-9 w-9 border-2 border-black">
              <AvatarImage src={reel.creator?.avatarUrl || defaultAvatar} alt="" />
            </Avatar>
          </button>
          {showFollow ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleFollow();
              }}
              className="bg-brand text-ink absolute -bottom-0.5 left-1/2 flex size-[18px] -translate-x-1/2 items-center justify-center rounded-full text-[13px] leading-none font-bold shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-transform active:scale-90"
              aria-label={`Follow ${reel.username || 'creator'}`}
            >
              +
            </button>
          ) : null}
        </div>

        <ActionButton
          label={isLiked ? 'Unlike' : 'Like'}
          count={reel.likes}
          onClick={handleLike}
          active={isLiked}
          activeClassName="text-[#FF2D55]"
        >
          <HeartIcon filled={isLiked} />
        </ActionButton>

        <ActionButton label="Comments" count={reel.comments} onClick={handleOpenComments}>
          <CommentIcon />
        </ActionButton>

        <ActionButton label="Share" count={reel.shares} onClick={handleShare}>
          <ShareIcon />
        </ActionButton>

        <ActionButton label={isSaved ? 'Unsave' : 'Save'} onClick={handleSave} active={isSaved} activeClassName="text-brand">
          <BookmarkIcon filled={isSaved} />
        </ActionButton>

        {!isOwnReel ? (
          <ActionButton label="Report" onClick={handleOpenReport}>
            <FlagIcon />
          </ActionButton>
        ) : null}

        <ActionButton
          label={focusMode ? 'Exit full screen' : 'Full screen'}
          onClick={() => toggleReelsFocusMode()}
          active={focusMode}
          activeClassName="text-brand"
        >
          <FocusModeIcon expanded={focusMode} />
        </ActionButton>
      </div>

      <div
        className={`absolute right-16 left-4 z-10 max-w-[78%] ${
          focusMode ? 'bottom-[max(2.75rem,calc(env(safe-area-inset-bottom)+1.75rem))]' : 'bottom-24'
        }`}
      >
        <button
          type="button"
          onClick={openCreatorProfile}
          disabled={!creatorId}
          className="inline-flex max-w-full items-center gap-1 text-left text-[15px] leading-tight font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)] transition-opacity enabled:active:opacity-90"
        >
          <span className="truncate">{reel.handle || reel.username}</span>
          <OfficialBadge isOfficial={reel.creator?.isOfficial} />
        </button>
        {caption ? (
          <p className="mt-1.5 text-[13px] leading-relaxed text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
            {visibleCaption}
            {captionNeedsCollapse ? (
              <>
                {' '}
                <button type="button" onClick={() => setCaptionExpanded((open) => !open)} className="font-semibold text-white">
                  {captionExpanded ? 'See Less' : 'See More'}
                </button>
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      <ReelCommentsSheet reelId={reel.id} open={commentsOpen} onOpenChange={setCommentsOpen} />
      <ReelReportDialog reelId={reel.id} open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
