import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { SpeakerIcon } from '@/shared/ui/icons';
import { Scrubber } from '@/shared/ui/Scrubber';

import { setReelVideoMuted } from '../lib/inlineVideo';
import { attachReelHls, claimReelPlayback, registerReelVideo, releaseReelPlayback } from '../lib/reelPlaybackGate';
import { isReelsAudioUnlocked, relockReelsAudio, unlockReelsAudio } from '../lib/reelsAudioSession';
import { useReelHls } from '../lib/useReelHls';
import type { Reel } from '../model/schemas';
import { formatDurationMs } from '../model/schemas';
import { ReelActions } from './ReelActions';
import { ReelCaption } from './ReelCaption';

type ReelSlideProps = {
  reel: Reel;
  active: boolean;
  /** Mount a live player (active + neighbors in the player window). */
  inPlayerWindow?: boolean | undefined;
  /** Immediate next slide — larger warm buffer. */
  isNext?: boolean | undefined;
  isOwn: boolean;
  desk?: boolean | undefined;
  chromeHidden?: boolean | undefined;
  onLike: () => void;
  onFollow: () => void;
  onComments: () => void;
  onReport: () => void;
  onSave: () => void;
  onShare: () => void;
  className?: string | undefined;
};

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const whole = Math.floor(seconds);
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** One full-bleed reel frame — poster/video + scrubber + caption + action rail. */
export function ReelSlide({
  reel,
  active,
  inPlayerWindow = active,
  isNext = false,
  isOwn,
  desk = false,
  chromeHidden = false,
  onLike,
  onFollow,
  onComments,
  onReport,
  onSave,
  onShare,
  className,
}: ReelSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wasActiveRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubPreview, setScrubPreview] = useState('0:00');
  const scrubbingRef = useRef(false);
  /** True only after unmuted autoplay was blocked — shows Tap for Sound. */
  const [mutedByPolicy, setMutedByPolicy] = useState(false);
  /** Hide WebView play-artwork until a real frame paints. */
  const [videoReady, setVideoReady] = useState(false);
  const [mediaEpoch, setMediaEpoch] = useState({ reelId: reel.id, readyToken: 0 });

  const role = active ? 'active' : isNext ? 'next' : 'warm';
  const { mode, failed, retry, readyToken } = useReelHls(videoRef, reel.playback, {
    enabled: inPlayerWindow,
    role,
  });
  const canPlay = mode != null && !failed;
  const preferMuted = active ? !isReelsAudioUnlocked() && mutedByPolicy : true;

  // Reset tip / reveal when reel or attach epoch changes (render-time — avoid setState-in-effect).
  if (reel.id !== mediaEpoch.reelId || readyToken !== mediaEpoch.readyToken) {
    setMediaEpoch({ reelId: reel.id, readyToken });
    setVideoReady(false);
    if (reel.id !== mediaEpoch.reelId) {
      setMutedByPolicy(false);
      setProgress(0);
    }
  }

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !inPlayerWindow) return undefined;
    return registerReelVideo(el);
  }, [inPlayerWindow, reel.id, canPlay]);

  // Only the active reel may call play(); leaving active always releases MSE.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !canPlay) return undefined;

    let cancelled = false;
    let removeReadyWait = () => {};

    const runPlay = () => {
      if (cancelled || !active || failed) return;
      setReelVideoMuted(el, preferMuted);
      void el
        .play()
        .then(() => {
          if (!cancelled && !el.muted) unlockReelsAudio();
        })
        .catch(() => {
          if (cancelled || el.muted) return;
          setReelVideoMuted(el, true);
          setMutedByPolicy(true);
          void el.play().catch(() => undefined);
        });
    };

    const tryPlay = () => {
      if (cancelled || !active || failed) return;
      claimReelPlayback(el);
      attachReelHls(el);
      removeReadyWait();
      if (el.readyState >= 2) {
        runPlay();
        return;
      }
      const onReady = () => {
        removeReadyWait();
        runPlay();
      };
      el.addEventListener('canplay', onReady, { once: true });
      removeReadyWait = () => el.removeEventListener('canplay', onReady);
    };

    if (active) {
      tryPlay();
    } else if (wasActiveRef.current) {
      releaseReelPlayback(el);
      setProgress(0);
    } else {
      setReelVideoMuted(el, true);
    }
    wasActiveRef.current = active;

    const onPlaying = () => setVideoReady(true);
    const onTimeUpdate = () => {
      if (scrubbingRef.current) return;
      if (el.currentTime > 0) setVideoReady(true);
      const dur = el.duration;
      if (!Number.isFinite(dur) || dur <= 0) return;
      setProgress((el.currentTime / dur) * 100);
    };
    const onVisibility = () => {
      if (document.hidden) {
        if (active) releaseReelPlayback(el);
        return;
      }
      tryPlay();
    };

    if (active) {
      el.addEventListener('playing', onPlaying);
      el.addEventListener('timeupdate', onTimeUpdate);
    }
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      removeReadyWait();
      document.removeEventListener('visibilitychange', onVisibility);
      el.removeEventListener('playing', onPlaying);
      el.removeEventListener('timeupdate', onTimeUpdate);
      if (active) releaseReelPlayback(el);
    };
  }, [active, canPlay, readyToken, reel.id, preferMuted, failed]);

  function unmuteFromGesture() {
    const el = videoRef.current;
    unlockReelsAudio();
    setMutedByPolicy(false);
    if (!el) return;
    claimReelPlayback(el);
    attachReelHls(el);
    setReelVideoMuted(el, false);
    void el.play().catch(() => {
      releaseReelPlayback(el);
      relockReelsAudio();
      setMutedByPolicy(true);
    });
  }

  function seekToPercent(percent: number) {
    const el = videoRef.current;
    if (!el) return;
    const dur = el.duration;
    if (!Number.isFinite(dur) || dur <= 0) return;
    const next = (percent / 100) * dur;
    el.currentTime = next;
    setProgress(percent);
    setScrubPreview(formatClock(next));
  }

  function onScrubChange(percent: number) {
    if (!scrubbingRef.current) {
      scrubbingRef.current = true;
      setScrubbing(true);
    }
    seekToPercent(percent);
  }

  function onScrubCommit(percent: number) {
    seekToPercent(percent);
    scrubbingRef.current = false;
    setScrubbing(false);
  }

  const bottomPad = desk ? 'bottom-4' : 'bottom-[calc(82px+env(safe-area-inset-bottom))]';
  const displayProgress = active ? progress : 0;
  const tipBottom = desk ? 'bottom-36' : 'bottom-[calc(12.75rem+env(safe-area-inset-bottom))]';

  return (
    <div className={cn('relative h-full w-full shrink-0 snap-start overflow-hidden bg-black', className)}>
      {reel.posterUrl ? (
        <img
          src={reel.posterUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
          {...(inPlayerWindow ? { fetchPriority: 'high' as const } : {})}
        />
      ) : (
        <div className="absolute inset-0 bg-[image:var(--gradient-media-placeholder)]" />
      )}

      {inPlayerWindow ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- poster + mute tip until caption tracks ship
        <video
          ref={videoRef}
          poster={reel.posterUrl ?? undefined}
          className={cn(
            'absolute inset-0 h-full w-full object-contain transition-opacity duration-150',
            videoReady && active ? 'opacity-100' : 'opacity-0'
          )}
          playsInline
          loop
          muted={preferMuted}
          preload="auto"
          controls={false}
        />
      ) : null}

      {failed && active ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/70 px-6">
          <p className="text-center text-body-sm font-semibold text-white">Couldn’t play this reel.</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-field bg-white/14 px-4 py-2 text-2xs font-bold text-white"
          >
            Retry
          </button>
        </div>
      ) : null}

      {mutedByPolicy && active && !failed && !chromeHidden ? (
        <button
          type="button"
          onClick={unmuteFromGesture}
          className={cn(
            'absolute left-1/2 z-40 flex min-h-8 -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-3 py-1.5 text-3xs font-semibold text-white backdrop-blur-md transition-transform active:scale-95',
            tipBottom
          )}
          aria-label="Tap for sound"
        >
          <SpeakerIcon muted size="xs" className="shrink-0" />
          Tap for sound
        </button>
      ) : null}

      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 z-20 flex flex-col gap-2.5 transition-opacity',
          bottomPad,
          chromeHidden && 'opacity-0'
        )}
      >
        <div className="pointer-events-auto min-w-0 pr-[74px] pl-4">
          <ReelCaption key={reel.id} reel={reel} />
          <p className="mt-2 font-mono text-4xs font-bold tracking-wide text-white/55 uppercase">
            {formatDurationMs(reel.durationMs)} · {reel.views.toLocaleString()} views
          </p>
        </div>

        {canPlay && active ? (
          <div className="pointer-events-auto pr-[74px] pl-4">
            <Scrubber
              value={displayProgress}
              onValueChange={onScrubChange}
              onValueCommit={(vals) => onScrubCommit(vals[0] ?? displayProgress)}
              scrubbing={scrubbing}
              previewLabel={scrubPreview}
              className="group"
            />
          </div>
        ) : null}
      </div>

      <ReelActions
        reel={reel}
        isOwn={isOwn}
        onLike={onLike}
        onFollow={onFollow}
        onComments={onComments}
        onReport={onReport}
        onSave={onSave}
        onShare={onShare}
        className={cn(
          'absolute right-3 z-30 transition-opacity',
          bottomPad,
          chromeHidden && 'pointer-events-none opacity-0'
        )}
      />
    </div>
  );
}
