/**
 * Live broadcast viewer — single stream fetched by streamId.
 * Route: /live/broadcast/:streamId
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import { useLiveBroadcastImmersiveDocument } from '@/features/stream/hooks/useLiveBroadcastImmersiveDocument';
import { useLiveStreamChannel } from '@/features/stream/hooks/useLiveStreamChannel';
import { useStreamPresenceChannel } from '@/features/stream/hooks/useStreamPresenceChannel';
import { streamUsesIosNativeYoutubePlayer } from '@/features/stream/ios/streamUsesIosNativeYoutubePlayer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LG_MEDIA_QUERY, MOBILE_MEDIA_QUERY } from '@/lib/constants/layout';
import {
  getLiveBroadcastShellClass,
  LIVE_BROADCAST_LANDSCAPE_SHELL_STYLE,
  LIVE_BROADCAST_LANDSCAPE_SHELL_Z,
  LIVE_BROADCAST_SHELL_HEIGHT,
  LIVE_BROADCAST_SHELL_HEIGHT_DESKTOP,
} from '@/lib/constants/liveBroadcastLayout';
import { useGetLiveStreamQuery } from '@/store/api/liveApi';

import LiveBroadcastItem from './LiveBroadcastItem';
import { formatViewerCount, useVanityViewerCount } from './useVanityViewerCount';

const STATUS_BADGE = {
  live: { dot: 'animate-pulse bg-red-500', label: 'Live' },
  starting: { dot: 'animate-pulse bg-yellow-400', label: 'Starting…' },
  ended: { dot: 'bg-white/50', label: 'Ended' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_BADGE[status];
  if (!cfg) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/85 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
      <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} aria-hidden />
      {cfg.label}
    </span>
  );
}

function ViewerCountBadge({ viewerCount }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-black"
      aria-live="polite"
      aria-label={`${viewerCount} watching`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="black" strokeWidth="2" />
      </svg>
      <span key={formatViewerCount(viewerCount)} className="animate-[fadeSlideIn_0.4s_ease_forwards]">
        {formatViewerCount(viewerCount)}
      </span>
    </span>
  );
}

function BroadcastError({ onRetry }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-black px-4">
      <p className="text-[14px] text-white/60">Failed to load stream.</p>
      <button type="button" onClick={onRetry} className="text-[13px] font-medium text-white underline underline-offset-2">
        Try Again
      </button>
    </div>
  );
}

export default function LiveBroadcast() {
  const navigate = useNavigate();
  const { streamId } = useParams();
  const [isLandscape, setIsLandscape] = useState(false);
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  const { data: broadcast, isError, refetch } = useGetLiveStreamQuery(streamId, { skip: !streamId });

  const streamStatus = broadcast?.stream?.status;
  const presenceEnabled = streamStatus === 'live' || streamStatus === 'starting';

  useLiveStreamChannel(streamId);
  const realViewerCount = useStreamPresenceChannel(streamId, presenceEnabled);
  const viewerCount = useVanityViewerCount(realViewerCount);

  useEffect(() => {
    setIsLandscape(false);
  }, [streamId]);

  const toggleLandscape = useCallback(() => setIsLandscape((prev) => !prev), []);

  const isMobileLandscape = isMobile && isLandscape;
  const immersiveMobileLandscape = isLandscape && !isDesktop;
  const useInFlowHeader = !isDesktop && !isLandscape;
  const isIosNativeLandscape = streamUsesIosNativeYoutubePlayer(broadcast?.stream) && isLandscape;
  const surfaceBg = isIosNativeLandscape ? 'bg-transparent' : 'bg-black';
  const shellClass = getLiveBroadcastShellClass(isLandscape, surfaceBg);

  useLiveBroadcastImmersiveDocument(immersiveMobileLandscape, isIosNativeLandscape);

  const shellStyle = isLandscape
    ? {
        ...LIVE_BROADCAST_LANDSCAPE_SHELL_STYLE,
        zIndex: LIVE_BROADCAST_LANDSCAPE_SHELL_Z,
        height: '100dvh',
      }
    : { height: isDesktop ? LIVE_BROADCAST_SHELL_HEIGHT_DESKTOP : LIVE_BROADCAST_SHELL_HEIGHT };

  const centeredStatusContent = useMemo(
    () => (
      <div className="pointer-events-none flex min-w-0 flex-1 items-center justify-center gap-2">
        {streamStatus && <StatusBadge status={streamStatus} />}
        {presenceEnabled && <ViewerCountBadge viewerCount={viewerCount} />}
      </div>
    ),
    [streamStatus, presenceEnabled, viewerCount],
  );

  const portraitHeaderContent = useMemo(
    () => (
      <>
        <AppSubpageBackButton onClick={() => navigate(-1)} aria-label="Go back" className="pointer-events-auto" />
        {centeredStatusContent}
        <span className="h-7 w-7 shrink-0" aria-hidden />
      </>
    ),
    [navigate, centeredStatusContent],
  );

  const desktopOverlayHeader = useMemo(
    () => (
      <>
        <span className="h-7 w-7 shrink-0" aria-hidden />
        {centeredStatusContent}
        <span className="h-7 w-7 shrink-0" aria-hidden />
      </>
    ),
    [centeredStatusContent],
  );

  const overlayHeaderSlot =
    isDesktop || isLandscape ? (isDesktop || isMobileLandscape ? desktopOverlayHeader : portraitHeaderContent) : null;

  const showError = isError && !broadcast;

  return (
    <div className={shellClass} style={shellStyle}>
      <div className={`relative h-full w-full overflow-hidden ${surfaceBg} ${useInFlowHeader ? 'flex flex-col' : ''}`}>
        {useInFlowHeader && (
          <header className="relative z-20 flex shrink-0 items-center justify-between px-4 py-2">{portraitHeaderContent}</header>
        )}

        <div className={`relative overflow-hidden ${surfaceBg} ${useInFlowHeader ? 'min-h-0 flex-1' : 'h-full w-full'}`}>
          {showError && <BroadcastError onRetry={refetch} />}
          {broadcast && (
            <LiveBroadcastItem
              broadcast={broadcast}
              isLandscape={isLandscape}
              isDesktop={isDesktop}
              isMobileLandscape={isMobileLandscape}
              onToggleLandscape={toggleLandscape}
              headerSlot={overlayHeaderSlot}
              statusHeaderSlot={centeredStatusContent}
            />
          )}
        </div>
      </div>
    </div>
  );
}
