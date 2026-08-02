/**
 * TikTok-style floating reel upload progress (top-left thumbnail + circular %).
 * Tapeya brand gold treatment so the in-flight upload stays visible while browsing.
 */

import { useLocation } from 'react-router-dom';

import { clearReelUploadSession, useReelUploadSession } from '@/features/reels/reelUploadSessionStore';
import { NAVBAR_HERO_CONTROL_OFFSET, NAVBAR_OFFSET_CSS } from '@/lib/constants/layout';
import { isReelsFeedPath } from '@/lib/utils/routeUtils';

const RING_SIZE = 46;
const RING_STROKE = 3.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const GOLD = '#da9811';
const GOLD_BRIGHT = '#f0b94a';
const GOLD_TRACK = 'rgba(218, 152, 17, 0.28)';

/**
 * Above reels feed (z-30) and bottom nav (40); below dialogs/sheets (50) and navbar (50).
 * @see Dialog / BottomSheet z-50, Sidebar overlay z-[60]
 */
const CHIP_Z = 45;

/** Tab row ~44px under hero chrome offset — keep chip below reels feed controls. */
const REELS_FEED_CHIP_TOP = `calc(${NAVBAR_HERO_CONTROL_OFFSET} + 3.25rem)`;
const DEFAULT_CHIP_TOP = `calc(${NAVBAR_OFFSET_CSS} + 0.5rem)`;

function CircularProgress({ percent, label, tone = 'default' }) {
  const safe = Math.min(100, Math.max(0, Math.round(percent)));
  const offset = RING_CIRCUMFERENCE * (1 - safe / 100);
  const stroke = tone === 'error' ? '#FF453A' : tone === 'success' ? GOLD_BRIGHT : GOLD;
  const labelClass = tone === 'error' ? 'text-[#FF453A]' : tone === 'success' ? 'text-brand-hover' : 'text-brand-hover';

  return (
    <div className="relative flex size-11 items-center justify-center" aria-hidden>
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        className="-rotate-90 drop-shadow-[0_0_6px_rgba(218,152,17,0.55)]"
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      >
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} fill="none" stroke={GOLD_TRACK} strokeWidth={RING_STROKE} />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={stroke}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-200 ease-out"
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-[11px] font-extrabold tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${labelClass}`}
      >
        {label}
      </span>
    </div>
  );
}

function PreviewThumb({ src }) {
  return (
    <video
      src={src}
      muted
      playsInline
      preload="metadata"
      className="h-full w-full object-cover"
      onLoadedMetadata={(event) => {
        // Seek slightly so browsers paint a visible first frame (metadata alone is often black).
        try {
          const video = event.currentTarget;
          if (video.currentTime < 0.05) {
            video.currentTime = Math.min(0.1, (video.duration || 1) * 0.01);
          }
        } catch {
          // ignore seek failures on some platforms
        }
      }}
    >
      <track kind="captions" />
    </video>
  );
}

export function ReelUploadFloatingProgress() {
  const session = useReelUploadSession();
  const { pathname } = useLocation();
  const onReelsFeed = isReelsFeedPath(pathname);

  if (session.status === 'idle') {
    return null;
  }

  const safePercent = Math.min(100, Math.max(0, Math.round(session.percent)));
  const isError = session.status === 'error';
  const isSuccess = session.status === 'success';
  const isUploading = session.status === 'uploading';
  const centerLabel = isError ? '!' : isSuccess ? '✓' : `${safePercent}%`;
  const tone = isError ? 'error' : isSuccess ? 'success' : 'default';
  const ariaLabel = isError ? session.error || 'Upload failed' : isSuccess ? 'Upload complete' : `Uploading reel ${safePercent}%`;

  const handleClick = () => {
    if (isError || isSuccess) {
      clearReelUploadSession();
    }
  };

  const borderClass = isError ? 'border-[#FF453A]/70' : isSuccess ? 'border-white/25' : 'border-white/20';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isUploading}
      className="pointer-events-auto fixed left-3 disabled:cursor-default lg:left-[calc(280px+0.75rem)]"
      style={{
        zIndex: CHIP_Z,
        top: onReelsFeed ? REELS_FEED_CHIP_TOP : DEFAULT_CHIP_TOP,
      }}
      aria-live="polite"
      aria-busy={isUploading}
      aria-label={ariaLabel}
      title={isError ? session.error || 'Upload failed — tap to dismiss' : undefined}
    >
      <span
        className={`relative block h-[74px] w-[56px] overflow-hidden rounded-lg border bg-black shadow-[0_10px_28px_rgba(0,0,0,0.55)] ${borderClass}`}
      >
        {session.previewUrl ? <PreviewThumb src={session.previewUrl} /> : <span className="bg-surface block h-full w-full" />}
        <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/75 via-black/50 to-black/35">
          <CircularProgress percent={isSuccess || isError ? 100 : safePercent} label={centerLabel} tone={tone} />
        </span>
      </span>
    </button>
  );
}
