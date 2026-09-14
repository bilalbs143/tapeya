/**
 * Live broadcast viewer — single stream fetched by streamId.
 * Route: /live/broadcast/:streamId
 *
 * Layout:
 * - Match-linked: classic chrome (navbar + bottom nav) + 16:9 portrait player, always.
 * - Self-serve mobile, before/after playback (idle/starting/ended): same classic chrome
 *   + 16:9 player as match-linked — no special-casing.
 * - Self-serve mobile portrait, during playback (status === 'live'): hero mode — video expands
 *   from viewport top to just above the bottom nav; navbar becomes a transparent overlay on top
 *   of the video; bottom nav stays visible throughout.
 * - Self-serve mobile landscape (orientation === 'landscape'): match-like 16:9 + landscape
 *   rotate toggle allowed (docs/LIVE_STREAM_ORIENTATION.md).
 * - Landscape (phones): immersive overlay for match and landscape self-serve.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import { OpenInAppBanner } from '@/components/deepLinks/OpenInAppBanner';
import { useLiveBroadcastImmersiveDocument } from '@/features/stream/hooks/useLiveBroadcastImmersiveDocument';
import { useLiveStreamChannel } from '@/features/stream/hooks/useLiveStreamChannel';
import { useStreamPresenceChannel } from '@/features/stream/hooks/useStreamPresenceChannel';
import { nativeUnderlaySurfaceClass } from '@/features/stream/ios/iosNativeStreamLayout';
import { streamUsesIosNativeYoutubePlayer } from '@/features/stream/ios/streamUsesIosNativeYoutubePlayer';
import { LiveShareButton } from '@/features/stream/LiveShareButton';
import { LiveStatusBadge, LiveViewerCountBadge } from '@/features/stream/LiveStatusBadges';
import { setLiveViewerHeroMode } from '@/features/stream/liveViewerChromeStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useToast } from '@/hooks/useToast';
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
import { buildLiveBroadcastPath, buildLiveBroadcastShareUrl, shareLink } from '@/lib/share';
import {
  getStreamOrientation,
  isInteractiveIframePlayback,
  isInteractiveStreamUrl,
  isSelfServeLiveBroadcast,
} from '@/lib/utils/liveStreamUtils';
import { mapSystemSettingsByKey } from '@/lib/utils/settingsUtils';
import { hideYoutubeStreamOverlay } from '@/native/youtubeStreamOverlay';
import { getStreamOrientationOptions, useGetEnumsQuery } from '@/store/api/enumApi';
import { useGetLiveStreamQuery } from '@/store/api/liveApi';
import { useGetPublicSystemSettingsQuery } from '@/store/api/systemSettingsApi';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/selectors';
import { ListError } from '@/ui/ListState';

import LiveBroadcastItem from './LiveBroadcastItem';
import { useVanityViewerCount } from './useVanityViewerCount';

function BroadcastError({ onRetry }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-black px-4">
      <ListError message="Could not load stream." onRetry={onRetry} />
    </div>
  );
}

export default function LiveBroadcast() {
  const navigate = useNavigate();
  const toast = useToast();
  const { streamId } = useParams();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [isLandscape, setIsLandscape] = useState(false);
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  const {
    data: broadcast,
    isError,
    isLoading,
    refetch,
  } = useGetLiveStreamQuery({ streamId, authed: isAuthenticated }, { skip: !streamId });
  const { data: enums = {} } = useGetEnumsQuery();

  const streamStatus = broadcast?.stream?.status;
  const presenceEnabled = isAuthenticated && (streamStatus === 'live' || streamStatus === 'starting');
  const isSelfServe = isSelfServeLiveBroadcast(broadcast);
  const orientation = getStreamOrientation(broadcast);
  const orientationOptions = getStreamOrientationOptions(enums);
  // Portrait is the first StreamOrientationEnum case — hero only for that value.
  const portraitValue = orientationOptions[0]?.value;
  const isPortraitSelfServe = Boolean(isSelfServe && portraitValue && orientation === portraitValue);
  // Watch-URL streams (YouTube/HLS paste) are always 16:9 — never portrait hero.
  // Hero is only for mobile Go Live camera (no streaming_url).
  const isWatchUrlStream = Boolean(broadcast?.streaming_url?.trim());
  const isInteractiveWatchStream =
    isAuthenticated &&
    isWatchUrlStream &&
    (isInteractiveStreamUrl(broadcast?.streaming_url) || isInteractiveIframePlayback(broadcast?.stream?.playback));
  /** Hero mode — portrait self-serve mobile camera only while live. Guests stay on the teaser shell. */
  const heroMode =
    isAuthenticated && Boolean(broadcast) && isPortraitSelfServe && !isDesktop && streamStatus === 'live' && !isWatchUrlStream;
  /** Interactive iframe watch-URL: fill portrait player so the embed is large enough to tap play. */
  const fillInteractivePortrait = Boolean(isInteractiveWatchStream && !isDesktop && !isLandscape);

  const sharePath = streamId ? buildLiveBroadcastPath(streamId) : null;

  const handleShare = useCallback(async () => {
    if (!streamId) return;
    const result = await shareLink({
      url: buildLiveBroadcastShareUrl(streamId),
    });
    if (result === 'copy_link') {
      toast.success('Link copied.');
    }
  }, [streamId, toast]);

  useEffect(() => {
    // Wait until the stream payload is known so match streams don't briefly hide chrome.
    if (!broadcast && !isError) return undefined;
    setLiveViewerHeroMode(heroMode);
    return () => setLiveViewerHeroMode(false);
  }, [broadcast, isError, heroMode]);

  useLiveStreamChannel(streamId);
  const realViewerCount = useStreamPresenceChannel(streamId, presenceEnabled);
  const { data: settingsRows } = useGetPublicSystemSettingsQuery();
  const settingsByKey = useMemo(() => mapSystemSettingsByKey(settingsRows), [settingsRows]);
  const vanitySelfServe = settingsByKey.stream_vanity_viewer_self_serve === '1';
  // Match/admin: always vanity (when range set). Self-serve: only if setting enabled.
  const viewerCount = useVanityViewerCount(realViewerCount, {
    enabled: isAuthenticated && Boolean(broadcast) && (!isSelfServe || vanitySelfServe),
    settingsReady: settingsRows != null,
    streamId,
    startedAt: broadcast?.stream?.started_at ?? null,
    min: settingsByKey.stream_vanity_viewer_min,
    max: settingsByKey.stream_vanity_viewer_max,
  });

  useEffect(() => {
    setIsLandscape(false);
  }, [streamId]);

  useLayoutEffect(() => {
    void hideYoutubeStreamOverlay();
  }, [streamId]);

  useEffect(() => {
    return () => {
      void hideYoutubeStreamOverlay();
    };
  }, []);

  const toggleLandscape = useCallback(() => {
    // Guests stay on the teaser; portrait self-serve go-live stays portrait-only.
    if (!isAuthenticated) return;
    if (isPortraitSelfServe && !isWatchUrlStream) return;
    setIsLandscape((prev) => !prev);
  }, [isAuthenticated, isPortraitSelfServe, isWatchUrlStream]);

  useEffect(() => {
    if (!isAuthenticated || (isPortraitSelfServe && !isWatchUrlStream)) setIsLandscape(false);
  }, [isAuthenticated, isPortraitSelfServe, isWatchUrlStream]);

  const isMobileLandscape = isMobile && isLandscape;
  const immersiveMobileLandscape = isLandscape && !isDesktop;
  const isIosNativeUnderlay = isAuthenticated && streamUsesIosNativeYoutubePlayer(broadcast?.stream) && !isDesktop;
  const surfaceBg = nativeUnderlaySurfaceClass(isIosNativeUnderlay);
  // Portrait shell height animates when hero mode flips (live ↔ ended). Match streams are inert.
  const shellClass = isLandscape
    ? getLiveBroadcastShellClass(isLandscape, surfaceBg)
    : `${getLiveBroadcastShellClass(isLandscape, surfaceBg)} ${LIVE_BROADCAST_HERO_TRANSITION_CLASS}`;

  useLiveBroadcastImmersiveDocument(immersiveMobileLandscape, isIosNativeUnderlay);

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
        <LiveShareButton onClick={handleShare} />
      </>
    ),
    [centeredStatusContent, handleShare],
  );

  // Match classic: status overlays the 16:9 player (app navbar has no back button of its own,
  // but match pages don't need one here). Self-serve hero: the app navbar is a transparent
  // overlay with no back affordance, so the page still owns its own back + status row.
  // Mobile share lives on the comments toggle row — desktop keeps header share.
  const overlayHeaderSlot = heroMode
    ? portraitHeaderContent
    : isDesktop && !isLandscape
      ? desktopOverlayHeader
      : isLandscape
        ? portraitHeaderContent
        : centeredStatusContent;

  const showError = isError && !broadcast;
  const showLoading = Boolean(streamId) && isLoading && !broadcast && !isError;

  return (
    <div className={shellClass} style={shellStyle}>
      <div className={`relative h-full w-full overflow-hidden ${surfaceBg}`}>
        {sharePath ? <OpenInAppBanner path={sharePath} /> : null}
        {showError && <BroadcastError onRetry={refetch} />}
        {showLoading ? (
          <div className="flex h-full w-full items-center justify-center bg-black" role="status" aria-label="Loading stream">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
          </div>
        ) : null}
        {broadcast && (
          <LiveBroadcastItem
            broadcast={broadcast}
            isLandscape={isLandscape}
            isDesktop={isDesktop}
            isMobileLandscape={isMobileLandscape}
            onToggleLandscape={toggleLandscape}
            headerSlot={overlayHeaderSlot}
            statusHeaderSlot={centeredStatusContent}
            fillPortrait={heroMode || fillInteractivePortrait}
            allowVideoInteraction={isInteractiveWatchStream}
            selfServeChrome={isPortraitSelfServe && !isWatchUrlStream}
            onShare={handleShare}
          />
        )}
      </div>
    </div>
  );
}
