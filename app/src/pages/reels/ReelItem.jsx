import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import messageIcon from '@/assets/images/icons/message-icon.svg';
import playIcon from '@/assets/images/icons/play-icon.svg';
import reelCameraIcon from '@/assets/images/icons/reel-camera-icon.svg';

function HeartIcon({ filled }) {
  const color = filled ? '#ef4444' : '#000';
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </svg>
  );
}

export default function ReelItem({ reel, isActive, isLiked, onLike }) {
  const videoRef = useRef(null);
  const barRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPercent, setScrubPercent] = useState(0);
  const [scrubTime, setScrubTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      if (!paused) {
        video.play().catch(() => {});
      }
    } else {
      video.pause();
      video.currentTime = 0;
      setPaused(false);
      setProgress(0);
    }
  }, [isActive, paused]);

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
    if (!video) return;
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
  }, []);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.play().catch(() => {});
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  const computePercentFromEvent = (event) => {
    const bar = barRef.current;
    if (!bar) return null;
    const rect = bar.getBoundingClientRect();
    const clientX =
      'touches' in event && event.touches.length
        ? event.touches[0].clientX
        : event.clientX;
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

  return (
    <div className="relative h-screen w-full flex-shrink-0 [scroll-snap-align:start] overflow-hidden bg-black">
      {/* Background video — contained to preserve aspect ratio; letterbox/pillarbox is black */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        muted={false}
        loop
        playsInline
        preload="metadata"
        onClick={handleTogglePlay}
        className="absolute inset-0 h-full w-full object-contain"
      >
        <track kind="captions" />
      </video>

      {/* Center play overlay when video is stopped */}
      {paused && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#da98115c] bg-black/35">
            <img
              src={playIcon}
              alt=""
              className="h-4 w-4 shrink-0 object-contain"
              aria-hidden
            />
          </div>
        </div>
      )}

      {/* Gradient: strong at bottom, subtle at top */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />

      {/* Video duration / progress bar — above bottom nav (z-40) so it stays visible */}
      <div className="absolute right-0 bottom-20 left-0 z-[35] px-4">
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
            <div
              className="pointer-events-none absolute -top-5"
              style={{ left: `calc(${scrubPercent}% - 18px)` }}
            >
              <div className="rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-medium text-white">
                {formatTime(scrubTime)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right-side action buttons */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-4">
        {/* Add / record video */}
        <div className="relative">
          <Link
            to="/reels/upload"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
            aria-label="Upload reel"
          >
            <img
              src={reelCameraIcon}
              alt=""
              className="h-5 w-5 shrink-0 object-contain"
              aria-hidden
            />
          </Link>
          <span className="absolute -top-1 -right-1 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#DA9811] text-[14px] leading-none font-bold text-white">
            +
          </span>
        </div>

        {/* Like */}
        <button
          type="button"
          onClick={() => onLike(reel.id)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow transition-transform active:scale-90"
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <HeartIcon filled={isLiked} />
        </button>

        {/* Share / message */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
          aria-label="Share"
        >
          <img
            src={messageIcon}
            alt=""
            className="h-5 w-5 shrink-0 object-contain"
            aria-hidden
          />
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute right-16 bottom-24 left-4">
        <p className="text-[15px] leading-tight font-bold text-white">
          {reel.username}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-white/80">
          {reel.caption}{' '}
          <span className="font-semibold text-white">See More</span>
        </p>
      </div>
    </div>
  );
}
