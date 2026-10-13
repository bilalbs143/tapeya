/**
 * Live broadcast player — portrait or 90° landscape inside the parent player zone.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useLocation, useNavigate } from 'react-router-dom';

import { CommentInputRow } from '@/features/stream/CommentInputRow';
import CommentList from '@/features/stream/CommentList';
import { FloatingHeartsOverlay } from '@/features/stream/FloatingHeartsOverlay';
import { useFloatingHearts } from '@/features/stream/hooks/useFloatingHearts';
import { useStreamComments } from '@/features/stream/hooks/useStreamComments';
import { IosLandscapeStreamChrome } from '@/features/stream/ios/IosLandscapeStreamChrome';
import { nativeUnderlaySurfaceClass } from '@/features/stream/ios/iosNativeStreamLayout';
import { streamUsesIosNativeYoutubePlayer } from '@/features/stream/ios/streamUsesIosNativeYoutubePlayer';
import { StreamPlayer } from '@/features/stream/StreamPlayer';
import { useToast } from '@/hooks/useToast';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import {
  LIVE_BROADCAST_BOTTOM_OVERLAY,
  LIVE_BROADCAST_CONTROLS_OVERLAY_Z,
  LIVE_BROADCAST_HEADER_OVERLAY_Z,
  LIVE_BROADCAST_HEADER_SCRIM,
  LIVE_BROADCAST_HEADER_TOP_PADDING,
  LIVE_BROADCAST_IMMERSIVE_TOGGLE_Z,
  LIVE_BROADCAST_LANDSCAPE_HEADER_ROW,
  LIVE_BROADCAST_TOGGLE_BTN,
} from '@/lib/constants/liveBroadcastLayout';
import { getInitials } from '@/lib/utils/displayUtils';
import { mapSystemSettingsByKey } from '@/lib/utils/settingsUtils';
import { useSendLiveCommentMutation, useSendLiveHeartMutation } from '@/store/api/liveApi';
import { useGetPublicSystemSettingsQuery } from '@/store/api/systemSettingsApi';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/selectors';

import LandscapeRotatedStage from './LandscapeRotatedStage';

const maxMinIcon = `${CLOUDFRONT_APP_BASE}/images/icons/max-min-icon.svg`;
const commentIcon = `${CLOUDFRONT_APP_BASE}/images/icons/comment-icon.svg`;
const shareIcon = `${CLOUDFRONT_APP_BASE}/images/icons/feed-share.svg`;

function ShareToggleButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className={LIVE_BROADCAST_TOGGLE_BTN} aria-label="Share live stream">
      <img src={shareIcon} alt="" className="h-5 w-5 shrink-0 object-contain brightness-0 invert" aria-hidden />
    </button>
  );
}

function LandscapeExitToggle({ onClick, onShare }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="pointer-events-none fixed right-0 bottom-0 flex items-center gap-2 p-4 pb-[calc(env(safe-area-inset-bottom)+12px)]"
      style={{ zIndex: LIVE_BROADCAST_IMMERSIVE_TOGGLE_Z }}
    >
      {onShare ? (
        <div className="pointer-events-auto">
          <ShareToggleButton onClick={onShare} />
        </div>
      ) : null}
      <button
        type="button"
        onClick={onClick}
        className={`pointer-events-auto touch-manipulation ${LIVE_BROADCAST_TOGGLE_BTN}`}
        aria-label="Rotate to portrait"
      >
        <img src={maxMinIcon} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
      </button>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// BroadcastFloatingToggles
// ---------------------------------------------------------------------------

function BroadcastFloatingToggles({
  className = '',
  isLandscape,
  onToggleLayout,
  bottomPanelVisible,
  onToggleBottomPanel,
  onShare,
}) {
  return (
    <div className={`flex shrink-0 items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onToggleBottomPanel}
        className={`${LIVE_BROADCAST_TOGGLE_BTN} ${bottomPanelVisible ? '' : 'ring-1 ring-white/25'}`}
        aria-label={bottomPanelVisible ? 'Hide match info and comments' : 'Show match info and comments'}
        aria-pressed={bottomPanelVisible}
      >
        <img
          src={commentIcon}
          alt=""
          className={`h-5 w-5 shrink-0 object-contain ${bottomPanelVisible ? 'opacity-100' : 'opacity-45'}`}
          aria-hidden
        />
      </button>
      {onShare ? <ShareToggleButton onClick={onShare} /> : null}
      <button
        type="button"
        onClick={onToggleLayout}
        className={LIVE_BROADCAST_TOGGLE_BTN}
        aria-label={isLandscape ? 'Rotate to portrait' : 'Rotate to landscape'}
      >
        <img src={maxMinIcon} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BroadcastBottomPanel
// ---------------------------------------------------------------------------

function BroadcastBottomPanel({
  messages,
  chatEnabled,
  streamStatus,
  inputDisabled,
  onSend,
  onSendHeart,
  onToggleLayout,
  bottomPanelVisible,
  onToggleBottomPanel,
  hideFloatingToggles = false,
  onShare,
}) {
  const showChat = bottomPanelVisible || hideFloatingToggles;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col gap-2">
      {showChat && chatEnabled ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <CommentList messages={messages} fillHeight />
        </div>
      ) : (
        <div className="min-h-0 flex-1" aria-hidden />
      )}

      {streamStatus === 'ended' && showChat && (
        <div className="min-w-0 shrink-0 px-1">
          <p className="mt-1 text-[11px] text-white/60 drop-shadow">Stream has ended</p>
        </div>
      )}

      {hideFloatingToggles ? (
        onShare ? (
          <div className="flex shrink-0 justify-end">
            <ShareToggleButton onClick={onShare} />
          </div>
        ) : null
      ) : (
        <div className={`flex shrink-0 gap-2 ${bottomPanelVisible ? 'items-start' : 'items-center justify-end'}`}>
          <BroadcastFloatingToggles
            className={bottomPanelVisible ? 'ml-auto shrink-0' : ''}
            isLandscape={false}
            onToggleLayout={onToggleLayout}
            bottomPanelVisible={bottomPanelVisible}
            onToggleBottomPanel={onToggleBottomPanel}
            onShare={onShare}
          />
        </div>
      )}

      {showChat && chatEnabled ? (
        <div className="shrink-0">
          <CommentInputRow onSend={onSend} onSendHeart={onSendHeart} disabled={inputDisabled} />
        </div>
      ) : null}
    </div>
  );
}

function GuestWatchGate({ posterUrl, title, streamStatus, onPlay, pending = false }) {
  const ended = streamStatus === 'ended';
  const cta = ended ? 'Sign in to open' : 'Sign in to watch live';
  const hint = ended ? 'This stream has ended' : null;

  return (
    <div className="absolute inset-0 bg-black">
      {posterUrl ? (
        <img src={posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black" aria-hidden />
      )}
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
        {pending ? (
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white"
            role="status"
            aria-label="Loading stream"
          />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform active:scale-95"
            aria-label={cta}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
        {title ? <p className="max-w-[16rem] text-center text-[13px] font-semibold text-white drop-shadow">{title}</p> : null}
        {!pending && hint ? <p className="text-[12px] font-medium text-white/75">{hint}</p> : null}
        {!pending ? <p className="text-[12px] font-medium text-white/75">{cta}</p> : null}
        {pending ? <p className="text-[12px] font-medium text-white/75">Loading stream…</p> : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BroadcastViewport — portrait: 16:9 + letterbox comments; landscape/guest: fill
// ---------------------------------------------------------------------------

function BroadcastViewport({
  stream,
  posterUrl = null,
  bottomPanel,
  isLandscape,
  floatingHearts,
  onHeartEnd,
  headerSlot,
  isDesktop,
  isIosNativeUnderlay = false,
  hideHeaderOverlay = false,
  /** Hero / watch-gate: header clears the transparent navbar over the player. */
  fillPortrait = false,
  /** Non-YouTube iframe embeds — keep iframe tappable (incl. landscape). */
  allowVideoInteraction = false,
  guestPreview = false,
  guestTitle = null,
  guestStreamStatus = null,
  guestPending = false,
  onGuestPlay,
  onShare,
}) {
  const blockLandscapeVideoPointer = !isDesktop && isLandscape && !allowVideoInteraction;
  const portraitWatch = !guestPreview && !isDesktop && !isLandscape;
  const surfaceClass = nativeUnderlaySurfaceClass(isIosNativeUnderlay);
  const headerTopPadding = isLandscape && !isDesktop ? '8px' : fillPortrait ? LIVE_BROADCAST_HEADER_TOP_PADDING : '10px';

  const headerOverlay =
    headerSlot && !hideHeaderOverlay ? (
      <div
        className={isLandscape ? LIVE_BROADCAST_LANDSCAPE_HEADER_ROW : LIVE_BROADCAST_HEADER_SCRIM}
        style={{ zIndex: LIVE_BROADCAST_HEADER_OVERLAY_Z }}
      >
        <div
          className={`pointer-events-none relative flex items-center ${isLandscape && !isDesktop ? 'justify-center' : 'justify-between'}`}
          style={{ paddingTop: headerTopPadding }}
        >
          {headerSlot}
        </div>
      </div>
    ) : null;

  if (portraitWatch) {
    return (
      <div className={`relative flex size-full flex-col overflow-hidden ${surfaceClass}`}>
        <div className="relative w-full shrink-0">
          <StreamPlayer stream={stream} posterUrl={posterUrl} className="w-full" fill={false} isLandscape={false} />
          <FloatingHeartsOverlay hearts={floatingHearts} onHeartEnd={onHeartEnd} />
          {headerOverlay}
        </div>
        <div
          className="pointer-events-auto relative flex min-h-0 flex-1 flex-col bg-black px-4 py-2"
          style={{ zIndex: LIVE_BROADCAST_CONTROLS_OVERLAY_Z }}
        >
          {bottomPanel}
        </div>
      </div>
    );
  }

  const videoLayer = guestPreview ? (
    <GuestWatchGate
      posterUrl={posterUrl}
      title={guestTitle}
      streamStatus={guestStreamStatus}
      onPlay={onGuestPlay}
      pending={guestPending}
    />
  ) : (
    <div className={`absolute inset-0 ${blockLandscapeVideoPointer ? 'pointer-events-none [&_iframe]:pointer-events-none' : ''}`}>
      <StreamPlayer stream={stream} posterUrl={posterUrl} className="h-full w-full" fill isLandscape={isLandscape} />
    </div>
  );

  return (
    <div className={`relative size-full overflow-hidden ${surfaceClass}`}>
      {videoLayer}
      {headerOverlay}
      {guestPreview && onShare && !isDesktop && (
        <div className={LIVE_BROADCAST_BOTTOM_OVERLAY} style={{ zIndex: LIVE_BROADCAST_CONTROLS_OVERLAY_Z }}>
          <div className="pointer-events-auto flex justify-end">
            <ShareToggleButton onClick={onShare} />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LiveBroadcastItem({
  broadcast,
  isLandscape,
  isDesktop = false,
  isMobileLandscape = false,
  onToggleLandscape,
  headerSlot = null,
  /** LIVE + viewer badges only — used by iOS landscape chrome (no back button / spacers). */
  statusHeaderSlot = null,
  /** Hero / watch-gate: header clears the transparent navbar. */
  fillPortrait = false,
  /** Self-serve go-live watch — no comment/landscape toggles; comments always visible. */
  selfServeChrome = false,
  /** Interactive iframe embed — keep iframe tappable in landscape. */
  allowVideoInteraction = false,
  onShare,
}) {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const myUserId = useAppSelector((s) => s.auth?.user?.id ?? null);
  const myAvatar = useAppSelector((s) => s.auth?.user?.avatar_url ?? s.auth?.user?.avatar ?? null);
  const myInitials = useAppSelector((s) => getInitials(s.auth?.user?.name, s.auth?.user?.nickname));
  const [bottomPanelVisible, setBottomPanelVisible] = useState(true);
  const [sendCooldown, setSendCooldown] = useState(false);
  const cooldownTimerRef = useRef(null);
  const { hearts: floatingHearts, spawnBurst, removeHeart, clearHearts } = useFloatingHearts();

  const streamId = broadcast?.id ?? null;
  const streamStatus = broadcast?.stream?.status;
  const streamChatActive = streamStatus === 'live' || streamStatus === 'starting';
  const isGuest = !isAuthenticated;
  const stream = broadcast?.stream ?? null;
  const awaitingPlayback = isAuthenticated && (streamStatus === 'live' || streamStatus === 'ended') && !stream?.playback;
  const showWatchGate = isGuest || awaitingPlayback;

  const { data: settingsRows } = useGetPublicSystemSettingsQuery();
  const settingsByKey = useMemo(() => mapSystemSettingsByKey(settingsRows), [settingsRows]);
  const liveChatGloballyEnabled = settingsByKey.live_chat_enabled !== '0';

  const chatEnabled = !showWatchGate && liveChatGloballyEnabled && streamChatActive;
  const handleRemoteHeart = useCallback(
    (payload) => {
      if (isMobileLandscape) return;
      if (payload?.user_id != null && myUserId != null && Number(payload.user_id) === Number(myUserId)) {
        return;
      }
      spawnBurst(payload?.avatar_url ?? null, payload?.initials ?? '?');
    },
    [spawnBurst, isMobileLandscape, myUserId],
  );
  const { messages } = useStreamComments(streamId, chatEnabled, handleRemoteHeart);
  const [sendComment, { isLoading: isSending }] = useSendLiveCommentMutation();
  const [sendHeart] = useSendLiveHeartMutation();

  useEffect(() => {
    clearHearts();
  }, [isLandscape, isMobileLandscape, clearHearts]);

  useEffect(
    () => () => {
      if (cooldownTimerRef.current) {
        window.clearTimeout(cooldownTimerRef.current);
      }
    },
    [],
  );

  const handleSignIn = useCallback(() => {
    navigate('/login', { state: { from: location } });
  }, [location, navigate]);

  const handleSendHeart = useCallback(() => {
    if (!streamId || !chatEnabled) return;
    spawnBurst(myAvatar, myInitials);
    sendHeart({ streamId });
  }, [spawnBurst, myAvatar, myInitials, streamId, chatEnabled, sendHeart]);

  const handleSend = useCallback(
    async (text) => {
      const body = text.trim();
      if (!body || !streamId || !chatEnabled || isSending || sendCooldown) {
        return;
      }

      setSendCooldown(true);
      cooldownTimerRef.current = window.setTimeout(() => {
        setSendCooldown(false);
      }, 2000);

      try {
        await sendComment({ streamId, body }).unwrap();
      } catch (err) {
        const type = err?.data?.type;
        if (type === 'TOO_MANY_REQUESTS') {
          toast.error('Slow down a little');
        }
      }
    },
    [streamId, chatEnabled, isSending, sendCooldown, sendComment, toast],
  );

  const toggleBottomPanel = useCallback(() => setBottomPanelVisible((v) => !v), []);

  const posterUrl = broadcast?.thumbnail_url?.trim() || null;
  const inputDisabled = isSending || sendCooldown;
  const usesIosNativePlayer = !showWatchGate && streamUsesIosNativeYoutubePlayer(stream);
  const isIosNativeLandscape = usesIosNativePlayer && isLandscape;
  const isIosNativeUnderlay = usesIosNativePlayer && !isDesktop;
  const panelVisible = selfServeChrome || bottomPanelVisible;
  const surfaceClass = nativeUnderlaySurfaceClass(isIosNativeUnderlay);

  const bottomPanel = (
    <BroadcastBottomPanel
      messages={messages}
      chatEnabled={chatEnabled}
      streamStatus={streamStatus}
      inputDisabled={inputDisabled}
      onSend={handleSend}
      onSendHeart={handleSendHeart}
      onToggleLayout={onToggleLandscape}
      bottomPanelVisible={panelVisible}
      onToggleBottomPanel={toggleBottomPanel}
      hideFloatingToggles={selfServeChrome}
      onShare={onShare}
    />
  );

  const viewport = (
    <BroadcastViewport
      stream={stream}
      posterUrl={posterUrl}
      bottomPanel={bottomPanel}
      isLandscape={isLandscape}
      floatingHearts={floatingHearts}
      onHeartEnd={removeHeart}
      headerSlot={isMobileLandscape && !isIosNativeLandscape ? (statusHeaderSlot ?? headerSlot) : headerSlot}
      isDesktop={isDesktop}
      isIosNativeUnderlay={isIosNativeUnderlay}
      hideHeaderOverlay={isIosNativeLandscape && isMobileLandscape}
      fillPortrait={fillPortrait || showWatchGate}
      allowVideoInteraction={allowVideoInteraction}
      guestPreview={showWatchGate}
      guestTitle={broadcast?.title ?? null}
      guestStreamStatus={streamStatus}
      guestPending={awaitingPlayback}
      onGuestPlay={handleSignIn}
      onShare={onShare}
    />
  );

  const showFixedLandscapeToggle = !selfServeChrome && isLandscape && !isDesktop && !isIosNativeLandscape;

  return (
    <div className={`relative h-full w-full overflow-hidden ${surfaceClass}`}>
      {isIosNativeLandscape && isMobileLandscape && (
        <IosLandscapeStreamChrome headerSlot={statusHeaderSlot ?? headerSlot} onToggleLandscape={onToggleLandscape} />
      )}

      <LandscapeRotatedStage
        rotated={isLandscape}
        iosNativeLandscape={isIosNativeLandscape}
        iosNativeUnderlay={isIosNativeUnderlay}
      >
        {viewport}
      </LandscapeRotatedStage>

      {showFixedLandscapeToggle && <LandscapeExitToggle onClick={onToggleLandscape} onShare={onShare} />}
    </div>
  );
}
