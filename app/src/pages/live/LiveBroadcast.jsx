/**
 * Live broadcast viewer — single stream fetched by streamId.
 * Route: /live/broadcast/:streamId
 *
 * Layout:
 * - Match-linked: classic chrome (navbar + bottom nav) + 16:9 portrait player, always.
 * - Self-serve mobile, before/after playback (idle/starting/ended): same classic chrome
 *   + 16:9 player as match-linked — no special-casing.
 * - Self-serve mobile, during playback (status === 'live'): hero mode — video expands from
 *   viewport top to just above the bottom nav; navbar becomes a transparent overlay on top
 *   of the video (same pattern as the Hero Banner on /upcoming-tournaments/:id); bottom nav
 *   stays visible throughout.
 * - Landscape (phones): immersive overlay for both types — unaffected by hero mode, and
 *   already disabled entirely for self-serve streams.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import { useLiveBroadcastImmersiveDocument } from '@/features/stream/hooks/useLiveBroadcastImmersiveDocument';
import { useLiveStreamChannel } from '@/features/stream/hooks/useLiveStreamChannel';
import { useStreamPresenceChannel } from '@/features/stream/hooks/useStreamPresenceChannel';
import { streamUsesIosNativeYoutubePlayer } from '@/features/stream/ios/streamUsesIosNativeYoutubePlayer';
import { LiveStatusBadge, LiveViewerCountBadge } from '@/features/stream/LiveStatusBadges';
import { setLiveViewerHeroMode } from '@/features/stream/liveViewerChromeStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LG_MEDIA_QUERY, MOBILE_MEDIA_QUERY } from '@/lib/constants/layout';
import {
  getLiveBroadcastShellClass,
  LIVE_BROADCAST_HERO_HEIGHT,
  LIVE_BROADCAST_HERO_TRANSITION_CLASS,
  LIVE_BROADCAST_IMMERSIVE_HEIGHT,
  LIVE_BROADCAST_LANDSCAPE_SHELL_STYLE,
  LIVE_BROADCAST_LANDSCAPE_SHELL_Z,
  LIVE_BROADCAST_SHELL_HEIGHT,
  LIVE_BROADCAST_SHELL_HEIGHT_DESKTOP,
} from '@/lib/constants/liveBroadcastLayout';
import { isSelfServeLiveBroadcast } from '@/lib/utils/liveStreamUtils';
import { useGetLiveStreamQuery } from '@/store/api/liveApi';

import LiveBroadcastItem from './LiveBroadcastItem';
import { useVanityViewerCount } from './useVanityViewerCount';

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
  const isSelfServe = isSelfServeLiveBroadcast(broadcast);
  /** Hero mode — self-serve mobile, only while actually live; match streams never qualify. */
  const heroMode = Boolean(broadcast) && isSelfServe && !isDesktop && streamStatus === 'live';

  useEffect(() => {
    // Wait until the stream payload is known so match streams don't briefly hide chrome.
    if (!broadcast && !isError) return undefined;
    setLiveViewerHeroMode(heroMode);
    return () => setLiveViewerHeroMode(false);
  }, [broadcast, isError, heroMode]);

  useLiveStreamChannel(streamId);
  const realViewerCount = useStreamPresenceChannel(streamId, presenceEnabled);
  const viewerCount = useVanityViewerCount(realViewerCount);

  useEffect(() => {
    setIsLandscape(false);
  }, [streamId]);

  const toggleLandscape = useCallback(() => {
    // Self-serve go-live watch stays portrait — no landscape / fullscreen toggle.
    if (isSelfServe) return;
    setIsLandscape((prev) => !prev);
  }, [isSelfServe]);

  useEffect(() => {
    if (isSelfServe) setIsLandscape(false);
  }, [isSelfServe]);

  const isMobileLandscape = isMobile && isLandscape;
  const immersiveMobileLandscape = isLandscape && !isDesktop;
  const isIosNativeLandscape = streamUsesIosNativeYoutubePlayer(broadcast?.stream) && isLandscape;
  const surfaceBg = isIosNativeLandscape ? 'bg-transparent' : 'bg-black';
  // Portrait shell height changes once when hero mode flips on/off (stream goes live / ends) —
  // animate that instead of snapping. Inert for landscape and for match streams (their height
  // formula never changes based on status).
  const shellClass = isLandscape
    ? getLiveBroadcastShellClass(isLandscape, surfaceBg)
    : `${getLiveBroadcastShellClass(isLandscape, surfaceBg)} ${LIVE_BROADCAST_HERO_TRANSITION_CLASS}`;

  useLiveBroadcastImmersiveDocument(immersiveMobileLandscape, isIosNativeLandscape);

  const shellStyle = isLandscape
    ? {
      ...LIVE_BROADCAST_LANDSCAPE_SHELL_STYLE,
      zIndex: LIVE_BROADCAST_LANDSCAPE_SHELL_Z,
      height: LIVE_BROADCAST_IMMERSIVE_HEIGHT,
    }
    : heroMode
      ? { height: LIVE_BROADCAST_HERO_HEIGHT }
      : { height: isDesktop ? LIVE_BROADCAST_SHELL_HEIGHT_DESKTOP : LIVE_BROADCAST_SHELL_HEIGHT };

  const centeredStatusContent = useMemo(
    () => (
      <div className="pointer-events-none flex min-w-0 flex-1 items-center justify-center gap-2">
        {streamStatus && <LiveStatusBadge status={streamStatus} />}
        {presenceEnabled && <LiveViewerCountBadge viewerCount={viewerCount} />}
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

  // Match classic: status overlays the 16:9 player (app navbar has no back button of its own,
  // but match pages don't need one here). Self-serve hero: the app navbar is a transparent
  // overlay with no back affordance, so the page still owns its own back + status row.
  const overlayHeaderSlot = heroMode
    ? portraitHeaderContent
    : isDesktop && !isLandscape
      ? desktopOverlayHeader
      : isLandscape
        ? portraitHeaderContent
        : centeredStatusContent;

  const showError = isError && !broadcast;

  return (
    <div className={shellClass} style={shellStyle}>
      <div className={`relative h-full w-full overflow-hidden ${surfaceBg}`}>
        <div className={`relative h-full w-full overflow-hidden ${surfaceBg}`}>
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
              fillPortrait={heroMode}
              selfServeChrome={isSelfServe}
            />
          )}
        </div>
      </div>
    </div>
  );
}
