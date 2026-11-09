import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { SpeakerIcon } from '@/shared/ui/icons';
import { Scrubber } from '@/shared/ui/Scrubber';

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
  /** Immediate next slide — aggressive silent prime. */
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

/** iOS/WebView: property + attribute must agree or a demoted reel can keep leaking audio. */
function forceMute(video: HTMLVideoElement, muted: boolean) {
  video.muted = muted;
  video.defaultMuted = muted;
  if (muted) video.setAttribute('muted', '');
  else video.removeAttribute('muted');
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
  /** Hide WebView play-artwork / black frame until a real frame paints. */
  const [videoReady, setVideoReady] = useState(false);
  /** Tracks which reel / attach epoch the mute + reveal state belong to. */
  const [mediaEpoch, setMediaEpoch] = useState({ reelId: reel.id, readyToken: 0 });

  const role = active ? 'active' : isNext ? 'next' : 'warm';
  const { mode, failed, retry, readyToken } = useReelHls(videoRef, reel.playback, {
    enabled: inPlayerWindow,
    role,
  });
  const canPlay = mode != null && !failed;
  const preferMuted = active ? !isReelsAudioUnlocked() && mutedByPolicy : true;

  // Reset mute tip / poster reveal when the reel or HLS attach epoch changes.
  // Adjust during render (React docs) — avoid setState-in-effect cascading renders.
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
    if (!el || !canPlay) return undefined;

    let cancelled = false;
    // Close over this effect's active — stale play() promises must bail after swipe.
    const effectIsActive = active;

    const tryPlay = () => {
      if (cancelled || failed || !effectIsActive) return;
      // Unmuted first (or after session unlock); mute only when autoplay blocks sound.
      forceMute(el, preferMuted);
      const attempt = el.play();
      if (!attempt || typeof attempt.then !== 'function') return;
      void attempt
        .then(() => {
          // Stale generation: demote path owns mute/pause — just bail.
          if (cancelled || !effectIsActive) return;
          if (!el.muted) unlockReelsAudio();
        })
        .catch(() => {
          if (cancelled || !effectIsActive) return;
          if (el.muted) return;
          forceMute(el, true);
          setMutedByPolicy(true);
          void el.play().catch(() => undefined);
        });
    };

    if (effectIsActive) {
      tryPlay();
    } else {
      // Always mute off-active. Pause only when leaving active so readyToken
      // updates do not cancel silent neighbor priming.
      forceMute(el, true);
      if (wasActiveRef.current) {
        el.pause();
        setProgress(0);
      }
    }
    wasActiveRef.current = effectIsActive;

    const onVisibility = () => {
      if (document.hidden) {
        if (effectIsActive) el.pause();
        return;
      }
      tryPlay();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active, canPlay, readyToken, reel.id, preferMuted, failed]);
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !canPlay || !active) return undefined;

    function onPlaying() {
      setVideoReady(true);
    }

    function onTimeUpdate() {
      if (!el || scrubbingRef.current) return;
      if (el.currentTime > 0) setVideoReady(true);
      const dur = el.duration;
      if (!Number.isFinite(dur) || dur <= 0) return;
      setProgress((el.currentTime / dur) * 100);
    }

    el.addEventListener('playing', onPlaying);
    el.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      el.removeEventListener('playing', onPlaying);
      el.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [reel.id, canPlay, readyToken, active]);

  function unmuteFromGesture() {
    const el = videoRef.current;
    unlockReelsAudio();
    setMutedByPolicy(false);
    if (!el) return;
    forceMute(el, false);
    void el.play().catch(() => {
      forceMute(el, true);
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

  // Phone: clear BottomNav; scrubber sits under the action rail so keep `pr` in sync with caption.
  const bottomPad = desk ? 'bottom-4' : 'bottom-[calc(82px+env(safe-area-inset-bottom))]';
  const displayProgress = active ? progress : 0;
  // Instagram-style: bottom-center pill, slightly above caption / BottomNav.
  const tipBottom = desk ? 'bottom-36' : 'bottom-[calc(12.75rem+env(safe-area-inset-bottom))]';

  return (
    <div className={cn('relative h-full w-full shrink-0 snap-start overflow-hidden bg-black', className)}>
      {/* Letterbox non-9:16 clips — same as app ReelItem MEDIA_LAYER (object-contain, no forced crop). */}
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

      {/*
        Caption + scrubber: full-bleed layout with right gutter for the action rail.
        Parent is pointer-events-none so the empty gutter does not steal Share/Save taps
        (actions sit at a lower z-index otherwise).
      */}
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
