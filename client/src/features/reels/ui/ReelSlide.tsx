import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { SpeakerIcon } from '@/shared/ui/icons';
import { Scrubber } from '@/shared/ui/Scrubber';
import { Spinner } from '@/shared/ui/Spinner';

import { registerReelVideo, useReelAttach, useReelPlay } from '../lib/playback';
import { unlockReelsAudio } from '../lib/reelsAudioSession';
import type { Reel } from '../model/schemas';
import { formatDurationMs } from '../model/schemas';
import { ReelActions } from './ReelActions';
import { ReelCaption } from './ReelCaption';

type ReelSlideProps = {
  reel: Reel;
  active: boolean;
  /** Mount a live player (active + neighbors in the player window). */
  inPlayerWindow?: boolean | undefined;
  /** Immediate next slide — attach ahead of the snap. */
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
  const [progress, setProgress] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubPreview, setScrubPreview] = useState('0:00');
  const scrubbingRef = useRef(false);
  /** True only after unmuted autoplay was blocked — shows Tap for Sound. */
  const [mutedByPolicy, setMutedByPolicy] = useState(false);
  /** Hide WebView play-artwork until a real frame paints. */
  const [videoReady, setVideoReady] = useState(false);
  /** Mid-play stall (waiting event after first frame). */
  const [stalled, setStalled] = useState(false);
  const [mediaEpoch, setMediaEpoch] = useState({ reelId: reel.id, readyToken: 0 });
  /** Delayed start spinner — key clears show on render when wait ends (no sync setState-in-effect). */
  const [startHint, setStartHint] = useState({ key: '', show: false });

  // Window is active + next only — farther slides stay poster/prefetch.
  const playerEnabled = Boolean(inPlayerWindow && (active || isNext));
  const role = active ? 'active' : 'next';
  const { mode, failed, retry, readyToken, sourceUrl } = useReelAttach(videoRef, reel.playback, {
    enabled: playerEnabled,
    role,
  });
  const canPlay = mode != null && !failed;
  const needsStartHint = active && !failed && !videoReady && inPlayerWindow;
  const startHintKey = needsStartHint ? `${reel.id}:start` : '';

  const { preferMuted, unmuteFromGesture: unmutePlay } = useReelPlay(videoRef, {
    active,
    canPlay,
    failed,
    readyToken,
    sourceUrl,
    mutedByPolicy,
    scrubbingRef,
    onMutedByPolicy: () => setMutedByPolicy(true),
    onPlaying: () => {
      setVideoReady(true);
      setStalled(false);
    },
    onWaiting: () => setStalled(true),
    onTimeUpdate: setProgress,
    onBecameInactive: () => setProgress(0),
  });

  // Reset tip / reveal when reel or attach epoch changes (render-time — avoid setState-in-effect).
  if (reel.id !== mediaEpoch.reelId || readyToken !== mediaEpoch.readyToken) {
    setMediaEpoch({ reelId: reel.id, readyToken });
    setVideoReady(false);
    setStalled(false);
    if (reel.id !== mediaEpoch.reelId) {
      setMutedByPolicy(false);
      setProgress(0);
    }
  }

  if (startHint.key !== startHintKey) {
    setStartHint({ key: startHintKey, show: false });
  }

  // Soft start indicator — only the delayed `true` lives in an effect.
  useEffect(() => {
    if (!startHintKey) return undefined;
    const timer = window.setTimeout(() => {
      setStartHint((prev) => (prev.key === startHintKey ? { ...prev, show: true } : prev));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [startHintKey]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !inPlayerWindow) return undefined;
    return registerReelVideo(el);
  }, [inPlayerWindow, reel.id, canPlay]);

  function unmuteFromGesture() {
    unlockReelsAudio();
    setMutedByPolicy(false);
    unmutePlay();
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
  const showWaitSpinner = active && !failed && !chromeHidden && ((startHint.show && needsStartHint) || stalled);

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

      {showWaitSpinner ? (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <Spinner size="md" tone="media" label={stalled ? 'Buffering' : 'Starting reel'} />
        </div>
      ) : null}

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
